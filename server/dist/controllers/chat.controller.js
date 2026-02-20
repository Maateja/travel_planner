import { GoogleGenerativeAI } from '@google/generative-ai';
const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    return new GoogleGenerativeAI(key);
};
export const chatAssistant = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are BagsUp AI, a travel assistant inside the BagsUp website.
            You must only answer questions related to travel, trips, and the BagsUp platform.
            If asked about non-travel topics, politely refuse with: "I'm here to help you plan your trips and explore destinations. Please ask me something related to your travel plans 😊"`
        });
        // Ensure history matches Gemini format
        const formattedHistory = Array.isArray(history) ? history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.parts?.[0]?.text || h.content || '' }]
        })) : [];
        const chat = model.startChat({
            history: formattedHistory,
        });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        res.json({ text });
    }
    catch (error) {
        console.error('--- CHAT AI ERROR DETAIL ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        }
        console.error('----------------------------');
        res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
};
