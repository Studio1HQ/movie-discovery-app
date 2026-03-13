"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaChevronDown, FaChevronUp, FaSpinner } from "react-icons/fa";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_HOST ?? "localhost:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ collection: string; object_id: string }>;
}

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://${BACKEND}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.answer ?? "",
          sources: data.sources ?? [],
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chat request failed");
      setMessages(newMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setExpandedSources({});
  };

  const toggleSources = (idx: number) => {
    setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-4 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
          AI Chat
        </h2>
        {messages.length > 0 && (
          <Button
            size="sm"
            onClick={handleClear}
            className="bg-white/10 hover:bg-white/20 text-white/70 border border-white/20 gap-1.5 text-xs"
          >
            <FaTrash size={10} /> Clear chat
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 text-white/30 gap-3 py-16"
          >
            <FaRobot size={40} />
            <p className="text-sm">Ask anything about movies...</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  msg.role === "user"
                    ? "bg-purple-600/50 text-white"
                    : "bg-indigo-600/50 text-white"
                }`}
              >
                {msg.role === "user" ? <FaUser size={12} /> : <FaRobot size={12} />}
              </div>

              {/* Bubble */}
              <div
                className={`flex flex-col gap-1 max-w-[80%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600/40 border border-purple-400/30 text-white"
                      : "bg-white/10 border border-white/20 text-white/90 backdrop-blur-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&>p]:mb-1 [&>ul]:mb-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Sources */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="w-full">
                    <button
                      onClick={() => toggleSources(idx)}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      {expandedSources[idx] ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
                      {msg.sources.length} source{msg.sources.length !== 1 ? "s" : ""}
                    </button>
                    <AnimatePresence>
                      {expandedSources[idx] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 250, damping: 28 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 flex flex-col gap-1">
                            {msg.sources.map((src, si) => (
                              <div
                                key={si}
                                className="text-xs text-white/40 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10"
                              >
                                <span className="text-white/60">{src.collection}</span>
                                <span className="text-white/30 mx-1">/</span>
                                <span className="font-mono text-xs">{src.object_id.slice(0, 8)}...</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600/50 text-white">
              <FaRobot size={12} />
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-white/50 text-sm backdrop-blur-md">
              <FaSpinner className="animate-spin" size={12} />
              Thinking...
            </div>
          </motion.div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center py-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about movies..."
          disabled={loading}
          className="flex-1 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50 focus-visible:border-purple-400/50"
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-purple-600/60 hover:bg-purple-600/80 text-white border border-purple-400/30 gap-2 backdrop-blur-md"
        >
          {loading ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <FaPaperPlane size={14} />
          )}
          Send
        </Button>
      </motion.div>
    </div>
  );
}
