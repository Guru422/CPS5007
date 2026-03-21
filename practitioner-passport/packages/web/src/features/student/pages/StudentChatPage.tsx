import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useChatSocket } from "../../../hooks/useSocket";
import {
  ChatConversation,
  ChatMessage,
  TeacherInfo,
  createConversation,
  deleteConversation,
  listConversationMessages,
  listConversations,
  listTeachers,
  sendChatMessage,
} from "../studentApi";

export default function StudentChatPage() {
  const { user } = useAuth();
  const userId = user.id ?? "";

  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useChatSocket(activeId, (raw) => {
    const msg = raw as ChatMessage;
    if (msg.senderId !== userId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [t, c] = await Promise.all([listTeachers(), listConversations(userId, "student")]);
      setTeachers(t);
      setConversations(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const loadMessages = useCallback(async (convId: number) => {
    if (!userId) return;
    try {
      setMessages(await listConversationMessages(userId, convId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    }
  }, [userId]);

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  async function handleNewChat(teacher: TeacherInfo) {
    if (!userId) return;
    setError("");
    try {
      const conv = await createConversation({
        studentId: userId,
        teacherId: teacher.id,
        title: `Chat with ${teacher.fullName}`,
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setShowNewChat(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation.");
    }
  }

  async function handleDelete(id: number) {
    if (!userId) return;
    try {
      await deleteConversation(userId, id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !activeId) return;
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setError("");
    try {
      const sent = await sendChatMessage({ senderId: userId, conversationId: activeId, message: msg });
      setMessages((prev) => [...prev, sent]);
      setInput("");
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 140px)", minHeight: 400 }}>
      {/* Sidebar */}
      <div style={{ width: 280, minWidth: 280, display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="btn primary" onClick={() => setShowNewChat(true)} style={{ width: "100%" }}>
          + New chat
        </button>

        <div style={{ flex: 1, overflow: "auto", border: "1px solid var(--border)", borderRadius: 10, padding: 8 }}>
          {conversations.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, textAlign: "center", marginTop: 16 }}>
              No conversations yet. Start one with a teacher.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => { setActiveId(conv.id); setShowNewChat(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: conv.id === activeId ? "#e9f5ff" : "transparent",
                  marginBottom: 4,
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: conv.id === activeId ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {conv.participantName || "Teacher"}
                  </div>
                  <div style={{ fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.title}
                  </div>
                </div>
                <button
                  className="btn"
                  style={{ padding: "2px 6px", fontSize: 12, minWidth: 0 }}
                  onClick={(e) => { e.stopPropagation(); void handleDelete(conv.id); }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {error && <p style={{ color: "#b42318", margin: "0 0 8px", fontSize: 13 }}>{error}</p>}

        {showNewChat ? (
          <div className="card" style={{ flex: 1, padding: 20 }}>
            <h2 style={{ margin: "0 0 16px" }}>Start a conversation</h2>
            <p className="muted" style={{ marginBottom: 16 }}>Select a teacher to chat with:</p>
            {teachers.length === 0 ? (
              <p className="muted">No teachers available yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    className="btn"
                    onClick={() => void handleNewChat(t)}
                    style={{ textAlign: "left", padding: "10px 14px" }}
                  >
                    <strong>{t.fullName}</strong>
                    <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>{t.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : !activeId ? (
          <div className="card" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <p className="muted" style={{ fontSize: 15 }}>Select a conversation or start a new chat.</p>
            <button className="btn primary" onClick={() => setShowNewChat(true)}>+ New chat</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0 }}>{activeConv?.participantName || "Chat"}</h2>
              <span className="muted" style={{ fontSize: 13 }}>{activeConv?.title}</span>
            </div>

            <div className="card" style={{ flex: 1, overflow: "auto", marginBottom: 12, padding: 14 }}>
              {messages.length === 0 ? (
                <p className="muted">No messages yet. Say hello!</p>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === userId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        marginBottom: 12,
                        padding: 10,
                        borderRadius: 10,
                        background: isMe ? "#e9f5ff" : "#f7fafc",
                        maxWidth: "85%",
                        marginLeft: isMe ? "auto" : 0,
                        marginRight: isMe ? 0 : "auto",
                      }}
                    >
                      <strong style={{ fontSize: 12, color: "#666" }}>
                        {isMe ? "You" : m.senderName || "Teacher"}
                      </strong>
                      <div style={{ marginTop: 4, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{m.message}</div>
                      <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={onSend} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                className="input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void onSend(e); } }}
                placeholder="Type a message..."
                style={{ flex: 1, resize: "none" }}
              />
              <button className="btn primary" type="submit" disabled={sending || !input.trim()} style={{ height: 52 }}>
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
