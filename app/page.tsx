"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { EnterIcon, LoadingIcon } from "@/app/lib/icons";
import { usePlayer } from "@/app/lib/usePlayer";
import { track } from "@vercel/analytics";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { Wand2, Code2, Search, Pen } from 'lucide-react';
import debounce from 'lodash/debounce';

type MessageRole = "user" | "assistant";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

type Message = {
  role: MessageRole;
  content: string;
  thinking?: string;
  latency?: number;
};

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

function useActionState<T, A>(
  action: (prev: T, arg: A) => Promise<T>,
  initialState: T
): [T, (arg: A) => void, boolean] {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);

  const submit = useCallback(
    async (arg: A) => {
      setIsPending(true);
      try {
        const result = await action(state, arg);
        setState(result);
      } finally {
        setIsPending(false);
      }
    },
    [action, state]
  );

  return [state, submit, isPending];
}

export default function Home() {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const [input, setInput] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const player = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string>("");
  const [suggestionTimer, setSuggestionTimer] = useState<NodeJS.Timeout | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, submit, isPending] = useActionState<Message[], string | Blob>(
    async (prevMessages, data) => {
      try {
        const formData = new FormData();

        if (typeof data === "string") {
          formData.append("input", data);
          track("Text input");
        } else {
          formData.append("input", data, "audio.wav");
          track("Speech input");
        }

        for (const message of prevMessages) {
          formData.append(
            "message",
            JSON.stringify({
              role: message.role,
              content: message.content,
            })
          );
        }

        const submittedAt = Date.now();
        const response = await fetch("/api", {
          method: "POST",
          body: formData,
        });

        if (!response.ok || !response.body) {
          if (response.status === 429) {
            toast.error("Too many requests. Please try again later.");
          } else {
            toast.error((await response.text()) || "An error occurred.");
          }
          return prevMessages;
        }

        const transcript = decodeURIComponent(
          response.headers.get("X-Transcript") || ""
        );

        setInput(transcript);
        setIsStreaming(true);
        setStreamingContent("");

        const newMessages: Message[] = [
          ...prevMessages,
          { role: "user", content: transcript },
        ];

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let currentThinking = '';
        let isThinking = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content') {
                    if (data.content.includes('<think>')) {
                      isThinking = true;
                      continue;
                    }
                    if (data.content.includes('</think>')) {
                      isThinking = false;
                      continue;
                    }

                    if (isThinking) {
                      currentThinking += data.content;
                    } else {
                      fullContent += data.content;
                      setStreamingContent(fullContent);
                    }
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } finally {
          setIsStreaming(false);
          if (fullContent.trim()) {
            newMessages.push({
              role: "assistant",
              content: fullContent,
              thinking: currentThinking,
              latency: Date.now() - submittedAt,
            });
          }
        }

        return newMessages;
      } catch (error) {
        console.error("Error processing request:", error);
        toast.error("Something went wrong. Please try again.");
        return prevMessages;
      }
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    e.target.style.height = '44px';
    const newHeight = newValue 
      ? Math.min(Math.max(44, e.target.scrollHeight), 200)
      : '44px';
    e.target.style.height = newHeight + 'px';
  };

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      submit(input);
    }
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex w-full h-full @container/mainview">
        <main className="h-dvh flex-grow flex-shrink relative selection:bg-highlight w-0 @container">
          <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-sm">
            <div className="h-full w-full max-w-[90rem] mx-auto px-4">
              <div className="relative flex items-center justify-between h-full w-full">
                {/* Parrot text - centered on mobile, left-aligned on desktop */}
                <div className={`${isMobile ? 'absolute left-1/2 -translate-x-1/2' : 'ml-4'}`}>
                  <a href="/" className="text-primary font-medium text-lg">
                    Parrot
                  </a>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col items-center justify-between w-full h-full gap-6 p-2 pt-20 mx-auto @sm:justify-center @sm:p-4 @sm:gap-9 @lg:w-4/5">
            {/* Main content area */}
            <div className="flex flex-col items-start justify-center w-full @sm:px-4 px-2 gap-6 @sm:gap-4 @lg:w-4/5 max-w-[50rem] flex-1 @sm:flex-initial pb-24 @sm:pb-0 @[80rem]:ml-[-4rem] @[80rem]:translate-x-12">
              <h1 className="w-full text-2xl flex-col tracking-tight @sm:text-3xl text-primary flex items-center justify-center text-center">
                {getTimeBasedGreeting()}.
                <span className="text-[#B9BCC1]">How can I help you today?</span>
              </h1>
              <div className="w-full flex flex-col items-center gap-4 max-w-[50rem]">
                <div className="flex flex-row gap-2 flex-wrap justify-center">
                  <QuickActionButton icon={<Search />} text="Research" />
                  <QuickActionButton icon={<Wand2 />} text="How to" />
                  <QuickActionButton icon={<Code2 />} text="Analyze" />
                  <QuickActionButton icon={<Pen />} text="Create images" />
                  <QuickActionButton icon={<Code2 />} text="Code" />
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className={`flex flex-col items-center w-full gap-1 @sm:gap-4 fixed sm:absolute bottom-0 left-0 right-0 mx-auto inset-x-0 max-w-[50rem] z-50 ${messages?.length > 0 || isStreaming ? 'bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-20' : ''} @[80rem]:translate-x-12`}>
              <div className="flex flex-col-reverse items-center justify-between flex-1 w-full gap-0 @sm:gap-5 @sm:flex-col relative px-2 sm:px-2 py-2">
                <form onSubmit={handleFormSubmit} className="bottom-0 w-full text-base flex flex-col gap-2 items-center justify-center relative z-10 mt-2">
                  <div className="flex flex-row justify-center w-full relative @lg:w-4/5 px-1.5 sm:px-0">
                    <div className="query-bar group bg-input-background duration-100 relative w-full max-w-none sm:max-w-[50rem] ring-1 ring-input-border ring-inset overflow-hidden @container/input hover:ring-card-border-focus hover:bg-input-background-hover focus-within:ring-1 focus-within:ring-input-border-focus hover:focus-within:ring-input-border-focus pb-12 px-2 @[480px]/input:px-3 rounded-3xl">
                      <div className="relative z-10">
                        <span className="absolute px-2 @[480px]/input:px-3 py-5 text-secondary pointer-events-none">
                          {input ? '' : 'What do you want to know?'}
                        </span>
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={handleInputChange}
                          dir="auto"
                          aria-label="Ask Parrot anything"
                          className="w-full px-2 @[480px]/input:px-3 bg-transparent focus:outline-none text-primary align-bottom min-h-[44px] @[80rem]:min-h-[44px] pt-5 my-0 mb-5 transition-all duration-200 ease-in-out placeholder:text-secondary/75 hover:placeholder:text-secondary/90"
                          style={{
                            resize: 'none',
                            height: '44px',
                            minHeight: '44px',
                            maxHeight: '200px',
                            width: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleFormSubmit(e as any);
                            }
                          }}
                        />
                      </div>

                      {/* Submit button */}
                      <div className="flex gap-1.5 absolute inset-x-0 bottom-0 border-t border-input-border p-2 @[480px]/input:p-3 max-w-full bg-background/80 backdrop-blur-sm rounded-b-3xl">
                        <div className="flex items-center justify-end w-full">
                          <button
                            type="submit"
                            disabled={!input.trim() || isPending}
                            className="h-9 w-9 relative flex flex-col items-center justify-center rounded-full ring-inset before:absolute before:inset-0 before:rounded-full before:bg-primary before:ring-0 before:transition-all duration-500 bg-button-secondary text-secondary before:[clip-path:circle(0%_at_50%_50%)] ring-0 hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-button-secondary"
                          >
                            {isPending ? <LoadingIcon /> : <EnterIcon />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Terms text */}
              <div className="text-[11px] hidden md:block text-secondary text-nowrap fixed bottom-6 left-0 right-0 text-center z-[60] pointer-events-none">
                <span className="pointer-events-auto">
                  By messaging Parrot, you agree to our
                  <a className="text-primary hover:underline px-1" href="https://x.ai/legal/terms-of-service" target="_blank" rel="noopener noreferrer">Terms</a>
                  and
                  <a className="text-primary hover:underline px-1" href="https://x.ai/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Quick action button component
function QuickActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div role="button" className="flex items-center text-primary text-sm font-medium rounded-2xl px-3 py-2 border border-input-border hover:bg-input-hover cursor-pointer transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-ring" tabIndex={0}>
      <div className="mr-2 text-secondary">
        {icon}
      </div>
      <p className="overflow-hidden whitespace-nowrap text-ellipsis">{text}</p>
    </div>
  );
}
