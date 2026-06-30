export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY; 

    try {
        // Ограничиваем историю до 5 последних реплик для экономии твоих токенов Opus
        const limitedMessages = messages.slice(-5);

        // Отправляем запрос на шлюз AetherCode
        const response = await fetch("https://api.aethercode.my/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Меняем модель на Opus, чтобы тратились купленные токены из пакета
                model: "claude-3-opus-20240229", 
                messages: limitedMessages,
                max_tokens: 400 
            })
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Ошибка сервера при запросе к AetherCode' });
    }
}
