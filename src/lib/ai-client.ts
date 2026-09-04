/**
 * OpenRouter AI Client for SiteFlow Advisory Copilot
 * Uses OpenRouter API (OpenAI-compatible) to power real LLM responses
 * Model: meta-llama/llama-3.1-8b-instruct:free (free tier on OpenRouter)
 */

const OPENROUTER_API_KEY = "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";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
// Confirmed working models on this OpenRouter account:
// - "meta-llama/llama-3.1-8b-instruct"  ← fast, cheap (~$0.0001/call), RECOMMENDED
// - "anthropic/claude-3-haiku"           ← higher quality, slightly more expensive
// Free-tier (:free) models require minimum credit balance — use paid slugs above instead
const MODEL = "meta-llama/llama-3.1-8b-instruct";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call OpenRouter LLM with a context-enriched prompt
 */
export async function callAiAdvisory(
  userQuery: string,
  systemContext: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messages: AiMessage[] = [
    {
      role: "system",
      content: systemContext,
    },
    {
      role: "user",
      content: userQuery,
    },
  ];

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://siteflow.app",
      "X-Title": "SiteFlow SOP Governance Platform",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: !!onChunk,
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  // Streaming mode
  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // ignore parse errors on partial chunks
        }
      }
    }
    return fullText;
  }

  // Non-streaming mode
  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "No response from AI.";
}

/**
 * Build the system prompt with live platform data context
 */
export function buildSiteflowContext(data: {
  projects: Array<{ name: string; status: string; code: string }>;
  openIssues: Array<{ title: string; severity: string; status: string; project?: string | undefined }>;
  openCapas: Array<{ title: string; capa_stage?: string | null | undefined; severity: string }>;
  scheduledAudits: Array<{ title: string; status: string; sop_name: string; project_name: string }>;
  failedAudits: Array<{ title: string; sop_name: string; project_name: string }>;
  sops: Array<{ name: string; lifecycle_status?: string | undefined; department: string }>;
  qualifications: Array<{ user_name: string; sop_title: string; status: string }>;
}): string {
  return `You are the SiteFlow AI Advisory Copilot for a Construction SOP Governance Platform. 
You analyze real-time construction quality data and provide concise, actionable insights to project managers and quality teams.

CURRENT PLATFORM DATA:
- Projects: ${data.projects.map((p) => `${p.name} [${p.code}] — ${p.status}`).join("; ")}
- Open Issues/NCRs: ${data.openIssues.length} open (${data.openIssues.map((i) => `"${i.title}" [${i.severity}] on ${i.project ?? "project"}`).slice(0, 5).join("; ")})
- CAPA Items: ${data.openCapas.length} active (${data.openCapas.map((c) => `"${c.title}" — Stage: ${c.capa_stage ?? "Open"}`).slice(0, 5).join("; ")})
- Scheduled Audits: ${data.scheduledAudits.map((a) => `"${a.title}" [${a.status}] for ${a.sop_name} on ${a.project_name}`).slice(0, 5).join("; ")}
- Failed Audits: ${data.failedAudits.length} failed (${data.failedAudits.map((a) => `"${a.title}" SOP: ${a.sop_name}`).slice(0, 3).join("; ")})
- SOP Library: ${data.sops.length} SOPs (${data.sops.filter((s) => s.lifecycle_status === "Effective").length} effective, ${data.sops.filter((s) => s.lifecycle_status === "Draft").length} in draft)
- Workforce Qualifications: ${data.qualifications.filter((q) => q.status === "Qualified").length} qualified, ${data.qualifications.filter((q) => q.status === "In Progress").length} in progress

RESPONSE GUIDELINES:
- Be concise and professional. Use bullet points and bold text with markdown.
- Always reference actual names from the data above — never use placeholders.
- Prioritize safety-critical and high-severity items first.
- Provide 2-3 actionable recommendations where appropriate.
- Keep responses under 350 words.
- You CANNOT approve SOPs, close CAPAs, or make compliance decisions — only advise.`;
}
