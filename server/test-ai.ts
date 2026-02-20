import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testGemini = async () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    console.log(`Testing with API Key: ${key.substring(0, 10)}...`);
    
    if (!key) {
        console.error('No API key found in .env file!');
        return;
    }

    try {
        console.log('\n--- Checking v1 Endpoint via Axios ---');
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
        const responseV1 = await axios.get(url);
        const dataV1 = responseV1.data;
        
        if (dataV1.error) {
            console.error('API Error Response:', JSON.stringify(dataV1.error, null, 2));
        } else {
            console.log('Available Models:', (dataV1.models || []).map((m: any) => m.name.replace('models/', '')).join(', '));
        }

        console.log('\n--- Testing Content Generation (gemini-2.5-flash) ---');
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent("Hello, respond with 'Success' if you can read this.");
        const text = result.response.text();
        console.log('✅ AI Response:', text);

    } catch (error: any) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

testGemini();
