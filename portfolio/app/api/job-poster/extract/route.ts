import { NextResponse } from "next/server";
import { extractJob, extractWithGemini, DEFAULT_GEMINI_MODEL } from "@/lib/job-poster";

export const runtime = "nodejs";

/**
 * POST /api/job-poster/extract
 *
 * Accepts `{ text: rawJdText }`, passes it to Gemini via the Google AI Studio
 * SDK (`@google/genai`) with a strict system instruction + JSON schema, and
 * returns the structured `ExtractedJob` data.
 *
 * Falls back to the instant rule-based parser when no `GEMINI_API_KEY` is
 * configured or the model call fails, so the tool always responds.
 */
export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    text = "";
  }

  const local = extractJob(text);

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ data: local, source: "local" as const });
  }

  try {
    const data = await extractWithGemini(text, apiKey, process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL);
    if (data) {
      return NextResponse.json({ data, source: "ai" as const });
    }
    throw new Error("Gemini returned unparseable JSON");
  } catch {
    return NextResponse.json({ data: local, source: "local" as const });
  }
}
