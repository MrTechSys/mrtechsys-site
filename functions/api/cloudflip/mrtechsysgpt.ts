// functions/api/cloudflip/mrtechsysgpt.ts

import { readJsonBody } from '../../../shared/emailSafety';
import { aiLimits, consumeLimits, limitResponse } from '../../../shared/rateLimit';

interface Env {
  OPENAI_API_KEY?: string;
  AI?: any; // Cloudflare Workers AI binding
  DB?: D1Database; // rate_counters (shared/rateLimit.ts)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    let message = '';
    try {
      message = String((await readJsonBody(request))?.message ?? '');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    }

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }
    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Please keep messages under 2000 characters.' }), { status: 400 });
    }
    // Public: the same AI limits as every other AI endpoint on the site (shared/rateLimit.ts).
    const limited = await consumeLimits(env.DB, aiLimits(request));
    if (!limited.ok) return limitResponse(limited);

    const lower = message.toLowerCase();

    // 1. Cloudflare Workers AI (Priority #1 Default LLM Engine)
    if (env.AI) {
      try {
        let aiResponse: any = null;
        try {
          aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
            messages: [
              { 
                role: 'system', 
                content: `You are MrTechSysGPT Assistant, the senior cloud and digital transformation architect for MrTechSys.
Role: You provide high-level, practical architecture advisory directly to small business owners and technical leads who have submitted their setup questions.
Tone: Texas-rooted simplicity, deep enterprise architecture authority, direct, actionable, encouraging.
Philosophy: "Free first, scale smart." We help businesses eliminate operational friction and deploy resilient, multi-cloud platforms starting on $0 free allocations with hard tripwire budget alarms.
Key Principles:
1. Always address the user's specific business questions and operational bottlenecks directly with concrete steps.
2. When workloads (Web, API, DB, AI, Storage, Auth) and cloud providers (Cloudflare, AWS, Azure, GCP) are mentioned, explain how each fits into an integrated zero-lock-in architecture.
3. Recommend serverless & edge-first primitives to minimize maintenance and cloud bills.` 
              },
              { role: 'user', content: message }
            ]
          });
        } catch (mErr) {
          console.warn("Primary model attempt failed, falling back to Llama 3.2 3B", mErr);
          aiResponse = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
            messages: [
              { 
                role: 'system', 
                content: 'You are MrTechSysGPT Assistant, senior cloud architect. Provide friendly, authoritative, practical advice answering the user’s exact technical and business questions with Texas-rooted simplicity.' 
              },
              { role: 'user', content: message }
            ]
          });
        }

        if (aiResponse?.response) {
          return new Response(JSON.stringify({ reply: aiResponse.response }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        console.warn("Workers AI call failed or initializing, checking secondary engines.", err);
      }
    }

    // 2. Secondary: OpenAI GPT-4 Turbo (if configured)
    if (env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [
              { 
                role: "system", 
                content: `You are MrTechSysGPT Assistant, the premier digital transformation and cloud architect for MrTechSys.
Tone: Texas-rooted simplicity, enterprise architecture authority, encouraging, practical, and highly detailed.
Philosophy: "Free first, scale smart." Always explain how to start on official zero-cost developer allocations before paying a dime.`
              },
              { role: "user", content: message }
            ]
          })
        });

        const data: any = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to local TOL-Core intelligence engine.", err);
      }
    }

    // 3. Dynamic TOL-Core Architectural Synthesis Engine
    // Synthesize a custom architectural breakdown based on EXACT detected workloads and CSPs
    const detectedCsps: string[] = [];
    if (lower.includes('cloudflare')) detectedCsps.push('Cloudflare');
    if (lower.includes('aws') || lower.includes('amazon')) detectedCsps.push('AWS');
    if (lower.includes('azure') || lower.includes('microsoft')) detectedCsps.push('Azure');
    if (lower.includes('gcp') || lower.includes('google')) detectedCsps.push('Google Cloud (GCP)');

    const detectedWorkloads: string[] = [];
    if (lower.includes('web')) detectedWorkloads.push('Web Frontend');
    if (lower.includes('api')) detectedWorkloads.push('API / Backend');
    if (lower.includes('database') || lower.includes('db')) detectedWorkloads.push('Serverless Database');
    if (lower.includes('storage')) detectedWorkloads.push('Object Storage');
    if (lower.includes('auth')) detectedWorkloads.push('Zero-Trust Auth');
    if (lower.includes('ai')) detectedWorkloads.push('AI / ML Inference');
    if (lower.includes('messaging')) detectedWorkloads.push('Messaging & Alerts');
    if (lower.includes('analytics')) detectedWorkloads.push('Telemetry & Analytics');
    if (lower.includes('automation')) detectedWorkloads.push('Cron Automation');

    let reply = "";

    // If a specific setup query from the wizard was received:
    if (detectedCsps.length > 0 || detectedWorkloads.length > 0) {
      const cspSummary = detectedCsps.length > 0 ? detectedCsps.join(' + ') : 'Cloudflare + AWS';
      const workloadSummary = detectedWorkloads.length > 0 ? detectedWorkloads.join(', ') : 'Web, API & Database';

      reply = `Howdy! Here is your custom architectural roadmap for [${workloadSummary}] across [${cspSummary}]:\n\n`;

      if (detectedCsps.includes('Cloudflare') || detectedCsps.length === 0) {
        reply += `🌐 Cloudflare Edge Layer (Zero Egress & Global Speed):\n` +
                 `1. Cloudflare Pages hosts your frontend globally across 300+ data centers with unlimited bandwidth.\n` +
                 `2. Workers execute microsecond API handlers for your first 100,000 requests/day at $0.\n` +
                 `3. D1 Serverless SQL provides 5GB of free relational storage.\n` +
                 `4. R2 Object Storage holds 10GB/month of customer photos and PDF invoices with $0 egress fees forever.\n\n`;
      }

      if (detectedCsps.includes('AWS')) {
        reply += `🟧 Amazon Web Services (Deep Power & Serverless Scaling):\n` +
                 `1. AWS Lambda provides 1,000,000 free execution requests every month.\n` +
                 `2. Amazon DynamoDB gives you 25GB of permanent free NoSQL storage.\n` +
                 `3. Amazon API Gateway handles 1M free API calls/mo.\n` +
                 `4. AWS Budgets allows you to configure an immediate $0.00 tripwire alarm so you never get surprise charges.\n\n`;
      }

      if (detectedCsps.includes('Azure')) {
        reply += `🟦 Microsoft Azure (Office 365 & Enterprise Identity):\n` +
                 `1. Azure Functions provides 1M free executions monthly.\n` +
                 `2. Cosmos DB provides 1,000 RU/s free throughput.\n` +
                 `3. Microsoft Entra ID gives you free single sign-on for up to 50,000 users.\n\n`;
      }

      if (detectedCsps.includes('Google Cloud (GCP)')) {
        reply += `🟦 Google Cloud (Container Scalability & BigQuery):\n` +
                 `1. Cloud Run gives you 2 million free containerized requests/mo with sub-second scale-to-zero when idle.\n` +
                 `2. Firestore provides 1GB of document storage at $0.\n` +
                 `3. BigQuery processes 1TB of analytics queries each month completely free.\n\n`;
      }

      reply += `🎯 Next Step: Review your customized 10-point Setup Checklist in Step 5 of the Provisioner, or click 'Email My Blueprint' to receive full signup links and setup instructions directly to your inbox!`;

    } else if (lower.includes('consultation advisory request') || lower.includes('architecture review request')) {
      reply = `Howdy! Thank you for requesting architecture advisory for your business.\n\n` +
              `Based on your operational requirements, our primary recommendation is to start on zero-cost primitives (Cloudflare edge security & static routing paired with serverless compute on AWS or GCP). This ensures zero idle overhead, automated multi-region replication, and hard budget alarms to protect your bottom line.\n\n` +
              `What specific part of your data flow or current software integrations would you like to drill into next?`;
    } else if (lower.includes('cloudflip') || lower.includes('os') || lower.includes('platform')) {
      reply = "CloudFlip is our flagship operational platform for local businesses: 'Keep what works. Connect what doesn’t. Automate what shouldn’t be manual.' It unifies dispatch, mobile photo-to-quote, and tap-to-pay without forcing you to change your existing accounting software.";
    } else if (lower.includes('hvac') || lower.includes('trade') || lower.includes('contractor')) {
      reply = "For trades and field operations, MrTechSys specializes in eliminating dispatch friction: 24/7 AI lead capture so calls never roll to voicemail, and sub-second mobile photo-to-quote approvals right in the customer's driveway.";
    } else {
      reply = "Welcome to MrTechSys! I am your MrTechSysGPT Assistant. Whether you want to calculate your business friction drag, explore CloudFlip OS, or provision a multi-cloud footprint starting 100% free, I am here to guide you. How can we streamline your operations today?";
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      reply: "MrTechSysGPT Assistant online. We help small businesses eliminate operational drag and deploy free-first cloud systems. Launch our Cloud Provisioner Wizard or Flip Engine to see your custom blueprint!" 
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};
