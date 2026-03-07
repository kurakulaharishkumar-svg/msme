import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import schemesData from '@/data/schemes.json';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const systemPrompt = `
You are the MSME Scheme Navigator Assistant, an expert advisor for Indian Micro, Small, and Medium Enterprises.
You must answer the user's questions based EXCLUSIVELY on the following JSON data of available government schemes.

If the user asks a question that cannot be answered using this data, politely inform them that you only have information about the provided schemes.
Do not make up any information, interest rates, or maximum amounts.
When recommending a scheme, always mention its exact name, category, and max_amount.
Format your responses beautifully using markdown (bullet points, bold text for emphasis).

AVAILABLE SCHEMES DATA:
${JSON.stringify(schemesData, null, 2)}
`;

    try {
        const result = await streamText({
            model: openai('gpt-3.5-turbo'),
            system: systemPrompt,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to generate response" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
