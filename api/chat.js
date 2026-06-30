export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY; 

    try {
        const limitedMessages = messages.slice(-5);

        const response = await fetch("https://api.aethercode.my/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Если "claude-3-opus" выдаст ошибку, попробуй изменить на "claude-3.5-opus"
                model: "claude-3-opus", 
                messages: limitedMessages,
                max_tokens: 400 
            })
        });

        const data = await response.json();
        console.log("AetherCode API Response:", data);

        return res.status(200).json(data);

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: 'Ошибка при вызове Claude Opus 4.8' });
    }
}
