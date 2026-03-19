import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import {
  createConversation,
  deleteConversation,
  listConversationMessages,
  listConversations,
  sendStudentChatMessage,
  StudentChatConversation,
  StudentChatMessage,
} from "../studentApi";

export default function StudentChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<StudentChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<StudentChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user.id) return;
    try {
      const data = await listConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations.");
    }
  }, [user.id]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      if (!user.id) return;
      try {
        const data = await listConversationMessages(user.id, conversationId);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      }
    },
    [user.id],
  );

  useEffect(() => {
    if (activeConversationId) {
      void loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  async function handleNewConversation() {
    if (!user.id) return;
    setError("");
    try {
      const conv = await createConversation({ userId: user.id });
      setConversations((prev) => [conv, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation.");
    }
  }

  async function handleDeleteConversation(id: number) {
    if (!user.id) return;
    try {
      await deleteConversation(user.id, id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete conversation.");
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user.id || !activeConversationId) return;
    const message = input.trim();
    if (!message || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await sendStudentChatMessage({
        userId: user.id,
        conversationId: activeConversationId,
        message,
      });
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      setInput("");
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 140px)", minHeight: 400 }}>
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button className="btn primary" onClick={handleNewConversation} style={{ width: "100%" }}>
          + New chat
        </button>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 8,
          }}
        >
          {conversations.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, textAlign: "center", marginTop: 16 }}>
              No conversations yet.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: conv.id === activeConversationId ? "#e9f5ff" : "transparent",
                  marginBottom: 4,
                }}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 14,
                    fontWeight: conv.id === activeConversationId ? 600 : 400,
                  }}
                >
                  {conv.title}
                </span>
                <button
                  className="btn"
                  style={{ padding: "2px 6px", fontSize: 12, minWidth: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteConversation(conv.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <h2 style={{ margin: "0 0 8px" }}>AI Assistant</h2>

        {error && (
          <p className="muted" style={{ color: "#b42318", margin: "0 0 8px" }}>
            {error}
          </p>
        )}

        {!activeConversationId ? (
          <div
            className="card"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <p className="muted" style={{ fontSize: 15 }}>
              Select a conversation or start a new chat.
            </p>
            <button className="btn primary" onClick={handleNewConversation}>
              + New chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              className="card"
              style={{
                flex: 1,
                overflow: "auto",
                marginBottom: 12,
                padding: 14,
              }}
            >
              {messages.length === 0 ? (
                <p className="muted">
                  Start the conversation. Try: "What are my strongest skills?"
                </p>
              ) : (
                messages.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: 12,
                      padding: 10,
                      borderRadius: 10,
                      background: item.role === "assistant" ? "#f7fafc" : "#e9f5ff",
                      maxWidth: "85%",
                      marginLeft: item.role === "user" ? "auto" : 0,
                      marginRight: item.role === "assistant" ? "auto" : 0,
                    }}
                  >
                    <strong style={{ textTransform: "capitalize", fontSize: 12, color: "#666" }}>
                      {item.role === "user" ? "You" : "Assistant"}
                    </strong>
                    <div style={{ marginTop: 4, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {item.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={onSend}
              style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
            >
              <textarea
                className="input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void onSend(e);
                  }
                }}
                placeholder="Ask about your profile, skills, placements, CV..."
                style={{ flex: 1, resize: "none" }}
              />
              <button
                className="btn primary"
                type="submit"
                disabled={loading || !input.trim()}
                style={{ height: 52 }}
              >
                {loading ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
