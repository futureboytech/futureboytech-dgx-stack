
export const metadata = {
    name: "vllm",
    description: "Query the DGX vLLM backend directly (DeepSeek-R1-Distill-Qwen-14B)",
    parameters: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "The prompt to send to the model",
            },
            temperature: {
                type: "number",
                description: "Sampling temperature (default 0.7)",
            },
        },
        required: ["prompt"],
    },
};

export async function run({ prompt, temperature = 0.7 }) {
    // Use the tunnel port 18000
    const response = await fetch("http://localhost:18000/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
        }),
    });

    if (!response.ok) {
        throw new Error(`vLLM Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
