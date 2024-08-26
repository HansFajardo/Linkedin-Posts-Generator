// backend/services/openaiService.js
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generatePosts(previews, context) {
    try {
        const responses = await Promise.all(previews.map(async (preview) => {
            const content = `${preview.title}\n\n${preview.description}`;
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: 'system', content: context },
                    { role: 'user', content: content } // Use both title and description
                ],
                max_tokens: 100
            });
            return { text: completion.choices[0].message.content };
        }));

        return responses;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
}


module.exports = { generatePosts };
