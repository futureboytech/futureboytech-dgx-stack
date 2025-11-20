
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

export async function run({ prompt, model_preference = "chat" }) {
    // Simple routing logic:
    // For now, we route everything to vLLM since it's our active backend.
    console.log(`Routing request [${model_preference}] to vLLM...`);

    const response = await fetch("http://localhost:18000/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        return `Error reaching DGX: ${response.statusText}. Is the tunnel open?`;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
