import { Request, Response } from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { callBynaraAI } from '../utils/bynaraAI.js';

interface AuthRequest extends Request {
    user?: any;
}

export const listAvailableModels = async (req: Request, res: Response) => {
    try {
        const baseUrl = (process.env.BYNARA_BASE_URL || '').trim();
        const apiKey = (process.env.BYNARA_API_KEY || '').trim();
        const response = await fetch(`${baseUrl}/models`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
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
        
        console.log(`💬 Chat request from User: ${userId || 'Guest'} | API Key present: ${!!process.env.BYNARA_API_KEY}`);

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Build conversation history for OpenAI-compatible format
        let historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
        let chatRecord: any = null;
        
        if (frontendHistory && Array.isArray(frontendHistory)) {
            historyMessages = frontendHistory.slice(-5).map((m: any) => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: m.content
            }));
        } else if (userId) {
            chatRecord = await ChatHistory.findOne({ userId });
            if (chatRecord) {
                historyMessages = chatRecord.messages.slice(-5).map((m: any) => ({
                    role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                    content: m.content
                }));
            }
        }

        // 2. Call Bynara AI
        const systemPrompt = `You are BagsUp AI, a professional travel assistant. 
1. Only answer travel-related questions. For non-travel questions, say: "I'm here to help you plan your trips and explore destinations. Please ask me something related to your travel plans 😊".
2. You MUST ONLY recommend and discuss places, cities, and attractions located within India. If a user asks about an international destination, politely inform them that you currently only assist with travel planning within India, and then suggest a similar experience inside India.
3. If a user mentions a destination in India or asks for a trip suggestion, be interactive. Politely ask for missing details to give a better recommendation.
4. Keep it conversational.`;

        const text = await callBynaraAI({
            systemPrompt,
            messages: historyMessages,
            userMessage: message,
        });

        // 3. Save to DB (optional, only if user is logged in)
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
