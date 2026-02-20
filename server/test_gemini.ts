import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const key = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName: string) {
    try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent("Say 'hello'");
        console.log(`✅ ${modelName} success!`);
    } catch (e: any) {
        console.error(`❌ ${modelName} failed:`, e.message);
    }
}

async function run() {
    await testModel("gemini-2.5-flash");
    await testModel("gemini-2.5-flash-lite");
    await testModel("gemini-2.5-pro");
    await testModel("gemini-2.0-flash");
}
run();
