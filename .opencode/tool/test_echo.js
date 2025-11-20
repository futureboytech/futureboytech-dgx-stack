// Minimal test tool - just echoes back the input
exports.metadata = {
    name: "test_echo",
    description: "Simple echo test to verify tool system works",
    parameters: {
        type: "object",
        properties: {
            message: {
                type: "string",
                description: "Message to echo back",
            },
        },
        required: ["message"],
    },
};

exports.run = async function ({ message }) {
    return `Echo: ${message}`;
};
