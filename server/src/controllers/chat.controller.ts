import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '../models/ChatHistory.js';

interface AuthRequest extends Request {
    user?: any;
}

const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) {
        console.error('❌ GEMINI_API_KEY is missing in .env!');
    } else {
        console.log(`📡 AI Assistant initializing with API Key: ${key.substring(0, 8)}...`);
    }
    return new GoogleGenerativeAI(key);
};

export const listAvailableModels = async (req: Request, res: Response) => {
    try {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}


export const chatAssistant = async (req: AuthRequest, res: Response) => {
    try {
        const { message, history: frontendHistory } = req.body;
        const userId = req.user?.id || req.user?._id;
        
        console.log(`💬 Chat request from User: ${userId || 'Guest'} | API Key present: ${!!process.env.GEMINI_API_KEY}`);

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Fetch existing history from DB (if logged in and no frontend history provided)
        let history = [];
        let chatRecord = null;
        
        if (frontendHistory && Array.isArray(frontendHistory)) {
            history = frontendHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
        } else if (userId) {
            chatRecord = await ChatHistory.findOne({ userId });
            history = chatRecord ? chatRecord.messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })) : [];
        }

        // 2. Initialize Gemini with fallback logic
        const genAI = getGenAI();
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
        let text = "";
        let attemptSuccess = false;
        let lastErrorInfo = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Build a combined prompt with persona and history
                let promptSnippet = `Instructions: You are BagsUp AI, a professional travel assistant. 
1. Only answer travel-related questions. For non-travel questions, say: "I'm here to help you plan your trips and explore destinations. Please ask me something related to your travel plans 😊".
2. You MUST ONLY recommend and discuss places, cities, and attractions located within India. If a user asks about an international destination, politely inform them that you currently only assist with travel planning within India, and then suggest a similar experience inside India.
3. If a user mentions a destination in India or asks for a trip suggestion, be interactive. Politely ask for missing details to give a better recommendation.
4. Keep it conversational.

Recent conversation:\n`;
                
                history.slice(-5).forEach(h => {
                    promptSnippet += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts?.[0]?.text || ''}\n`;
                });

                promptSnippet += `User: ${message}\nAssistant:`;

                const result = await model.generateContent(promptSnippet);
                text = result.response.text();
                attemptSuccess = true;
                break;
            } catch (err: any) {
                console.error(`❌ ${modelName} failed:`, err.message);
                lastErrorInfo = err.message;
                if (!err.message.includes('404')) break; 
            }
        }

        if (!attemptSuccess) {
            throw new Error(`All models failed. Last error: ${lastErrorInfo}.`);
        }

        // 4. Save to DB (optional, only if user is logged in)
        if (userId) {
            if (!chatRecord) {
                chatRecord = await ChatHistory.findOne({ userId });
                if (!chatRecord) {
                    chatRecord = new ChatHistory({ userId, messages: [] });
                }
            }
            chatRecord.messages.push({ userId, role: 'user', content: message });
            chatRecord.messages.push({ userId, role: 'model', content: text });
            
            if (chatRecord.messages.length > 50) {
                (chatRecord.messages as any) = chatRecord.messages.slice(-50);
            }
            await chatRecord.save();
        }

        res.json({ text });
    } catch (error: any) {
        console.error('--- AI CHAT ERROR ---', error);
        res.status(500).json({ error: 'AI Service Error', details: error.message });
    }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        res.json({ messages: [] }); // We'll handle history in frontend localStorage
    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
};




