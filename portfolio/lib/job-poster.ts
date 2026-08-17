/**
 * Job poster data contract + extraction engine.
 *
 * - `ExtractedJob` is the strict JSON contract returned by every extraction path.
 * - `extractJob()` is a zero-dependency regex/heuristic parser that runs instantly
 *   in the browser and powers the real-time preview.
 * - `extractWithGemini()` calls Google AI Studio (Gemini) with a strict system
 *   instruction and JSON schema; used by the API route and served as the fallback
 *   when the API fails or no key is configured.
 */

export interface ExtractedJob {
  title: string;
  companyType: string;
  deadline: string;
  responsibilities: string[];
  requirements: string[];
  emails: string[];
}

export const EMPTY_JOB: ExtractedJob = {
  title: "",
  companyType: "",
  deadline: "",
  responsibilities: [],
  requirements: [],
  emails: [],
};

/* ──────────────────────────── Gemini (Google AI Studio) ──────────────────────────── */

export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

/** The strict system instruction applied to every Gemini extraction. */
export const EXTRACTION_SYSTEM_PROMPT = `You are a job-posting data extraction engine.
Extract data from this Job Description and return a strict JSON object with fields: title, companyType, deadline, responsibilities (array of bullet points), requirements (array of bullet points), and emails (array).

Rules:
- Respond with ONLY the JSON object. No markdown fences, no commentary, no trailing text.
- title: the job position / role name, short and clean.
- companyType: the type of organization (e.g. NGO, Bank, Garments/RMG, IT Firm). Infer from context if not explicit.
- deadline: normalize dates to "Day Month Year" (e.g. "15 September 2026"); keep phrases like "Within 10 days" as-is.
- responsibilities: 4-8 concise bullet points, each 12 words or fewer.
- requirements: 4-8 concise bullet points, each 12 words or fewer.
- emails: every email address found, lowercased, de-duplicated.
- Never invent data. If a field is absent from the text, use an empty string or empty array.`;

/** JSON Schema handed to Gemini so the response is guaranteed to match `ExtractedJob`. */
export const JOB_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    companyType: { type: "string" },
    deadline: { type: "string" },
    responsibilities: { type: "array", items: { type: "string" } },
    requirements: { type: "array", items: { type: "string" } },
    emails: { type: "array", items: { type: "string" } },
  },
  required: ["title", "companyType", "deadline", "responsibilities", "requirements", "emails"],
} as const;

/** Validate + normalize any JSON-ish Gemini output into the strict contract. */
export function parseJobJson(content: string): ExtractedJob | null {
  const cleaned = content.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const data = JSON.parse(cleaned.slice(start, end + 1));
    if (!data || typeof data !== "object") return null;
    return {
      title: typeof data.title === "string" ? data.title : "",
      companyType: typeof data.companyType === "string" ? data.companyType : "",
      deadline: typeof data.deadline === "string" ? data.deadline : "",
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.map(String) : [],
      requirements: Array.isArray(data.requirements) ? data.requirements.map(String) : [],
      emails: Array.isArray(data.emails) ? data.emails.map(String) : [],
    };
  } catch {
    return null;
  }
}

/**
 * Extract via Google AI Studio (Gemini).
 *
 * SERVER-ONLY: uses a dynamic import so the SDK never lands in the client bundle.
 * Returns `null` on any failure so callers can fall back to `extractJob()`.
 */
export async function extractWithGemini(
  text: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<ExtractedJob | null> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: text || "(empty)",
    config: {
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: JOB_SCHEMA,
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  });
  const content = response.text;
  if (!content) return null;
  return parseJobJson(content);
}

/* ──────────────────────────── Local heuristic engine ──────────────────────────── */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

const MONTHS =
  "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";

/** Matches: 15 Sep 2026, September 15, 2026, 15th August 2026, 15/09/2026, 2026-09-15, etc. */
const DATE_RE = new RegExp(
  [
    `\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\s*,?\\s*\\d{2,4}\\b`,
    `\\b(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?\\s*,?\\s*\\d{2,4}\\b`,
    "\\b\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}\\b",
    "\\b\\d{4}[\\/.-]\\d{1,2}[\\/.-]\\d{1,2}\\b",
  ].join("|"),
  "gi"
);

const BULLET_RE = /^\s*(?:[•●▪◆‣›»·◦⁃*✓✔☑\-–—]|\d{1,2}[.)]|\(\d{1,2}\)|[A-Za-z][.)])\s+/;

const RESP_HEAD_RE =
  /(?:key\s+)?(?:job\s+|main\s+|primary\s+|core\s+|major\s+)?responsibilit|responsibilities?\s*(?:&|and|&amp;)\s*(?:duties|accountabilities)|duties\s*(?:&|and|&amp;)\s*(?:responsibilities)?|what\s+(?:you|we|the\s+role|candidate)\s+(?:will\s+)?(?:do|be doing)|what\s+you'?ll\s+do|role\s+overview|key\s+accountabilities?|job\s+summary|duties|tasks\s+include/i;

