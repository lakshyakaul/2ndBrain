import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, data, system_prompt } = body;

    console.log('[AI Workflow Step 2] /api/ai/sidebar-chat received POST request.');
    console.log('[AI Workflow Step 2b] Messages count:', messages?.length);
    console.log('[AI Workflow Step 2c] Context data attached:', !!data);

    // The route only converts chat messages into model messages and streams the assistant reply.
    // It must not modify editor content or mutate the incoming payload, because the sidebar is
    // a read-only context source and the UI renders the assistant output separately.
    // If API key is missing, this is where it'd fail
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('[AI Workflow ERROR] GOOGLE_GENERATIVE_AI_API_KEY is missing!');
    }

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: system_prompt || "You are a helpful AI assistant inside a workspace editor. You can help the user write, edit, and organize their content.",
      messages: await convertToModelMessages(messages),
    });

    console.log('[AI Workflow Step 3] Stream established with LLM api provider.');

    // Return UI-message streaming so the client can render assistant parts exactly as emitted.
    // This preserves text chunks, finish events, and future tool/data parts without lossy parsing.
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: async ({ stream }) => {
        const reader = stream.getReader();
        const chunks: string[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          console.log('[AI Workflow Step 3b] Stream chunk count:', chunks.length);
          console.log('[AI Workflow Step 3c] Stream preview:', chunks.join(''));
        } catch (streamError) {
          console.error('[AI Workflow Step ERROR] Failed while consuming SSE stream:', streamError);
        } finally {
          reader.releaseLock();
        }
      },
      onFinish: async ({ messages: finishedMessages, responseMessage, finishReason }) => {
        console.log('[AI Workflow Step 3d] Stream finished. Finish reason:', finishReason);
        console.log('[AI Workflow Step 3e] Final message count:', finishedMessages.length);
        console.log('[AI Workflow Step 3f] Response message:', responseMessage);
      },
    });
  } catch (error: any) {
    console.error('[AI Workflow Step ERROR] Route handler crashed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
