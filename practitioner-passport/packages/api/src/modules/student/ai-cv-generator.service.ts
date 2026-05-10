import { config } from "../../shared/config/env";
import { HttpError } from "../../shared/errors/http.error";
import { CvTone, PlacementRecord, QualificationRecord, DevelopmentRecord } from "./student.repository";

type GenerateCvInput = {
  jobRole: string;
  tone: CvTone;
  includeQualifications: boolean;
  includeDevelopment: boolean;
  includePlacements: boolean;
  competencies: Array<{ role: string; attributes: Record<string, number> }>;
  qualifications: QualificationRecord[];
  developmentLogs: DevelopmentRecord[];
  placements: PlacementRecord[];
};

type GeneratedCv = {
  summary: string;
  skills: string[];
  qualifications: string[];
  development: string[];
  placements: string[];
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AiCvGeneratorService {
  private buildPrompt(input: GenerateCvInput): string {
    return [
      `Write a unique, tailored CV for a ${input.jobRole} candidate in a ${input.tone} tone.`,
      "Use the student's real profile data below. Be specific and creative — every CV must be different.",
      "Return ONLY strict JSON (no markdown, no explanation).",
      "JSON shape:",
      '{ "summary": string, "skills": string[], "qualifications": string[], "development": string[], "placements": string[] }',
      "",
      "Rules:",
      "- summary: 2–3 sentences, unique and engaging, tailored to the job role.",
      "- skills: 6–10 relevant skills derived from competencies and data.",
      "- qualifications: concise bullet strings. Empty array if include flag is false.",
      "- development: concise bullet strings. Empty array if include flag is false.",
      "- placements: concise bullet strings with role, company, and impact. Empty array if include flag is false.",
      "",
      `Target job role: ${input.jobRole}`,
      `Tone: ${input.tone}`,
      `Include qualifications: ${input.includeQualifications}`,
      `Include development: ${input.includeDevelopment}`,
      `Include placements: ${input.includePlacements}`,
      "",
      `Competencies: ${JSON.stringify(input.competencies)}`,
      `Qualifications: ${JSON.stringify(input.qualifications)}`,
      `Development logs: ${JSON.stringify(input.developmentLogs)}`,
      `Placements: ${JSON.stringify(input.placements)}`,
    ].join("\n");
  }

  private extractJson(text: string): string {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) return text.slice(start, end + 1);
    return text;
  }

  private normalize(raw: unknown): GeneratedCv {
    const DEFAULT: GeneratedCv = {
      summary: "", skills: [], qualifications: [], development: [], placements: [],
    };
    if (!raw || typeof raw !== "object") return DEFAULT;
    const d = raw as Record<string, unknown>;
    const arr = (v: unknown) => Array.isArray(v) ? v.map(String).filter((s) => s.trim()) : [];
    return {
      summary: String(d.summary || ""),
      skills: arr(d.skills),
      qualifications: arr(d.qualifications),
      development: arr(d.development),
      placements: arr(d.placements),
    };
  }

  private async callGemini(model: string, prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; retryDelay: number }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      let retryDelay = 30;
      if (res.status === 429) {
        try {
          const body = await res.json() as { error?: { details?: Array<{ retryDelay?: string }> } };
          const d = body.error?.details?.find((x: Record<string, unknown>) => x.retryDelay)?.retryDelay;
          if (d) retryDelay = parseInt(d, 10) || 30;
        } catch { /* ignore */ }
      }
      return { ok: false, status: res.status, retryDelay };
    }

    const json = (await res.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return { ok: false, status: 204, retryDelay: 0 };
    return { ok: true, text };
  }

  async generateCvPreview(input: GenerateCvInput): Promise<GeneratedCv> {
    if (!config.geminiApiKey) {
      throw new HttpError(500, "GEMINI_API_KEY is not configured.");
    }

    const prompt = this.buildPrompt(input);

    const primary = await this.callGemini(config.geminiModel, prompt);
    if (primary.ok) {
      try { return this.normalize(JSON.parse(this.extractJson(primary.text))); }
      catch { throw new HttpError(502, "Gemini response could not be parsed as JSON."); }
    }

    if (primary.status === 429) {
      for (const model of FALLBACK_MODELS) {
        const result = await this.callGemini(model, prompt);
        if (result.ok) {
          try { return this.normalize(JSON.parse(this.extractJson(result.text))); }
          catch { continue; }
        }
      }

      const retryMs = Math.min(primary.retryDelay, 45) * 1000;
      await sleep(retryMs);
      const retry = await this.callGemini(config.geminiModel, prompt);
      if (retry.ok) {
        try { return this.normalize(JSON.parse(this.extractJson(retry.text))); }
        catch { throw new HttpError(502, "Gemini response could not be parsed as JSON."); }
      }

      throw new HttpError(429, "AI quota temporarily exceeded. Please wait a moment and try again.");
    }

    throw new HttpError(502, `Gemini request failed (${primary.status}).`);
  }
}
