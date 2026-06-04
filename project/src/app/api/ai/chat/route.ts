import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("[AI API] Raw incoming messages:", JSON.stringify(messages, null, 2));

    // BlockNote AI Extension uses a "parts" array under the hood instead of a simple "content" string.
    // The Vercel AI SDK strictly expects a { role, content } schema for `streamText` and will fail validation
    // with `AI_TypeValidationError` if it encounters unknown properties like "metadata", "parts", or "id".
    // This map ensures we extract the text parts and return a strictly valid structure.
    const formattedMessages = messages.map((msg: any) => {
      let content = msg.content;
      // If content is empty but parts are available, convert the Blocknote "parts" array to a string.
      if (msg.parts && !content) {
        content = msg.parts.map((p: any) => p.text || '').join('\n');
      }
      return {
        role: msg.role,
        content: content,
      };
    });

    console.log("[AI API] Formatted messages for AI SDK:", JSON.stringify(formattedMessages, null, 2));

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: formattedMessages,
    });

    console.log("[AI API] Stream initialized successfully. Returning to client...");

    // In Vercel AI SDK (ai @ 6.x installed locally), the method is named 
    // `toUIMessageStreamResponse()` instead of the traditional `toDataStreamResponse()`.
    // Blocknote expects this exact UI message stream format.
    // return result.toUIMessageStreamResponse();

    // Try using a pure text stream. In some setups, Blocknote's transport parses
    // raw text chunks directly if the Vercel Data Stream headers are missing.
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[AI API] Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
