/**
 * JD extraction for "AI Paste JD" mode.
 *
 * - `extractJob()` — zero-dependency rule-based parser (offline fallback).
 * - `geminiExtract()` — calls the Gemini REST API directly from the browser
 *   with a user-supplied key (CORS is supported by Google's API).
 * - `SYSTEM_PROMPT` — the strict extraction instruction applied to Gemini.
 */

export const SYSTEM_PROMPT = `You are a job-posting data extraction engine.
Extract data from this Job Description and return a strict JSON object with fields: title, companyType, deadline, responsibilities (array of bullet points), requirements (array of bullet points), and emails (array).

Rules:
- Respond with ONLY the JSON object. No markdown fences, no commentary, no trailing text.
- title: the job position / role name, short and clean.
- companyType: the type of organization (e.g. NGO, Bank, Garments/RMG, IT Firm). Infer from context if not explicit.
- deadline: normalize dates to "Day Month Year" (e.g. "15 September 2026"); keep phrases like "Within 10 days" as-is.
- responsibilities: 4-8 concise bullet points, each 12 words or fewer.
- requirements: 4-8 concise bullet points, each 12 words or fewer.
- emails: every email address found, lowercased, de-duplicated.
- respHeading / reqHeading: the exact section heading text found in the JD (e.g. "Key Responsibilities", "Requirements", "Eligibility"), or empty string when absent.
- Never invent data. If a field is absent from the text, use an empty string or empty array.`;

export const JOB_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    companyType: { type: "string" },
    deadline: { type: "string" },
    responsibilities: { type: "array", items: { type: "string" } },
    requirements: { type: "array", items: { type: "string" } },
    emails: { type: "array", items: { type: "string" } },
    respHeading: { type: "string" },
    reqHeading: { type: "string" },
  },
  required: ["title", "companyType", "deadline", "responsibilities", "requirements", "emails"],
};

