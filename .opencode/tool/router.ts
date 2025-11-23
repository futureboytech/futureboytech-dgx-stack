import { tool } from "@opencode-ai/plugin";

export default tool({
    description: "Smart router that sends queries to the best available DGX backend",
    args: {
        prompt: tool.schema.string().describe("The prompt to process"),
        model_preference: tool.schema.enum(["reasoning", "coding", "chat"]).optional().describe("Preferred model capability (default: reasoning)"),
    },
    async execute(args) {
        const http = require('http');
        const { prompt, model_preference = "reasoning" } = args;

        const BACKENDS = {
            reasoning: {
                host: "localhost",
                port: 18000,
                path: "/v1/chat/completions",
                model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
            },
            coding: {
                host: "localhost",
                port: 33000,
                path: "/v1/chat/completions",
                model: "codellama/CodeLlama-34B-Instruct",
            },
            chat: {
                host: "localhost",
                port: 11435,
                path: "/api/chat",
                model: "llama3.1:8b",
            },
        };

        const backend = BACKENDS[model_preference] || BACKENDS.reasoning;
        const payload = JSON.stringify({
            model: backend.model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: backend.host,
                port: backend.port,
                path: backend.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                },
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`DGX error (${res.statusCode}): ${data}`));
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed?.choices?.[0]?.message?.content;
                        if (!content) throw new Error("Invalid response from DGX");
                        resolve(content);
                    } catch (err) {
                        reject(new Error(`Parse error: ${err.message}`));
                    }
                });
            });

            req.on('error', err => reject(new Error(`Connection failed: ${err.message}. Is dgx-connect running?`)));
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error("Timeout (10s). Is the DGX responding?"));
            });

            req.write(payload);
            req.end();
        });
    },
});