const REQ_HEAD_RE =
  /(?:job\s+|minimum\s+|basic\s+|essential\s+|educational\s+|experience\s+|additional\s+)?requirements?|qualifications?|required\s+(?:skills|qualifications|experience|competencies)|skills\s+&|skills\s+and\s+(?:qualifications|competencies)|what\s+(?:we|candidates?|you)\s+(?:need|require|are looking for|look for)|must\s+have|we\s+are looking for|eligibility\s+criteria|criteria|prerequisites?|preferred\s+(?:qualifications|skills)/i;

const DEADLINE_RE =
  /deadline|last\s+date|last\s+day|apply\s+(?:by|before)|application\s+(?:deadline|close)|closing\s+date|due\s+date|expires?|valid\s+until|before\s+\d{1,2}|within\s+\d{1,2}\s+days|submission\s+date|last\s+date\s+of\s+application/i;

const POSITION_RE =
  /^(?:position|job\s+title|vacancy|role|designation|post|job\s+role|we\s+are\s+hiring\s*(?:for|:)?)\s*[:|\-–]?\s*(.+)$/i;

const COMPANY_TYPE_RE =
  /^(?:company\s+type|organization\s+type|type\s+of\s+(?:organization|company|industry)|organization|industry|sector|category)\s*[:|\-–]?\s*(.+)$/i;

const COMPANY_KEYWORDS: Array<[RegExp, string]> = [
  [/ngo|non[- ]?government/i, "NGO"],
  [/garments?|rmg|readymade|ready[- ]?made|textile|apparel|knit|woven|sweater/i, "Garments / RMG"],
  [/bank|financial|insurance|leasing|nbfc|microfinance|micro[- ]?finance/i, "Banking & Finance"],
  [/pharma|pharmaceutical/i, "Pharmaceuticals"],
  [/hospital|medical|health(?:care)?|clinic/i, "Healthcare"],
  [/telecom/i, "Telecommunications"],
  [/university|school|college|education|training|academy/i, "Education"],
  [/it\b|software|technology|tech\b|digital|telecom/i, "IT & Software"],
  [/fmcg|consumer\s+goods|retail|super(?:store)?|e[- ]?commerce/i, "FMCG / Retail"],
  [/hotel|restaurant|hospitality|tourism|travel/i, "Hospitality & Tourism"],
  [/construction|real\s+estate|developer|engineering|cement/i, "Construction & Real Estate"],
  [/startup/i, "Startup"],
  [/government|govt\.?|ministry|public\s+sector/i, "Government / Public Sector"],
  [/group\s+of\s+companies/i, "Group of Companies"],
];

