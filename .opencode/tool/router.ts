// ------------------------------------------------------------
// router.ts – Smart DGX backend router
// ------------------------------------------------------------

export const metadata = {
    name: "router",
    description: "Smart router that sends queries to the best available DGX backend",
    parameters: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "The prompt to process",
            },
            model_preference: {
                type: "string",
                enum: ["reasoning", "coding", "chat"],
                description: "Preferred model capability",
            },
        },
        required: ["prompt"],
    },
};

/**
 * Configuration for each backend.  Add new entries here when you spin up
 * another service (e.g. Ollama, SGLang, etc.).
 */
const BACKENDS: Record<
    string,
    { url: string; model: string; defaultTemperature?: number }
> = {
    // vLLM – currently exposed via SSH tunnel on port 18000
    reasoning: {
        url: "http://localhost:18000/v1/chat/completions",
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
        defaultTemperature: 0.7,
    },
    // SGLang – placeholder values (replace with real ones)
    coding: {
        url: "http://localhost:30000/v1/chat/completions",
        model: "codellama/CodeLlama-34B-Instruct",
        defaultTemperature: 0.2,
    },
    // Ollama – placeholder values (replace with real ones)
    chat: {
        url: "http://localhost:11434/api/chat",
        model: "llama3.1:8b",
        defaultTemperature: 0.7,
    },
};

/**
 * Simple validation helper.
 */
function validatePrompt(prompt: string): void {
    if (!prompt?.trim()) {
        throw new Error("Prompt must be a non‑empty string.");
    }
    // Optional: enforce max length (e.g., 2048 tokens)
    const MAX_CHARS = 4096;
    if (prompt.length > MAX_CHARS) {
        throw new Error(`Prompt exceeds ${MAX_CHARS} characters limit.`);
    }
}

/**
 * Core router implementation.
 */
export async function run({
    prompt,
    model_preference = "chat",
}: {
    prompt: string;
    model_preference?: keyof typeof BACKENDS;
}): Promise<string> {
    // ---- Input validation -------------------------------------------------
    validatePrompt(prompt);

    // ---- Choose backend ----------------------------------------------------
    const backend = BACKENDS[model_preference] ?? BACKENDS["chat"];
    console.log(
        `Routing request [${model_preference}] → ${backend.url} (model=${backend.model})`
    );

    // ---- Build request payload ---------------------------------------------
    const payload = {
        model: backend.model,
        messages: [{ role: "user", content: prompt }],
        temperature: backend.defaultTemperature ?? 0.7,
    };

    // ---- Optional timeout (10 s) -------------------------------------------
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
        const response = await fetch(backend.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            // Propagate a richer error object
            const errText = await response.text().catch(() => "");
            throw new Error(
                `DGX request failed (${response.status} ${response.statusText}): ${errText}`
            );
        }

        const data = await response.json();
        // Assume OpenAI‑compatible response shape
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
            throw new Error("Unexpected response shape from backend.");
        }
        return content;
    } finally {
        clearTimeout(timeout);
    }
}
