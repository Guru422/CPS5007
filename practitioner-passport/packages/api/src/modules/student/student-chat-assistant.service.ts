import { config } from "../../shared/config/env";
import { HttpError } from "../../shared/errors/http.error";

type ChatInput = {
  userMessage: string;
  retrievedContext: string[];
  recentHistory: Array<{ role: "user" | "assistant"; message: string }>;
};

const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StudentChatAssistantService {
  private buildPrompt(input: ChatInput): string {
    return [
      "You are a helpful student career assistant in Practitioner Passport.",
      "Answer the student's question directly and naturally, like a real person would.",
      "Use ONLY the provided profile context below. Do not invent data.",
      "If the context doesn't contain enough info, say so honestly.",
      "Be concise but conversational.",
      "",
      "Student profile context:",
      ...input.retrievedContext.map((line) => `- ${line}`),
      "",
      "Recent chat history:",
      ...input.recentHistory.slice(-8).map((item) => `${item.role.toUpperCase()}: ${item.message}`),
      "",
      `Student: ${input.userMessage}`,
      "",
      "Assistant:",
    ].join("\n");
  }

  private async callGemini(model: string, prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; retryDelay: number }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5 },
      }),
    });

    if (!response.ok) {
      let retryDelay = 30;
      if (response.status === 429) {
        try {
          const body = await response.json() as { error?: { details?: Array<{ retryDelay?: string }> } };
          const delayStr = body.error?.details?.find((d: Record<string, unknown>) => d.retryDelay)?.retryDelay;
          if (delayStr) retryDelay = parseInt(delayStr, 10) || 30;
        } catch { /* ignore parse errors */ }
      }
      return { ok: false, status: response.status, retryDelay };
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return { ok: false, status: 204, retryDelay: 0 };
    }
    return { ok: true, text };
  }

  async generateReply(input: ChatInput): Promise<string> {
    if (!config.geminiApiKey) {
      throw new HttpError(500, "GEMINI_API_KEY is not configured.");
    }

    const prompt = this.buildPrompt(input);

    const primary = await this.callGemini(config.geminiModel, prompt);
    if (primary.ok) return primary.text;

    if (primary.status === 429) {
      for (const fallbackModel of FALLBACK_MODELS) {
        const result = await this.callGemini(fallbackModel, prompt);
        if (result.ok) return result.text;
      }

      const retryMs = Math.min(primary.retryDelay, 45) * 1000;
      await sleep(retryMs);
      const retry = await this.callGemini(config.geminiModel, prompt);
      if (retry.ok) return retry.text;

      throw new HttpError(429, "AI quota temporarily exceeded. Please wait a moment and try again.");
    }

    throw new HttpError(502, `Gemini request failed (${primary.status}).`);
  }
}
