// ------------------------------------------------------------
// vllm.ts – Direct vLLM backend access (Node.js compatible)
// ------------------------------------------------------------

import * as http from 'http';

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

export async function run({
    prompt,
    temperature = 0.7
}: {
    prompt: string;
    temperature?: number;
}): Promise<string> {
    const payload = JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 18000,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`vLLM Error (${res.statusCode}): ${data}`));
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed?.choices?.[0]?.message?.content;
                    if (typeof content !== "string") {
                        reject(new Error("Unexpected response shape from vLLM."));
                        return;
                    }
                    resolve(content);
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Connection failed: ${err.message}. Is dgx-connect running?`));
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error("Request timeout. Is vLLM responding?"));
        });

        req.write(payload);
        req.end();
    });
}
