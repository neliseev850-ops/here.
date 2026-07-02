export default async function handler(req, res) {
    // Проверка метода
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY;

    // ВАЖНО: Используй здесь ОФИЦИАЛЬНЫЙ адрес из их документации для Claude
    const API_URL = "https://aethercode.my/chat/completions";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "Claude Opus 4.8",
                messages: messages.slice(-5),
                max_tokens: 400
            })
        });

        const data = await response.json();

        // Если пришла ошибка от провайдера
        if (data.error) {
            console.error("Provider Error:", data.error);
            return res.status(200).json({
                choices: [{ 
                    message: { 
                        role: "assistant", 
                        content: `[provider error]: ${data.error.message || JSON.stringify(data.error)}` 
                    } 
                }]
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        // Ошибка сети или соединения
        console.error("Connection Error:", error.message);
        return res.status(200).json({
            choices: [{ 
                message: { 
                    role: "assistant", 
                    content: `[Connection error]: ${error.message}` 
                } 
            }]
        });
    }
}
