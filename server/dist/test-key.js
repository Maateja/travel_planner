import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
const testKey = async () => {
    let key = process.env.GEMINI_API_KEY;
    if (key)
        key = key.trim();
    console.log('Testing Key:', key ? key.substring(0, 5) + '...' : 'MISSING');
    if (!key) {
        console.error('No API Key found in .env');
        return;
    }
    try {
        console.log('Initializing GoogleGenerativeAI...');
        const genAI = new GoogleGenerativeAI(key);
        // Using "gemini-flash-latest" as it is the most compatible with this key
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log('Attempting to generate content...');
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log('Success! AI Response:', response.text());
    }
    catch (err) {
        console.error('API Test Failed!');
        console.error('Error Details:', err.message || err);
        if (err.status === 404) {
            console.error('Suggestion: The model name might be incorrect or unavailable for your key.');
        }
        else if (err.status === 429) {
            console.error('Suggestion: You have reached your API quota limit.');
        }
    }
};
testKey();
