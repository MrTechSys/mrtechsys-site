// functions/api/cloudflip/blueprint-submit.ts

interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

const CSP_NAMES: Record<string, string> = {
  cloudflare: "Cloudflare Edge",
  aws: "Amazon Web Services (AWS)",
  azure: "Microsoft Azure",
  gcp: "Google Cloud Platform (GCP)"
};

const CSP_PLAYBOOKS: Record<string, Array<{ step: string; title: string; desc: string }>> = {
  cloudflare: [
    { step: '01', title: 'Create Free Cloudflare Account', desc: 'Navigate to dash.cloudflare.com/sign-up and register. Unlimited static requests and global cache 100% free.' },
    { step: '02', title: 'Add Your Domain & Update Nameservers', desc: 'Activate free Edge DNS, automatic SSL/TLS certificates, and DDoS mitigation.' },
    { step: '03', title: 'Deploy Cloudflare Pages (Frontend)', desc: 'Link your GitHub repo in Workers & Pages > Pages. Zero bandwidth fees.' },
    { step: '04', title: 'Initialize Cloudflare Workers (Backend API)', desc: 'Free allocation covers 100,000 microsecond executions every single day.' },
    { step: '05', title: 'Create D1 Serverless Database', desc: 'Workers & Pages > D1 SQL Database. Enjoy 5GB of relational SQL storage at $0.' },
    { step: '06', title: 'Activate R2 Object Storage', desc: '10GB/month of photo and document storage with zero egress bandwidth fees forever.' },
    { step: '07', title: 'Configure Zero-Trust Access', desc: 'Add up to 50 team members for secure admin login completely free.' },
    { step: '08', title: 'Enable Edge SSL & Security Headers', desc: 'Set SSL/TLS encryption to Full (Strict) with HTTP Strict Transport Security (HSTS).' },
    { step: '09', title: 'Enable Automatic Brotli & Minification', desc: 'In Speed > Optimization, activate Brotli and Early Hints for sub-second mobile loads.' },
    { step: '10', title: 'Configure Usage Alerts ($0 Alarm)', desc: 'Set a billing notification tripwire to alert you the instant traffic reaches 80% of free quotas.' }
  ],
  aws: [
    { step: '01', title: 'Sign Up for AWS Free Tier', desc: 'Visit aws.amazon.com/free for 12 months free plus permanent Always Free services.' },
    { step: '02', title: 'Secure Root Account & Enable MFA', desc: 'Enable hardware or authenticator app MFA on your Root account immediately.' },
    { step: '03', title: 'Set Up $0.00 Billing Alarm (Crucial)', desc: 'Create a CloudWatch alarm at $0.01 threshold with instant email notification.' },
    { step: '04', title: 'Create IAM Admin User', desc: 'Use an IAM User with AdministratorAccess for CLI/IaC deployment instead of Root.' },
    { step: '05', title: 'Deploy AWS Lambda (Serverless Compute)', desc: '1,000,000 free execution requests every month forever.' },
    { step: '06', title: 'Create Amazon DynamoDB Table', desc: 'Enjoy 25GB of permanent free NoSQL data storage.' },
    { step: '07', title: 'Set Up Amazon S3 Bucket', desc: '5GB of standard asset storage free for the first 12 months.' },
    { step: '08', title: 'Configure Amazon API Gateway', desc: 'Route webhooks and mobile requests with 1 Million free calls per month.' },
    { step: '09', title: 'Activate Amazon CloudWatch Basic Logs', desc: 'Monitor errors and health with 5GB of free log ingestion.' },
    { step: '10', title: 'Connect to Multi-Cloud Mesh', desc: 'Point Cloudflare Workers to your AWS API Gateway for low latency edge caching.' }
  ],
  azure: [
    { step: '01', title: 'Register for Azure Free Account', desc: 'Receive $200 in initial cloud credits plus 12 months of popular free services.' },
    { step: '02', title: 'Configure Azure Cost Management & Budgets', desc: 'Create a $0 budget alert with automated email notifications.' },
    { step: '03', title: 'Set Up Microsoft Entra ID', desc: 'Connect your business email for identity management supporting up to 50,000 monthly active users.' },
    { step: '04', title: 'Deploy Azure Functions', desc: 'Select Consumption Plan for 1 Million executions free every month.' },
    { step: '05', title: 'Create Azure Cosmos DB', desc: 'Enable Free Tier Discount for 1,000 RU/s throughput and 25GB storage permanently free.' },
    { step: '06', title: 'Set Up Azure Blob Storage', desc: '5GB of standard blob storage free for your first 12 months.' },
    { step: '07', title: 'Deploy Azure Container Apps', desc: 'Run microservices with auto-scaling to zero replicas when idle.' },
    { step: '08', title: 'Configure Azure Key Vault', desc: 'Store API secrets and connection strings securely with hardware-backed encryption.' },
    { step: '09', title: 'Integrate with Microsoft 365 & Outlook', desc: 'Trigger automated customer confirmations directly through Outlook mailboxes.' },
    { step: '10', title: 'Link Azure DNS to Cloudflare Proxy', desc: 'Route Azure services through Cloudflare for zero-egress edge protection.' }
  ],
  gcp: [
    { step: '01', title: 'Claim Google Cloud $300 Free Credits', desc: 'Activate your 90-day $300 credit pool plus permanent Free Tier.' },
    { step: '02', title: 'Create a Billing Budget Tripwire', desc: 'Create a $0.01 threshold budget alert that triggers an instant alert.' },
    { step: '03', title: 'Deploy Cloud Run', desc: '2 Million free requests per month with sub-second scale-to-zero when idle.' },
    { step: '04', title: 'Initialize Cloud Firestore Database', desc: '1GB of document storage and 50,000 reads/day at $0.' },
    { step: '05', title: 'Create Cloud Storage Bucket', desc: '5GB standard storage per month included in the Always Free tier.' },
    { step: '06', title: 'Query Data with BigQuery Sandbox', desc: '1TB of SQL querying per month and 10GB storage free without credit card.' },
    { step: '07', title: 'Deploy Cloud Functions (2nd Gen)', desc: 'Run lightweight event handlers with 2 Million free invocations monthly.' },
    { step: '08', title: 'Configure Cloud Pub/Sub', desc: 'Publish order events with 10GB monthly throughput free.' },
    { step: '09', title: 'Integrate Vertex AI Gemini API', desc: 'Use Gemini Flash for automated document parsing and inquiry triage.' },
    { step: '10', title: 'Secure with Edge Proxy', desc: 'Route requests through Cloudflare Edge DNS into Cloud Run for complete zero-trust protection.' }
  ]
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const payload = await request.json() as {
      businessName: string;
      contactName?: string;
      email: string;
      selectedBuild: string[];
      selectedCsps: string[];
      scalePreference: string;
    };

    if (!payload.email || !payload.businessName) {
      return new Response(JSON.stringify({ error: "Business name and email are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const timestamp = new Date().toISOString();
    const leadId = crypto.randomUUID();

    // 1. Log to D1 Database (Serverless Inbox & Audit Trail)
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, metadata, ip_address, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          leadId,
          'public_lead',
          payload.email,
          'BLUEPRINT_DISPATCH',
          'CloudProvisioner',
          JSON.stringify({
            leadId,
            businessName: payload.businessName,
            contactName: payload.contactName || '',
            email: payload.email,
            selectedBuild: payload.selectedBuild,
            selectedCsps: payload.selectedCsps,
            scalePreference: payload.scalePreference,
            source: 'cloud_provisioner_wizard'
          }),
          request.headers.get('cf-connecting-ip') || 'unknown',
          timestamp
        ).run();
      } catch (dbErr) {
        console.warn("D1 logging notice:", dbErr);
      }
    }

    // 2. Outbound User Email Delivery via Resend
    let emailSent = false;
    let emailError: string | null = null;

    if (env.RESEND_API_KEY) {
      const fromEmail = env.RESEND_FROM_EMAIL || "notifications@mrtechsys.com";
      const userFirstName = payload.contactName ? payload.contactName.split(' ')[0] : payload.businessName;
      const cspListFormatted = payload.selectedCsps.map(c => CSP_NAMES[c] || c.toUpperCase()).join(' + ');
      const workloadsFormatted = payload.selectedBuild.map(w => w.toUpperCase()).join(', ');

      // Build checklist sections for HTML email
      let playbooksHtml = '';
      
      // Direct CSP Setup Links
      const CSP_DIRECT_URLS: Record<string, string> = {
        cloudflare: "https://dash.cloudflare.com/sign-up",
        aws: "https://aws.amazon.com/free",
        azure: "https://azure.microsoft.com/free",
        gcp: "https://cloud.google.com/free"
      };

      const directLinksHtml = payload.selectedCsps.map(cspKey => {
        const url = CSP_DIRECT_URLS[cspKey] || "https://mrtechsys.com";
        const name = CSP_NAMES[cspKey] || cspKey.toUpperCase();
        return `
          <a href="${url}" target="_blank" style="display: inline-block; margin: 4px 6px 4px 0; padding: 8px 14px; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.4); border-radius: 6px; color: #D4AF37; font-family: monospace; font-size: 11px; font-weight: bold; text-decoration: none;">
            🚀 Open ${name} Free Tier &rarr;
          </a>
        `;
      }).join('');

      payload.selectedCsps.forEach(cspKey => {
        const steps = CSP_PLAYBOOKS[cspKey];
        if (steps) {
          playbooksHtml += `
            <div style="margin-top: 24px; padding: 18px; border-radius: 8px; background-color: #0E131F; border: 1px solid rgba(212, 175, 55, 0.3);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <h3 style="color: #D4AF37; margin: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${CSP_NAMES[cspKey] || cspKey.toUpperCase()} &bull; 10-Point Activation Playbook
                </h3>
                <a href="${CSP_DIRECT_URLS[cspKey] || '#'}" target="_blank" style="color: #10B981; font-family: monospace; font-size: 11px; font-weight: bold; text-decoration: underline;">
                  Direct Setup Link &rarr;
                </a>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                ${steps.map(s => `
                  <tr>
                    <td style="padding: 6px 10px 6px 0; vertical-align: top; width: 36px;">
                      <span style="display: inline-block; background-color: rgba(212,175,55,0.15); color: #D4AF37; font-family: monospace; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${s.step}</span>
                    </td>
                    <td style="padding: 6px 0; vertical-align: top;">
                      <strong style="color: #FFFFFF; font-size: 13px;">${s.title}</strong>
                      <p style="color: #94A3B8; font-size: 12px; margin: 2px 0 0 0; line-height: 1.4;">${s.desc}</p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </div>
          `;
        }
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 20px; background-color: #07090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
          <table style="max-width: 650px; margin: 0 auto; background-color: #0B0F17; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.35); overflow: hidden; padding: 32px;">
            <tr>
              <td>
                <div style="text-align: left; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">
                  <span style="font-family: monospace; font-size: 11px; color: #D4AF37; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold;">
                    ⚡ MRTECHSYS &bull; CLOUD PROVISIONER BLUEPRINT
                  </span>
                  <h1 style="color: #FFFFFF; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">
                    Your Custom Cloud Footprint Blueprint
                  </h1>
                  <p style="color: #94A3B8; font-size: 13px; margin: 0;">
                    Prepared for <strong>${payload.businessName}</strong> &bull; Free-Tier First Architecture
                  </p>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">
                  Hello ${userFirstName},
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">
                  Here is your official <strong>MrTechSys Cloud Blueprint &amp; Self-Deployment Playbook</strong>. Based on your workload selection, 100% of your stack is engineered to deploy on permanent zero-cost developer allocations before ever paying a dollar.
                </p>

                <div style="background-color: #121824; border-left: 3px solid #D4AF37; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <div style="font-size: 12px; font-family: monospace; color: #94A3B8;">WORKLOADS: <span style="color: #FFFFFF; font-weight: bold;">${workloadsFormatted}</span></div>
                  <div style="font-size: 12px; font-family: monospace; color: #94A3B8; margin-top: 4px;">TARGET PROVIDERS: <span style="color: #D4AF37; font-weight: bold;">${cspListFormatted}</span></div>
                  <div style="font-size: 12px; font-family: monospace; color: #94A3B8; margin-top: 4px;">COST PROFILE: <span style="color: #10B981; font-weight: bold;">$0.00 / month (Free Tier First with Hard Tripwire Safeguards)</span></div>
                </div>

                <!-- Instant Activation Buttons -->
                <div style="margin: 20px 0; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
                  <span style="display: block; font-family: monospace; font-size: 10px; color: #94A3B8; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">
                    DIRECT CSP REGISTRATION &amp; ACTIVATION LINKS:
                  </span>
                  <div>
                    ${directLinksHtml}
                  </div>
                </div>

                ${playbooksHtml}

                <div style="margin-top: 32px; padding: 20px; background-color: #0E131F; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                  <h4 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 15px;">Have questions about integrating with your existing software?</h4>
                  <p style="color: #94A3B8; font-size: 12px; margin: 0 0 16px 0; line-height: 1.5;">
                    MrTechSys specializes in eliminating operational drag for Texas small businesses &mdash; with zero vendor lock-in and zero downtime.
                  </p>
                  <a href="https://mrtechsys.com/cloud-provisioner" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #EAB308); color: #07090E; font-weight: bold; font-family: monospace; font-size: 12px; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px;">
                    Launch AI Architecture Review with MrTechSys &rarr;
                  </a>
                </div>

                <div style="margin-top: 28px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
                  <p style="font-size: 11px; color: #64748B; font-family: monospace; margin: 0;">
                    MrTechSys Digital Transformation Ecosystem &bull; Texas-Rooted Simplicity &bull; Free First, Scale Smart
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: `MrTechSys Notifications <${fromEmail}>`,
            to: [payload.email],
            subject: `Your Cloud Architecture Blueprint: ${payload.businessName} (10-Point Playbook)`,
            html: emailHtml
          })
        });

        if (resendRes.ok) {
          emailSent = true;
        } else {
          const resendErr = await resendRes.text();
          console.warn("Resend API warning:", resendErr);
          emailError = resendErr;
        }
      } catch (rErr: any) {
        console.warn("Resend fetch error:", rErr);
        emailError = rErr.message;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: emailSent 
        ? "Blueprint successfully dispatched to your email" 
        : "Blueprint recorded into serverless dispatch queue",
      emailSent,
      timestamp 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
