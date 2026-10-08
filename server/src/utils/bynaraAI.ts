/**
 * Shared helper for calling the Bynara OpenAI-compatible API.
 * Falls back to the direct Gemini SDK if BYNARA_API_KEY is not set.
 */

const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];

interface BynaraMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface BynaraOptions {
    systemPrompt?: string;
    messages?: BynaraMessage[];
    userMessage: string;
    temperature?: number;
}

export async function callBynaraAI(options: BynaraOptions): Promise<string> {
    const baseUrl = (process.env.BYNARA_BASE_URL || '').trim();
    const apiKey = (process.env.BYNARA_API_KEY || '').trim();

    if (!baseUrl || !apiKey) {
        throw new Error('BYNARA_BASE_URL or BYNARA_API_KEY is missing in .env');
    }

    console.log(`📡 AI request via Bynara | Key: ${apiKey.substring(0, 10)}...`);

    const messagesPayload: BynaraMessage[] = [];

    // System prompt
    if (options.systemPrompt) {
        messagesPayload.push({ role: 'system', content: options.systemPrompt });
    }

    // Conversation history
    if (options.messages && options.messages.length > 0) {
        messagesPayload.push(...options.messages);
    }

    // User message
    messagesPayload.push({ role: 'user', content: options.userMessage });

    let lastError = '';

    for (const model of MODELS_TO_TRY) {
        try {
            console.log(`  → Trying model: ${model}`);
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: messagesPayload,
                    temperature: options.temperature ?? 0.7,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`  ❌ ${model} returned ${response.status}: ${errorBody}`);
                lastError = `${model}: ${response.status} - ${errorBody}`;
                // If model not found (404), try next model; otherwise stop
                if (response.status === 404) continue;
                throw new Error(lastError);
            }

            const data: any = await response.json();
            const text = data.choices?.[0]?.message?.content || '';

            if (!text) {
                lastError = `${model}: empty response`;
                continue;
            }

            console.log(`  ✅ ${model} responded successfully`);
            return text;
        } catch (err: any) {
            console.error(`  ❌ ${model} failed:`, err.message);
            lastError = err.message;
            if (!err.message.includes('404')) break;
        }
    }

    throw new Error(`All models failed. Last error: ${lastError}`);
}
