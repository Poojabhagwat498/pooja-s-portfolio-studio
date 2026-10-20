import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const briefSchema = z.object({
  name: z.string().trim().min(1).max(160),
  notes: z.string().trim().max(4000).default(""),
  problem: z.string().trim().max(2000).default(""),
  goals: z.string().trim().max(2000).default(""),
  features: z.string().trim().max(2000).default(""),
  technologies: z.string().trim().max(1000).default(""),
  challenges: z.string().trim().max(2000).default(""),
  outcomes: z.string().trim().max(2000).default(""),
  liveUrl: z.string().trim().max(400).default(""),
  repoUrl: z.string().trim().max(400).default(""),
});

export type CaseStudyBrief = z.infer<typeof briefSchema>;

const SYSTEM = `You write portfolio case studies for Pooja Bhagwat, a Computer Science & Engineering student and MERN stack developer.

Absolute rules:
- Use ONLY the facts supplied. Never invent metrics, numbers, percentages, user counts, revenue, company names, clients, awards, URLs or dates.
- If a section has no supporting information, write exactly "Not provided" under that heading.
- Keep a confident, plain, professional first-person voice. No marketing hype.

Return clean markdown with these headings in this order, each as "## Heading":
Project Overview, Problem, Goals, My Role, Technical Approach, Key Features, Architecture / Implementation, Challenges, Solutions, Outcomes, Technologies Used, Links.
Use short paragraphs and bullet lists. Keep the whole case study under roughly 700 words.`;

function fieldBlock(brief: CaseStudyBrief) {
  const rows: [string, string][] = [
    ["Project name", brief.name],
    ["Project notes", brief.notes],
    ["Problem statement", brief.problem],
    ["Goals", brief.goals],
    ["Features", brief.features],
    ["Technologies", brief.technologies],
    ["Challenges", brief.challenges],
    ["Outcomes", brief.outcomes],
    ["Live URL", brief.liveUrl],
    ["GitHub URL", brief.repoUrl],
  ];
  return rows.map(([label, value]) => `${label}: ${value ? value : "Not provided"}`).join("\n");
}

export const generateCaseStudy = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => briefSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "AI writing is not configured yet." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "medium", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        input: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Write the case study from these notes:\n\n${fieldBlock(data)}`,
          },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      console.error("AI gateway error", response.status, detail.slice(0, 600));
      const message =
        response.status === 429
          ? "The writing assistant is busy right now. Please try again in a moment."
          : response.status === 402 || response.status === 403
            ? "AI writing is unavailable on this workspace at the moment."
            : "The writing assistant could not finish. Please try again.";
      return { ok: false as const, error: message };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          }
        } catch {
          // ignore partial or non-JSON frames
        }
      }
    }

    if (!text.trim()) {
      return {
        ok: false as const,
        error: "The writing assistant returned nothing. Please try again.",
      };
    }

    return { ok: true as const, caseStudy: text.trim() };
  });
