import { tool } from "@opencode-ai/plugin";

export default tool({
    description: "Query the DGX vLLM backend directly (DeepSeek-R1-Distill-Qwen-14B)",
    args: {
        prompt: tool.schema.string().describe("The prompt to send to the model"),
        temperature: tool.schema.number().optional().describe("Sampling temperature (default 0.7)"),
    },
    async execute(args) {
        const http = require('http');
        const { prompt, temperature = 0.7 } = args;

        const payload = JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
            messages: [{ role: "user", content: prompt }],
            temperature,
        });

        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 18000,
                path: '/v1/chat/completions',
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
                        reject(new Error(`vLLM error (${res.statusCode}): ${data}`));
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed?.choices?.[0]?.message?.content;
                        if (!content) throw new Error("Invalid response from vLLM");
                        resolve(content);
                    } catch (err) {
                        reject(new Error(`Parse error: ${err.message}`));
                    }
                });
            });

            req.on('error', err => reject(new Error(`Connection failed: ${err.message}. Is dgx-connect running?`)));
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error("Timeout. Is vLLM responding?"));
            });

            req.write(payload);
            req.end();
        });
    },
});
