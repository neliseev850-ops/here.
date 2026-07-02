export default async function handler(req, res) {

    if (req.method !== 'POST') {

        return res.status(405).json({ error: 'Method not allowed' });

    }



    const { messages } = req.body;

    const apiKey = process.env.CLAUDE_API_KEY; 



    // Убираем префикс "api.", стучимся прямо на их основной рабочий домен .my

    const API_URL = "https://aethercode.my/v1/chat/completions";



    try {

        const response = await fetch(API_URL, {

            method: 'POST',

            headers: {

                'Authorization': `Bearer ${apiKey}`,

                'Content-Type': 'application/json'

            },

            body: JSON.stringify({

                model: "Claude Opus 4.8", // Твоя модель, без изменений

                messages: messages.slice(-5),

                max_tokens: 400 

            })

        });



        const data = await response.json();



        if (data.error) {

            const msg = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : data.error;

            return res.status(200).json({

                choices: [{ message: { role: "assistant", content: `Ответ от AetherCode: ${msg}` } }]

            });

        }



        return res.status(200).json(data);



    } catch (error) {

        return res.status(200).json({

            choices: [{ message: { role: "assistant", content: `Ошибка подключения к ${API_URL}: ${error.message}` } }]

        });

    }

}
