"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { EnterIcon, LoadingIcon } from "@/lib/icons";
import { usePlayer } from "@/lib/usePlayer";
import { track } from "@vercel/analytics";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { Command, Search, Wand2, Code2, Brain, MessageSquareText, Settings, HelpCircle, ChevronDown, MenuIcon, PlusIcon, Pen } from 'lucide-react';
import debounce from 'lodash/debounce';

// When we send prompt to ai, we want this new styles: flex flex-col items-center w-full gap-1 @sm:gap-4 absolute bottom-0 mx-auto inset-x-0 max-w-[50rem] z-50


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

type TemplatePrompt = {
  text: string;
  icon: React.ReactNode;
};

// Add window size hook at the top with other hooks
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
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default function Home() {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768; // Mobile breakpoint
  const [input, setInput] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const player = usePlayer();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string>("");
  const [suggestionTimer, setSuggestionTimer] = useState<NodeJS.Timeout | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);


  // Added keydown handler for tab completion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && activeSuggestion) {
      e.preventDefault();
      setInput(activeSuggestion);
      setActiveSuggestion("");
    }
  };

  // Modified input change handler to handle text clearing
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Adjust textarea height
    e.target.style.height = '44px'; // Reset height first
    const newHeight = newValue 
      ? Math.min(Math.max(44, e.target.scrollHeight), 200)
      : '44px';
    e.target.style.height = newHeight + 'px';

    // Clear suggestion handling
    if (newValue.endsWith(" ")) {
      setActiveSuggestion("");
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
        setSuggestionTimer(null);
      }
    } else {
      getSuggestions(newValue);
    }
  };

  // Update renderInput to use new handler
  function renderInput() {
    return (
      <div className="relative w-full">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Parrot..."
          className="block w-full resize-none border-0 h-10 px-0 py-2 text-token-text-primary placeholder:text-token-text-tertiary focus:outline-none dark:bg-transparent dark:text-neutral-200 dark:placeholder-neutral-400"
        />
        {activeSuggestion && (
          <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
            <span className="opacity-0">{input}</span>
            <span className="flex items-center text-neutral-400">
              {activeSuggestion.slice(input.length)}
              <span className="inline-flex items-center justify-center text-[9px] font-medium ml-1 px-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                TAB
              </span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // text-neutral-800 placeholder-neutral-500 bg-transparent border border-neutral-200 rounded-lg focus:outline-none focus:border-primary

  const vad = useMicVAD({
    startOnLoad: true,
    onSpeechEnd: (audio) => {
      player.stop();
      const wav = utils.encodeWAV(audio);
      const blob = new Blob([wav], { type: "audio/wav" });
      submit(blob);
      const isFirefox = navigator.userAgent.includes("Firefox");
      if (isFirefox) vad.pause();
    },
    workletURL: "/vad.worklet.bundle.min.js",
    modelURL: "/silero_vad.onnx",
    positiveSpeechThreshold: 0.6,
    minSpeechFrames: 4,
    ortConfig(ort) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );

      ort.env.wasm = {
        wasmPaths: {
          "ort-wasm-simd-threaded.wasm":
            "/ort-wasm-simd-threaded.wasm",
          "ort-wasm-simd.wasm": "/ort-wasm-simd.wasm",
          "ort-wasm.wasm": "/ort-wasm.wasm",
          "ort-wasm-threaded.wasm": "/ort-wasm-threaded.wasm",
        },
        numThreads: isSafari ? 1 : 4,
      };
    },
  });

  // Modify suggestion handling with delay
  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setActiveSuggestion("");
        return;
      }

      // Clear any existing timer
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
      }

      // Set new timer for 2 second delay
      const timer = setTimeout(async () => {
        try {
          const response = await fetch("/api/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) throw new Error("Failed to fetch suggestions");
          const data = await response.json();

          if (data.suggestions?.length > 0) {
            setActiveSuggestion(data.suggestions[0]);
          } else {
            setActiveSuggestion("");
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setActiveSuggestion("");
        }
      }, 1000); // 2 second delay

      setSuggestionTimer(timer);
    }, 200),
    [suggestionTimer]
  );

  useEffect(() => {
    return () => {
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
      }
    };
  }, [suggestionTimer]);

  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === "Enter") return inputRef.current?.focus();
      if (e.key === "Escape") return setInput("");
      if (e.key === "z" && e.ctrlKey) {
        e.preventDefault();
        setShowThinking(prev => !prev);
      }
    }

    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, []);

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

        // Remove the text and thinking checks since we're streaming
        setInput(transcript);
        setIsStreaming(true);
        setStreamingContent("");

        // Add the user message immediately with explicit type
        const newMessages: Message[] = [
          ...prevMessages,
          {
            role: "user" as const,
            content: transcript,
          },
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
          // Add the complete assistant message with explicit type
          if (fullContent.trim()) {
            newMessages.push({
              role: "assistant" as const,
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

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      submit(input);
    }
  }

  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

  return (
    <div className="flex w-full h-full">
      <div className="flex w-full h-full @container/mainview">
        <main className="h-dvh flex-grow flex-shrink relative selection:bg-highlight w-0 @container">
          <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-sm">
            <div className="h-full w-full max-w-[90rem] mx-auto px-4">
              <div className="relative flex items-center h-full w-full" style={{ 
                justifyContent: isMobile ? 'space-between' : 'flex-start',
                gap: isMobile ? '0' : '1rem'
              }}>
                {/* Left side - Menu (mobile) or Logo (desktop) */}
                <div className="flex-none lg:flex-1" style={{
                  width: isMobile ? 'auto' : '33.333%'
                }}>
                  <button 
                    type="button" 
                    aria-label="Menu"
                    className="lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium text-primary hover:bg-button-ghost-hover h-10 w-10 rounded-full"
                  >
                    <MenuIcon className="size-5" />
                  </button>
                  <div className="hidden lg:flex lg:items-center" style={{
                    paddingLeft: windowWidth > 1600 ? '2rem' : '1rem'
                  }}>
                    <a href="/" className="text-primary font-medium">
                      Parrot
                    </a>
                  </div>
                </div>

                {/* Center - Logo for mobile only */}
                <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
                  <a href="/" className="text-primary font-medium">
                    Parrot
                  </a>
                </div>

                {/* Right side - Search and User buttons */}
                <div className="flex items-center gap-3 flex-none ml-auto" style={{
                  paddingRight: windowWidth > 1600 ? '2rem' : '1rem'
                }}>
                  {/* Search button - shown on both mobile and desktop */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium text-primary hover:bg-button-ghost-hover h-10 w-10 rounded-full"
                    aria-label="Search"
                  >
                    <Search className="size-5" />
                  </button>

                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/sign-in"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9"
                        }
                      }}
                    />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium text-background hover:bg-button-primary-hover bg-button-primary rounded-full py-2 h-8 px-3 text-sm">
                        Sign up
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col items-center justify-between w-full h-full gap-6 p-2 pt-20 mx-auto @sm:justify-center @sm:p-4 @sm:gap-9 @lg:w-4/5">
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

            {/* Input area with proper desktop positioning and gradient */}
            <div className={`flex flex-col items-center w-full gap-1 @sm:gap-4 fixed sm:absolute bottom-0 left-0 right-0 mx-auto inset-x-0 max-w-[50rem] z-50 ${messages.length > 0 || isStreaming ? 'bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-20' : ''} @[80rem]:translate-x-12`}>
              <div className="flex flex-col-reverse items-center justify-between flex-1 w-full gap-0 @sm:gap-5 @sm:flex-col relative px-2 sm:px-2 py-2">
                <form onSubmit={handleFormSubmit} className="bottom-0 w-full text-base flex flex-col gap-2 items-center justify-center relative z-10 mt-2 @[80rem]:ml-[-2rem]">
                  <div className="flex flex-row justify-center w-full relative @lg:w-4/5 px-1.5 sm:px-0">
                    <input className="hidden" multiple type="file" name="files" />
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
                            height: '44px', // Default height
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
                            handleKeyDown(e);
                          }}
                        />
                      </div>

                      {/* INPUT ICONS */}
                      <div className="flex gap-1.5 absolute inset-x-0 bottom-0 border-t border-input-border sm:border-transparent p-2 @[480px]/input:p-3 max-w-full bg-background/80 backdrop-blur-sm rounded-b-3xl">
                        <button
                          type="button"
                          disabled={!input.trim() || isPending}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 h-9 rounded-full py-2 relative px-2 transition-all duration-150 bg-transparent border w-9 aspect-square border-toggle-border text-secondary hover:text-primary hover:bg-toggle-hover"
                          aria-label="button">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2]"><path d="M10 9V15C10 16.1046 10.8954 17 12 17V17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3V3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21V21C15.3137 21 18 18.3137 18 15V8" stroke="currentColor"></path></svg>                         
                        </button>
                        <div 
                          className="flex grow gap-1.5 max-w-full px-1 @sm:px-2"
                          style={{
                            transform: 'none',
                            opacity: 1
                          }}
                        >
                          <div className="grow flex gap-1.5 max-w-full">
                             <button
                              type="button"
                              className="hidden sm:inline-flex gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-primary h-9 rounded-full px-3.5 py-2 border border-toggle-border overflow-hidden items-center justify-center bg-transparent hover:bg-toggle-hover"
                              aria-pressed="false"
                              aria-label="Search"
                              tabIndex={0}
                             >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] text-secondary"><path d="M19.2987 8.84667C15.3929 1.86808 5.44409 5.76837 7.08971 11.9099C8.01826 15.3753 12.8142 14.8641 13.2764 12.8592C13.6241 11.3504 10.2964 12.3528 10.644 10.844C11.1063 8.839 15.9022 8.32774 16.8307 11.793C18.5527 18.2196 7.86594 22.4049 4.71987 15.2225" stroke-width="5" stroke-linecap="round" className="stroke-black/10 dark:stroke-white/20 transition-all duration-200 origin-center opacity-0 scale-0"></path><path d="M2 13.8236C4.5 22.6927 18 21.3284 18 14.0536C18 9.94886 11.9426 9.0936 10.7153 11.1725C9.79198 12.737 14.208 12.6146 13.2847 14.1791C12.0574 16.2581 6 15.4029 6 11.2982C6 3.68585 20.5 2.2251 22 11.0945" stroke="currentColor" className="transition-transform duration-200 eas-out origin-center rotate-0"></path></svg>
                                <span>Search</span>
                             </button>
                             <button
                              type="button"
                              className="hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-primary hover:bg-button-secondary-hover h-9 rounded-full px-3.5 py-2 transition-colors duration-100 relative overflow-hidden border border-input-button-border group-focus-within:bg-input-background-hover group-hover:bg-input-background-hover group-hover:hover:border-input-button-border-hover group-hover:hover:bg-input-button-background-hover bg-input-button-background"
                              tabIndex={0}
                              aria-pressed="false"
                              aria-label="Think"
                             >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] text-secondary"><path d="M19 9C19 12.866 15.866 17 12 17C8.13398 17 4.99997 12.866 4.99997 9C4.99997 5.13401 8.13398 3 12 3C15.866 3 19 5.13401 19 9Z" className="fill-yellow-100 dark:fill-yellow-400/40 origin-center transition-all duration-100 scale-0 opacity-0"></path><path d="M15 16.1378L14.487 15.2794L14 15.5705V16.1378H15ZM8.99997 16.1378H9.99997V15.5705L9.51293 15.2794L8.99997 16.1378ZM18 9C18 11.4496 16.5421 14.0513 14.487 15.2794L15.5129 16.9963C18.1877 15.3979 20 12.1352 20 9H18ZM12 4C13.7598 4 15.2728 4.48657 16.3238 5.33011C17.3509 6.15455 18 7.36618 18 9H20C20 6.76783 19.082 4.97946 17.5757 3.77039C16.0931 2.58044 14.1061 2 12 2V4ZM5.99997 9C5.99997 7.36618 6.64903 6.15455 7.67617 5.33011C8.72714 4.48657 10.2401 4 12 4V2C9.89382 2 7.90681 2.58044 6.42427 3.77039C4.91791 4.97946 3.99997 6.76783 3.99997 9H5.99997ZM9.51293 15.2794C7.4578 14.0513 5.99997 11.4496 5.99997 9H3.99997C3.99997 12.1352 5.81225 15.3979 8.48701 16.9963L9.51293 15.2794ZM9.99997 19.5001V16.1378H7.99997V19.5001H9.99997ZM10.5 20.0001C10.2238 20.0001 9.99997 19.7763 9.99997 19.5001H7.99997C7.99997 20.8808 9.11926 22.0001 10.5 22.0001V20.0001ZM13.5 20.0001H10.5V22.0001H13.5V20.0001ZM14 19.5001C14 19.7763 13.7761 20.0001 13.5 20.0001V22.0001C14.8807 22.0001 16 20.8808 16 19.5001H14ZM14 16.1378V19.5001H16V16.1378H14Z" fill="currentColor"></path><path d="M9 16.0001H15" stroke="currentColor"></path><path d="M12 16V12" stroke="currentColor" stroke-linecap="square"></path></svg>
                              <span>Think</span>
                             </button>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <button 
                              type="button"
                              aria-haspopup="menu"
                              aria-expanded="false"
                              className="hidden sm:inline-flex items-center justify-center h-9 gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-primary hover:bg-button-ghost-hover rounded-full px-3.5 py-2 flex-row pl-3 pr-2.5 sm:px-3 border border-button-outline-border/50 hover:border-button-outline-border transition-colors duration-200"
                            >
                              <span className="inline-block text-primary text-xs @[400px]/input:text-sm">Parrot</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] size-3 sm:size-4 text-secondary transition-transform false"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-linecap="square"></path></svg>
                            </button>
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
                  </div>
                </form>

                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-secondary hover:text-primary hover:bg-button-ghost-hover disabled:hover:text-secondary disabled:hover:bg-inherit h-9 rounded-full px-3.5 py-2 opacity-25 hidden sm:inline-flex" type="button">
                  Switch to Personas
                </button>
              </div>

              {/* Terms text with refined positioning */}
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

function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className="text-neutral-500 dark:text-neutral-500 hover:underline font-medium"
    />
  );
}