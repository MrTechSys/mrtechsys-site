import Tesseract from 'tesseract.js';
import type { CoverageSet, Policy } from '../types';

// Standard limits to normalize against
const STANDARD_LIMITS = {
  bi: [15000, 20000, 25000, 30000, 50000, 100000, 250000, 300000, 500000, 1000000],
  pd: [5000, 10000, 15000, 25000, 50000, 100000, 250000],
  pip: [0, 2500, 3000, 5000, 10000, 50000]
};

function normalizeLimit(val: number, standard: number[]): number {
  if (!val || val <= 0) return 0;
  return standard.reduce((prev, curr) => 
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
}

export interface ExtractedPolicyData {
  coverages: Partial<CoverageSet>;
  policyInfo: Partial<Policy>;
  redactedImageUrl: string;
}

/**
 * PII Redaction using Canvas
 * Automatically blacks out sensitive areas based on generic positions
 * In a real-world scenario, we would use OCR coordinates to target PII.
 * For this prototype, we'll redact common header/footer areas.
 */
async function redactImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = 'black';
        
        // Redact Top Header (Name/Address/Policy #)
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);
        
        // Redact VIN areas (Usually middle right)
        ctx.fillRect(canvas.width * 0.6, canvas.height * 0.3, canvas.width * 0.35, 100);

        // Add "PII REDACTED" Stamp
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('PII REDACTED FOR PRIVACY', 20, 30);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function extractPolicyData(file: File): Promise<ExtractedPolicyData> {
  // 1. Redact Image
  const redactedImageUrl = await redactImage(file);

  // 2. OCR Step
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: m => console.log(m),
  });
  
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();

  // 3. LLM Step (Using Puter.js - Sovereign AI)
  const prompt = `
    TASK: Act as a senior insurance document analyst.
    INPUT: OCR text from an auto insurance policy declaration page.
    OBJECTIVE: Extract liability limits and policy identification info.
    
    RULES:
    - Look for "Bodily Injury", "Property Damage", "PIP", "UM/UIM".
    - Extract "Policy Number", "Carrier Name", "Effective Dates".
    - Extract Vehicle info (Year, Make, Model).
    
    OUTPUT FORMAT: Return ONLY a valid JSON object. No markdown.
    {
      "coverages": {
        "bodilyInjuryPerPerson": number,
        "bodilyInjuryPerAccident": number,
        "propertyDamage": number,
        "pip": number,
        "uninsuredMotoristBodilyInjuryPerPerson": number
      },
      "policyInfo": {
        "carrier": "string",
        "policyNumber": "string",
        "effectiveDate": "string",
        "expirationDate": "string",
        "stateCode": "string"
      },
      "vehicle": {
        "year": number,
        "make": "string",
        "model": "string"
      }
    }
    
    TEXT TO ANALYZE:
    ${text}
  `;

  try {
    const response = await puter.ai.chat(prompt);
    const cleanResponse = response.toString()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
      
    const extracted = JSON.parse(cleanResponse);
    
    // 4. Normalization Layer
    const normalizedCoverages = {
      bodilyInjuryPerPerson: normalizeLimit(extracted.coverages.bodilyInjuryPerPerson, STANDARD_LIMITS.bi),
      bodilyInjuryPerAccident: normalizeLimit(extracted.coverages.bodilyInjuryPerAccident, STANDARD_LIMITS.bi),
      propertyDamage: normalizeLimit(extracted.coverages.propertyDamage, STANDARD_LIMITS.pd),
      pip: normalizeLimit(extracted.coverages.pip, STANDARD_LIMITS.pip),
      uninsuredMotoristBodilyInjuryPerPerson: normalizeLimit(extracted.coverages.uninsuredMotoristBodilyInjuryPerPerson, STANDARD_LIMITS.bi),
    };

    return {
      coverages: normalizedCoverages,
      policyInfo: {
        ...extracted.policyInfo,
        vehicles: extracted.vehicle ? [extracted.vehicle] : []
      },
      redactedImageUrl
    };
  } catch (error) {
    console.error("Sovereign AI Extraction failed:", error);
    throw new Error("Local intelligence engine could not parse this document. Please ensure it is a clear image of your policy declarations.");
  }
}
