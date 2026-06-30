export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, max_tokens } = req.body;
    const apiKey = process.env.GROQ_API_KEY; 

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Поменяли тяжелую модель 70b на легкую и быструю 8b с огромными лимитами
                model: "llama-3.1-8b-instant",
                messages: messages,
                max_tokens: max_tokens
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
}
