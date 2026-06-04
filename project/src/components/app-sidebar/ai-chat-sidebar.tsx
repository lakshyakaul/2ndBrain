'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useActiveEditor } from '@/lib/providers/active-editor-provider';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useSidebarToggle } from '@/lib/providers/sidebar-toggle-provider';

interface AIChatSidebarProps {
  className?: string;
}

export default function AIChatSidebar({ className }: AIChatSidebarProps) {
  const { editor, yDoc, setIsAIAgentActive } = useActiveEditor();
  const { sidebarOpen } = useSidebarToggle();

  const [input, setInput] = useState('');
  // AI SDK v3 chat flow: sendMessage is the supported entrypoint for this app version.
  // We only send the active editor snapshot as context; the model should not mutate UI state directly.
  const { messages, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/sidebar-chat' }),
    onError: (error) => {
      console.error('[AI Workflow Error] useChat onError:', error);
    },
    onFinish: (message) => {
      console.log('[AI Workflow Step 5] Chat finished generating:', message);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = async (e: React.FormEvent, payload?: any) => {
    e.preventDefault();
    console.log('[AI Workflow Step 1] ai-chat-sidebar handleSubmit - User sent message:', input);
    console.log('[AI Workflow Step 1b] Attached payload:', payload);

    if (!input.trim()) return;

    // Keep the request payload minimal and explicit so the backend can reconstruct context.
    // This prevents accidental destructive actions because the server only receives a snapshot,
    // not direct write access to the editor.
    try {
      await sendMessage(
        { role: 'user', parts: [{ type: 'text', text: input }] },
        { body: { data: payload?.data } }
      );
      console.log('[AI Workflow Step 1c] sendMessage dispatched successfully.');
    } catch (error) {
      console.error('[AI Workflow Error] sendMessage failed:', error);
    }

    setInput('');
  };

  useEffect(() => {
    console.log('[AI Workflow] isLoading changed to:', isLoading);
    setIsAIAgentActive(isLoading);
  }, [isLoading, setIsAIAgentActive]);

  useEffect(() => {
    console.log('[AI Workflow] Messages updated. Count:', messages.length);
    if (messages.length > 0) {
      console.log('Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  // Execute client-side tool calls
  useEffect(() => {
    if (!editor || !messages.length) return;
    const lastMessage = messages[messages.length - 1];

    console.log('[AI Workflow DEBUG] Client lastMessage:', lastMessage.role, lastMessage.parts?.map(p => p.type));

    if (lastMessage.role === 'assistant' && lastMessage.parts) {
      lastMessage.parts.forEach(async (part) => {
        console.log('[AI Workflow DEBUG] Part details:', JSON.stringify(part));

        // In AI SDK 3.1+, static tools have type: 'tool-${toolName}' and dynamic tools have type: 'dynamic-tool'
        const isToolPart = part.type.startsWith('tool-') || part.type === 'dynamic-tool';

        if (isToolPart) {
          const invocation = part as any;
          const toolName = part.type === 'dynamic-tool' ? invocation.toolName : part.type.replace('tool-', '');

          // Execute if in 'call' state (some versions might use 'input-available' when streaming finishes, checking both)
          if (invocation.state !== 'call' && invocation.state !== 'input-available') return;

          console.log('[AI Workflow] Executing tool:', toolName, invocation.input || invocation.args);
          try {
            const args = invocation.input || invocation.args; // Fallback for diff AI SDK versions
            if (toolName === 'insertBlock') {
              const { text, placement, referenceBlockId } = args;
              const newBlocks = await editor.tryParseMarkdownToBlocks(text);
              if (placement === 'end') {
                editor.insertBlocks(newBlocks, editor.document[editor.document.length - 1], 'after');
              } else if (placement === 'start') {
                editor.insertBlocks(newBlocks, editor.document[0], 'before');
              } else if (placement === 'after' && referenceBlockId) {
                editor.insertBlocks(newBlocks, referenceBlockId, 'after');
              }
              addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: 'Block inserted successfully.' });
            } else if (toolName === 'updateBlock') {
              const { id, text } = args;
              const parsed = await editor.tryParseMarkdownToBlocks(text);
              editor.updateBlock(id, parsed[0] || { type: 'paragraph', content: text });
              addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: 'Block updated successfully.' });
            } else if (toolName === 'deleteBlock') {
              const { id } = args;
              editor.removeBlocks([id]);
              addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: 'Block deleted successfully.' });
            } else if (toolName === 'replaceDocument') {
              const { content } = args;
              const newBlocks = await editor.tryParseMarkdownToBlocks(content);
              editor.replaceBlocks(editor.document, newBlocks);
              addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: 'Document replaced successfully.' });
            } else {
              addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: 'Unknown tool' });
            }
          } catch (err: any) {
            console.error('[AI Workflow ERROR] Tool execution failed:', err);
            addToolResult({ tool: toolName, toolCallId: invocation.toolCallId, output: `Failed: ${err.message}` });
          }
        }
      });
    }
  }, [messages, editor, addToolResult]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // If sidebar is closed, don't render content (handled by layout, but just in case)
  if (!sidebarOpen) return null;

  return (
    <aside className={twMerge('flex flex-col w-[320px] shrink-0 border-r border-border/50 bg-background/80 backdrop-blur-md h-full relative', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/50 shrink-0">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Assistant</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {editor ? 'Connected to Canvas' : 'Waiting for Editor...'}
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3 mt-10">
              <Bot size={40} className="opacity-20" />
              <p className="text-sm">I am your AI agent.<br />I can read your canvas and help you write!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((m: UIMessage) => (
                <div key={m.id} className={twMerge("flex gap-3 text-sm", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={twMerge(
                    "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full",
                    m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border/50"
                  )}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={twMerge(
                    "flex flex-col gap-1 max-w-[80%]",
                    m.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={twMerge(
                      "px-3 py-2 rounded-xl whitespace-pre-wrap leading-relaxed",
                      m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted border border-border/30 rounded-tl-sm"
                    )}>
                      {m.parts?.map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index}>{part.text}</span>;
                        }
                        const isToolPart = part.type.startsWith('tool-') || part.type === 'dynamic-tool';
                        if (isToolPart) {
                          const toolInvocation = part as any;
                          const toolName = part.type === 'dynamic-tool' ? toolInvocation.toolName : part.type.replace('tool-', '');

                          return (
                            <div key={index} className="mt-2 p-2 bg-background/50 rounded border border-border/30 text-xs text-muted-foreground flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary">
                                  {toolName === 'insertBlock' ? 'Inserting block' :
                                    toolName === 'updateBlock' ? 'Updating block' :
                                      toolName === 'deleteBlock' ? 'Deleting block' :
                                        toolName === 'replaceDocument' ? 'Replacing document' : toolName}
                                </span>
                                {toolInvocation.state === 'input-available' || toolInvocation.state === 'call' ? (
                                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Running</span>
                                ) : (
                                  <span className="text-[10px] bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">✓ Success</span>
                                )}
                              </div>
                              {/* Optionally render arguments for debugging */}
                              {/* <pre className="overflow-x-auto text-[10px] opacity-70">
                                {JSON.stringify(toolInvocation.input || toolInvocation.args, null, 2)}
                              </pre> */}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground border border-border/50">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/50 shrink-0">
        <form onSubmit={(e) => {
          // Snapshot only: keep page context read-only at the transport boundary.
          // The AI response is rendered as chat output; it should not directly edit content here.
          handleSubmit(e, {
            data: editor ? {
              pageContent: JSON.stringify(editor.document.map((b: any) => ({
                id: b.id,
                type: b.type,
                content: b.content
              })))
            } : undefined
          });
        }} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to edit the page..."
            className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary h-10 text-sm"
            disabled={!editor}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || !editor}
            className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            <Send size={16} className={twMerge(input.trim() ? "translate-x-0.5 -translate-y-0.5" : "")} />
          </Button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground">Press Enter to send</span>
        </div>
      </div>
    </aside>
  );
}
