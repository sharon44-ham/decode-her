"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Heart, Send, User } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  isUser1: boolean;
  otherUser: { id: string; username: string; avatarUrl: string | null };
  initialMessages: Message[];
}

export default function ChatClient({
  conversationId,
  currentUserId,
  isUser1,
  otherUser,
  initialMessages,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mark conversation as read and refresh router cache so the nav dot clears
  useEffect(() => {
    const supabase = createClient();
    const field = isUser1 ? "user1LastReadAt" : "user2LastReadAt";
    supabase
      .from("Conversation")
      .update({ [field]: new Date().toISOString() })
      .eq("id", conversationId)
      .then(() => router.refresh());
  }, [conversationId, isUser1, router]);

  // Auto-scroll whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for incoming messages
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Avoid duplicates if we already added it optimistically
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Optimistic insert
    const optimistic: Message = { id, senderId: currentUserId, content: text, createdAt: now };
    setMessages((prev) => [...prev, optimistic]);

    const supabase = createClient();
    const { error } = await supabase.from("Message").insert({
      id,
      conversationId,
      senderId: currentUserId,
      content: text,
    });

    if (error) {
      // Roll back optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setInput(text);
    }

    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => { router.refresh(); router.push("/messages"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-2.5 flex-1 group">
            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
              {otherUser.avatarUrl ? (
                <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {otherUser.username}
            </span>
          </Link>

          <div className="w-6 h-6 rounded-lg safe-space-gradient flex items-center justify-center shadow-soft flex-shrink-0">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              You&apos;re connected. Say something real.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-muted text-foreground border border-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 glow-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
