// ------------------------------------------------------------
// router.ts – Smart DGX backend router (Node.js compatible)
// ------------------------------------------------------------

const http = require('http');

exports.metadata = {
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

const BACKENDS = {
    reasoning: {
        host: "localhost",
        port: 18000,
        path: "/v1/chat/completions",
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
        defaultTemperature: 0.7,
    },
    coding: {
        host: "localhost",
        port: 33000,
        path: "/v1/chat/completions",
        model: "codellama/CodeLlama-34B-Instruct",
        defaultTemperature: 0.2,
    },
    chat: {
        host: "localhost",
        port: 11435,
        path: "/api/chat",
        model: "llama3.1:8b",
        defaultTemperature: 0.7,
    },
};

exports.run = async function ({ prompt, model_preference = "reasoning" }) {
    console.log("[DEBUG] Router starting with prompt:", prompt);

    if (!prompt?.trim()) {
        throw new Error("Prompt must be a non-empty string.");
    }

    const backend = BACKENDS[model_preference] || BACKENDS["reasoning"];
    console.log(`[DEBUG] Routing to ${backend.host}:${backend.port}${backend.path}`);

    const payload = JSON.stringify({
        model: backend.model,
        messages: [{ role: "user", content: prompt }],
        temperature: backend.defaultTemperature || 0.7,
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: backend.host,
            port: backend.port,
            path: backend.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        console.log("[DEBUG] Making HTTP request...");
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`[DEBUG] Received response with status ${res.statusCode}`);

                if (res.statusCode !== 200) {
                    reject(new Error(`DGX request failed (${res.statusCode}): ${data}`));
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed?.choices?.[0]?.message?.content;
                    if (typeof content !== "string") {
                        reject(new Error("Unexpected response shape from backend."));
                        return;
                    }
                    console.log("[DEBUG] Successfully parsed response");
                    resolve(content);
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error("[DEBUG] Connection error:", err);
            reject(new Error(`Connection failed: ${err.message}. Is the SSH tunnel running? Try: dgx-connect`));
        });

        req.setTimeout(10000, () => {
            console.error("[DEBUG] Request timeout after 10s");
            req.destroy();
            reject(new Error("Request timeout (10s). Is the DGX responding?"));
        });

        req.write(payload);
        req.end();
    });
};
