export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY; 

    try {
        const response = await fetch("https://api.aethercode.my/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229", // Если это имя неверно, сервер сам напишет в ответе правильный ID
                messages: messages.slice(-5),
                max_tokens: 400 
            })
        });

        const data = await response.json();

        // Если шлюз вернул ошибку, выводим её текст прямо в интерфейс чата
        if (data.error) {
            const msg = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : data.error;
            return res.status(200).json({
                choices: [{ message: { role: "assistant", content: `Ответ от AetherCode: ${msg}` } }]
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(200).json({
            choices: [{ message: { role: "assistant", content: `Сбой на сервере Vercel: ${error.message}` } }]
        });
    }
}