function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function isSectionHeader(line: string, re: RegExp): boolean {
  const clean = line.replace(/^[#*_\-•\s]+/, "").replace(/[#*_:\s]+$/, "");
  if (!re.test(clean)) return false;
  return clean.length <= 64;
}

function stripBullet(line: string): string {
  return line.replace(BULLET_RE, "").trim();
}

function cleanItem(item: string): string {
  return item
    .replace(/^[:\s]+|[:\s]+$/g, "")
    .replace(/[;,\s]+$/, "")
    .trim();
}

function extractEmails(text: string): string[] {
  const found = text.match(EMAIL_RE) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of found) {
    const email = raw.toLowerCase().replace(/[.,;]+$/, "").trim();
    if (!email || email.includes("..") || email.startsWith(".") || email.endsWith(".")) continue;
    if (!seen.has(email)) {
      seen.add(email);
      out.push(email);
    }
  }
  return out;
}

function extractTitle(lines: string[]): string {
  for (const line of lines) {
    const m = line.match(POSITION_RE);
    if (m && m[1].trim()) return cleanItem(m[1].replace(/["'*]/g, "").trim());
  }
  for (const line of lines) {
    const clean = cleanItem(line.replace(/["'*#]/g, ""));
    if (!clean) continue;
    if (EMAIL_RE.test(line)) continue;
    if (DEADLINE_RE.test(line) || RESP_HEAD_RE.test(line) || REQ_HEAD_RE.test(line)) continue;
    if (clean.length <= 90 && !BULLET_RE.test(line)) return clean;
  }
  return "";
}

function extractCompanyType(lines: string[]): string {
  for (const line of lines) {
    const m = line.match(COMPANY_TYPE_RE);
    if (m && m[1].trim()) return cleanItem(m[1]);
  }
  const text = lines.join(" ");
  for (const [re, label] of COMPANY_KEYWORDS) {
    if (re.test(text)) return label;
  }
  return "";
}

function extractDeadline(lines: string[]): string {
  for (const line of lines) {
    if (!DEADLINE_RE.test(line)) continue;
    const match = line.match(DATE_RE);
    if (match) return match[0];
    const within = line.match(/within\s+(\d{1,2})\s+days?/i);
    if (within) return `Within ${within[1]} days`;
  }
  const all = lines.join("\n");
  const dates = [...all.matchAll(DATE_RE)];
  return dates.length ? dates[dates.length - 1][0] : "";
}

function formatDate(dateStr: string): string {
  const s = dateStr.trim();
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${day} ${names[month - 1]} ${year}`;
    }
  }
  const monthMap: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
    may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9,
    september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  };
  const m2 = s.match(new RegExp(`^(?:(\\d{1,2})(?:st|nd|rd|th)?\\s+)?(${MONTHS})\\s*,?\\s*(\\d{2,4})$`, "i"));
  if (m2) {
    const month = monthMap[m2[2].toLowerCase()];
    const day = m2[1] ? Number(m2[1]) : 1;
    const year = Number(m2[3]);
    const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${day} ${names[month - 1]} ${year}`;
  }
  return s;
}

/** Walk lines, attributing bullets to the section they fall under. */
function collectSections(lines: string[]): { responsibilities: string[]; requirements: string[] } {
  const responsibilities: string[] = [];
  const requirements: string[] = [];
  let section: "responsibilities" | "requirements" | null = null;

  const classify = (line: string): "responsibilities" | "requirements" | "both" | null => {
    const isResp = isSectionHeader(line, RESP_HEAD_RE);
    const isReq = isSectionHeader(line, REQ_HEAD_RE);
    if (isResp && isReq) return "both";
    if (isResp) return "responsibilities";
    if (isReq) return "requirements";
    return null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const head = classify(line);
    if (head) {
      section = head === "both" ? "responsibilities" : head;
      continue;
    }

    if (!BULLET_RE.test(line)) continue;
    const item = cleanItem(stripBullet(line));
    if (!item) continue;
    if (section === "requirements") requirements.push(item);
    else responsibilities.push(item);
  }

  return { responsibilities, requirements };
}

/**
 * Rule-based extraction: parses any raw JD text into the strict `ExtractedJob`
 * contract with zero network calls. Used for the instant live preview and as
 * the fallback when the Gemini call fails or no API key is configured.
 */
export function extractJob(rawText: string): ExtractedJob {
  const text = normalizeText(rawText);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!text) return { ...EMPTY_JOB };

  const emails = extractEmails(text);
  const title = extractTitle(lines);
  const companyType = extractCompanyType(lines);
  const deadline = formatDate(extractDeadline(lines));

  const sections = collectSections(lines);
  let responsibilities = sections.responsibilities;
  let requirements = sections.requirements;

  // Fallback: if nothing was attributed, split the document's loose bullets.
  if (responsibilities.length === 0 && requirements.length === 0) {
    const allBullets: string[] = [];
    for (const line of lines) {
      if (BULLET_RE.test(line)) {
        const item = cleanItem(stripBullet(line));
        if (item) allBullets.push(item);
      }
    }
    if (allBullets.length) {
      const mid = Math.ceil(allBullets.length / 2);
      responsibilities = allBullets.slice(0, mid);
      requirements = allBullets.slice(mid);
    }
  }

  // If requirements was never found, everything collected went to responsibilities —
  // move the second half over so both columns stay balanced.
  if (requirements.length === 0 && responsibilities.length > 4) {
    const mid = Math.ceil(responsibilities.length / 2);
    requirements = responsibilities.slice(mid);
    responsibilities = responsibilities.slice(0, mid);
  }

  const cap = (arr: string[]) => arr.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).slice(0, 9);

  return {
    title,
    companyType,
    deadline,
    responsibilities: cap(responsibilities),
    requirements: cap(requirements),
    emails,
  };
}

export const SAMPLE_JD = `WE ARE HIRING
Position: Executive - Talent Acquisition

Company Type: NGO (Non-Government Organization)

We are looking for a dynamic and detail-oriented Talent Acquisition Executive to join our growing HR team in Dhaka. You will support end-to-end recruitment and help us hire exceptional people, faster.

Key Responsibilities:
• Manage end-to-end recruitment process from sourcing to onboarding
• Screen resumes and coordinate interviews with hiring managers
• Maintain candidate database and recruitment documentation
• Ensure a positive candidate experience throughout the hiring lifecycle
• Coordinate with hiring managers for data-backed recruitment decisions

Requirements:
• MBA / BBA in Human Resource Management or related field
• 1-2 years of experience in recruitment or HR operations
• Strong communication and stakeholder management skills
• Familiarity with ATS platforms and AI-powered sourcing tools
• Proficiency in Microsoft Office and digital productivity tools

Application Deadline: 15 September 2026
Send your CV to: career@example.com or hr@example.com
`;
