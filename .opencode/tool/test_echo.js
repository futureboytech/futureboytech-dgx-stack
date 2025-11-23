module.exports = {
    metadata: {
        name: "test_echo",
        description: "Simple echo test",
        parameters: {
            type: "object",
            properties: {
                message: { type: "string" }
            },
            required: ["message"]
        }
    },

    execute: async function ({ message }) {
        return `Echo: ${message}`;
    }
};