export function parseJobJson(content) {
  const cleaned = String(content).replace(/```(?:json)?/gi, "").trim();
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
      respHeading: typeof data.respHeading === "string" ? data.respHeading : "",
      reqHeading: typeof data.reqHeading === "string" ? data.reqHeading : "",
      introText: typeof data.introText === "string" ? data.introText : "",
    };
  } catch {
    return null;
  }
}

/**
 * Call Gemini from the browser. Throws on network/API errors; returns null
 * when the model output can't be parsed into the contract.
 */
export async function geminiExtract(jd, apiKey, model = "gemini-2.0-flash") {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: jd || "(empty)" }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: JOB_SCHEMA,
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  const content = Array.isArray(parts) ? parts.map((p) => p?.text ?? "").join("") : "";
  return parseJobJson(content);
}

/* ─────────────────────────── Rule-based parser ─────────────────────────── */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

const MONTHS =
  "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";

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
  /(?:job\s+|minimum\s+|basic\s+|essential\s+|educational\s+|experience\s+|additional\s+)?requirements?|qualifications?|required\s+(?:skills|qualifications|experience|competencies)|skills\s+&|skills\s+and\s+(?:qualifications|competencies)|what\s+(?:we|candidates?|you)\s+(?:need|require|are looking for|look for)|must\s+have|we\s+are looking for|eligibilit|eligibility\s+criteria|criteria|prerequisites?|preferred\s+(?:qualifications|skills)|who\s+can\s+apply/i;

const DEADLINE_RE =
  /deadline|last\s+date|last\s+day|apply\s+(?:by|before)|application\s+(?:deadline|close)|closing\s+date|due\s+date|expires?|valid\s+until|before\s+\d{1,2}|within\s+\d{1,2}\s+days|submission\s+date|last\s+date\s+of\s+application/i;

const POSITION_RE =
  /^(?:position|job\s+title|vacancy|role|designation|post|job\s+role|we\s+are\s+hiring\s*(?:for|:)?)\s*[:|\-–]?\s*(.+)$/i;

const COMPANY_TYPE_RE =
  /^(?:company\s+type|organization\s+type|type\s+of\s+(?:organization|company|industry)|organization|industry|sector|category)\s*[:|\-–]?\s*(.+)$/i;

const COMPANY_KEYWORDS = [
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

function normalizeText(text) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function isSectionHeader(line, re) {
  const clean = line.replace(/^[#*_\-•\s]+/, "").replace(/[#*_:\s]+$/, "");
  if (!re.test(clean)) return false;
  return clean.length <= 64;
}

function stripBullet(line) {
  return line.replace(BULLET_RE, "").trim();
}

function cleanItem(item) {
  return item
    .replace(/^[:\s]+|[:\s]+$/g, "")
    .replace(/[;,\s]+$/, "")
    .trim();
}

function extractEmails(text) {
  const found = text.match(EMAIL_RE) ?? [];
  const seen = new Set();
  const out = [];
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

function extractTitle(lines) {
  // 1) Explicit label: "Position: Head of Risk Management"
  for (const line of lines) {
    const m = line.match(POSITION_RE);
    if (m && m[1].trim()) return cleanItem(m[1].replace(/["'*]/g, "").trim());
  }
  // 2) "…is looking for Head of Risk Management"
  for (const line of lines) {
    const m = line.match(LOOKING_FOR_RE);
    if (m && m[1].trim()) {
      const t = cleanItem(m[1].trim().replace(/[.!?]+$/, ""));
      if (t && t.length <= 70) return t;
    }
  }
  // 3) Fallback: first clean non-bullet line
  for (const line of lines) {
    const clean = cleanItem(line.replace(/["'*#]/g, ""));
    if (!clean) continue;
    if (EMAIL_RE.test(line) || NOTE_SKIP_RE.test(line)) continue;
    if (DEADLINE_RE.test(line) || RESP_HEAD_RE.test(line) || REQ_HEAD_RE.test(line)) continue;
    if (clean.length <= 90 && !BULLET_RE.test(line)) return clean;
  }
  return "";
}

/** Capture the intro phrase before the role, e.g. "…leading conglomerate is looking for". */
function extractIntro(lines, title) {
  if (!title) return "";
  for (const line of lines) {
    const idx = line.toLowerCase().indexOf("looking for");
    if (idx >= 0) {
      const intro = line.slice(0, idx + "looking for".length).replace(/[.:;]+$/, "").trim();
      if (intro) return intro;
    }
  }
  return "";
}

function extractCompanyType(lines) {
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

function extractDeadline(lines) {
  for (const line of lines) {
    if (!DEADLINE_RE.test(line)) continue;
    const match = line.match(DATE_RE);
    if (match) return match[0];
    const within = line.match(/within\s+(\d{1,2})\s+days?/i);
    if (within) return `Within ${within[1]} days`;
    // "Deadline: URGENT" → keep the short label
    const label = line.match(/deadline\s*[:|\-–]?\s*(.+)$/i);
    if (label && label[1].trim() && label[1].trim().length <= 30) {
      return cleanItem(label[1].trim().replace(/[.!?]+$/, ""));
    }
  }
  const all = lines.join("\n");
  const dates = [...all.matchAll(DATE_RE)];
  return dates.length ? dates[dates.length - 1][0] : "";
}

function formatDate(dateStr) {
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
  const monthMap = {
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

const INTRO_SKIP_RE =
  /^(we\s+are\s+(?:looking|seeking|hiring)|job\s+(?:summary|overview|description)|about\s+(?:us|the\s+(?:company|role|position))|the\s+company|company\s+overview|who\s+we\s+are|role\s+summary|our\s+(?:client|company|organization))/i;

const CONTACT_SKIP_RE = /^send\s+(?:your\s+)?(?:cv|resume|application|bio[- ]?data)|(?:email|mail)\s+us/i;

const NOTE_SKIP_RE = /^please\s+note|^notes?\s*[:|]/i;

const LOOKING_FOR_RE = /\b(?:looking|searching|seeking)\s+for\s+(?:a|an|the)?\s*([A-Z][^.!?\n]{2,70})/;

/** Split one raw line into candidate bullet items. */
function splitLine(line) {
  // Inline bullet glyphs: "• item one · item two"
  const glyphParts = line.split(/[·•●▪∙‣›»]/).map((s) => s.trim()).filter(Boolean);
  if (glyphParts.length > 1) return glyphParts;
  // Prose with sentence boundaries: "Handles payroll. Prepares reports."
  const sentences = line.match(/[^.!?;\n]+[.!?;]+(?:["')\]]*)?|[^.!?;\n]+$/g) ?? [];
  const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length >= 8);
  // Split only when every piece is substantial and starts like a real sentence —
  // avoids mangling abbreviations ("e.g.", "i.e.", "U.S.") inside a bullet.
  if (cleaned.length > 1 && cleaned.every((s) => s.length >= 10 && /^[A-Z0-9("'“]/.test(s))) return cleaned;
  return [line];
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

function collectSections(lines) {
  const responsibilities = [];
  const requirements = [];
  let respHeading = "";
  let reqHeading = "";
  let section = null;
  const classify = (line) => {
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
    // Contact / deadline / note lines are not bullet items.
    if (EMAIL_RE.test(line) || DEADLINE_RE.test(line) || CONTACT_SKIP_RE.test(line) || NOTE_SKIP_RE.test(line)) continue;
    const head = classify(line);
    if (head) {
      const kind = head === "both" ? "responsibilities" : head;
      section = kind;
      const heading = cleanItem(line.replace(/^[#*_\-•\s]+/, "").replace(/[#*_:\s]+$/, ""));
      if (kind === "responsibilities" && !respHeading) respHeading = heading;
      if (kind === "requirements" && !reqHeading) reqHeading = heading;
      continue;
    }
    if (BULLET_RE.test(line)) {
      // Bullet marker: strip it, then split inline glyphs ("·") and sentences into items.
      for (const piece of splitLine(cleanItem(stripBullet(line)))) {
        const item = cleanItem(piece);
        if (item && item.length >= 8) {
          if (section === "requirements") requirements.push(item);
          else responsibilities.push(item);
        }
      }
      continue;
    }
    // No bullet marker: split prose into sentence/bullet items when inside a section.
    if (section && !INTRO_SKIP_RE.test(line)) {
      for (const piece of splitLine(line)) {
        const item = cleanItem(piece);
        if (item && item.length >= 8) {
          if (section === "requirements") requirements.push(item);
          else responsibilities.push(item);
        }
      }
    }
  }
  return {
    responsibilities: dedupe(responsibilities),
    requirements: dedupe(requirements),
    respHeading,
    reqHeading,
  };
}

/** Rule-based extraction: parses any raw JD text into the strict contract. */
export function extractJob(rawText) {
  const text = normalizeText(rawText);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!text) {
    return {
      title: "",
      companyType: "",
      deadline: "",
      responsibilities: [],
      requirements: [],
      emails: [],
      respHeading: "",
      reqHeading: "",
      introText: "",
    };
  }

  const emails = extractEmails(text);
  const title = extractTitle(lines);
  const companyType = extractCompanyType(lines);
  const deadline = formatDate(extractDeadline(lines));
  const introText = extractIntro(lines, title);

  const sections = collectSections(lines);
  let responsibilities = sections.responsibilities;
  let requirements = sections.requirements;
  const respHeading = sections.respHeading;
  const reqHeading = sections.reqHeading;

  if (responsibilities.length === 0 && requirements.length === 0) {
    const allBullets = [];
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

  if (requirements.length === 0 && responsibilities.length > 4) {
    const mid = Math.ceil(responsibilities.length / 2);
    requirements = responsibilities.slice(mid);
    responsibilities = responsibilities.slice(0, mid);
  }

  const cap = (arr) => arr.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).slice(0, 9);

  return {
    title,
    companyType,
    deadline,
    responsibilities: cap(responsibilities),
    requirements: cap(requirements),
    emails,
    respHeading,
    reqHeading,
    introText,
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
