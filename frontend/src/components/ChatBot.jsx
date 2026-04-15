import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const API_URL = "http://localhost:8000/chat";
const SUGGESTIONS = ["What is tokenization?", "How do embeddings work?", "Explain attention"];

// ─── VIDEO MAP ────────────────────────────────────────────────────────────────
const VIDEO_MAP = {
  tokenization: { title: "Word Embedding and Word2Vec, Clearly Explained", channel: "StatQuest", youtubeId: "viZrOnJclY0" },
  embeddings:   { title: "Word Embedding and Word2Vec, Clearly Explained", channel: "StatQuest", youtubeId: "viZrOnJclY0" },
  attention:    { title: "Attention in Transformers, Step by Step",         channel: "3Blue1Brown", youtubeId: "eMlx5fFNoYc" },
  transformer:  { title: "But what is a GPT? Visual intro to Transformers", channel: "3Blue1Brown", youtubeId: "wjZofJX0v4M" },
  softmax:      { title: "Neural Networks Part 5: ArgMax and SoftMax",      channel: "StatQuest",   youtubeId: "KpKog-L9veg" },
  layers:       { title: "Transformer Neural Networks, Clearly Explained",  channel: "StatQuest",   youtubeId: "zxQyTK8quyY" },
  vectors:      { title: "Vectors — Chapter 1, Essence of Linear Algebra",  channel: "3Blue1Brown", youtubeId: "fNk_zzaMoSs" },
  matrix:       { title: "Matrix Multiplication as Composition",            channel: "3Blue1Brown", youtubeId: "XkY2DOUCWMU" },
  prediction:   { title: "But what is a GPT? Visual intro to Transformers", channel: "3Blue1Brown", youtubeId: "wjZofJX0v4M" },
  gpt:          { title: "But what is a GPT? Visual intro to Transformers", channel: "3Blue1Brown", youtubeId: "wjZofJX0v4M" },
  bert:         { title: "Transformer Neural Networks, Clearly Explained",  channel: "StatQuest",   youtubeId: "zxQyTK8quyY" },
  similarity:   { title: "Word Embedding and Word2Vec, Clearly Explained",  channel: "StatQuest",   youtubeId: "viZrOnJclY0" },
  cosine:       { title: "Word Embedding and Word2Vec, Clearly Explained",  channel: "StatQuest",   youtubeId: "viZrOnJclY0" },
  dot:          { title: "Dot Products and Duality",                        channel: "3Blue1Brown", youtubeId: "LyGKycYT2v0" },
  vector:       { title: "Vectors — Chapter 1, Essence of Linear Algebra",  channel: "3Blue1Brown", youtubeId: "fNk_zzaMoSs" },
};

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  accent:       "#7c3aed",
  accentLight:  "#a78bfa",
  accentBg:     "#7c3aed20",
  accentBorder: "#7c3aed50",
  chipBorder:   "#3d2a60",
  headerBg:     "#1e1a2e",
  headerBorder: "#2e2a40",
  glow:         "rgba(124,58,237,0.45)",
};

// ─── DETECT VIDEO FROM MESSAGE ────────────────────────────────────────────────
function detectVideo(text) {
  const lower = text.toLowerCase();
  for (const [keyword, video] of Object.entries(VIDEO_MAP)) {
    if (lower.includes(keyword)) {
      return { keyword, ...video };
    }
  }
  return null;
}

// ─── BOT AVATAR ───────────────────────────────────────────────────────────────
const BotAvatar = ({ size = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: C.accentBg, border: `0.5px solid ${C.accentBorder}`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={C.accentLight} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.accentLight} strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// ─── VIDEO MODAL ──────────────────────────────────────────────────────────────
function VideoModal({ video, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
        zIndex: 2000, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720,
          background: "#141414", borderRadius: 16,
          border: "0.5px solid #2a2a2a", overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "12px 18px", background: C.headerBg,
          borderBottom: `0.5px solid ${C.headerBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: C.accentBg, border: `0.5px solid ${C.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M8 6l10 6-10 6V6z" fill={C.accentLight} />
              </svg>
            </div>
            <div>
              <p style={{ color: "#e8e8e8", fontSize: 13, fontWeight: 500, margin: 0 }}>{video.title}</p>
              {video.channel && (
                <p style={{ color: "#666", fontSize: 11, margin: 0 }}>{video.channel}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#666",
            cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4
          }}>✕</button>
        </div>

        {/* YouTube Embed */}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", border: "none"
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 18px", background: "#0d0d0d" }}>
          <p style={{ color: "#444", fontSize: 11, margin: 0, fontFamily: "monospace" }}>
            Click outside or ✕ to close and return to chat
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── VIDEO BUTTON (inside chat bubble) ───────────────────────────────────────
function VideoButton({ video, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 8, display: "flex", alignItems: "center", gap: 10,
        background: "#1a1a2e", border: `0.5px solid ${C.accentBorder}`,
        borderRadius: 10, padding: "8px 12px", cursor: "pointer",
        width: "100%", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#221a3a"}
      onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
    >
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: C.accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M8 6l10 6-10 6V6z" fill="white" />
        </svg>
      </div>
      <div style={{ textAlign: "left", flex: 1 }}>
        <p style={{ color: C.accentLight, fontSize: 12, fontWeight: 500, margin: 0 }}>
          Watch a clip on this
        </p>
        <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{video.title}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── MAIN CHATBOT ─────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can help you understand how LLMs work. What would you like to explore?" }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Also listen for hint video events from App.jsx
  useEffect(() => {
    const handler = (e) => {
      const type = e.detail;
      const video = VIDEO_MAP[type];
      if (video) setActiveVideo(video);
    };
    window.addEventListener("open-hint-video", handler);
    return () => window.removeEventListener("open-hint-video", handler);
  }, []);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const detectedVideo = detectVideo(text);
    const cleanMessages = updated.map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: cleanMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply,
        video: detectedVideo,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please make sure the backend is running.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Video Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 1000,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12
      }}>
        {open ? (
          /* ── Chat Window ── */
          <div style={{
            width: 355, height: 490, background: "#141414",
            borderRadius: 16, border: "0.5px solid #2a2a2a",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>

            {/* Header */}
            <div style={{
              background: C.headerBg, borderBottom: `0.5px solid ${C.headerBorder}`,
              padding: "13px 16px", display: "flex", alignItems: "center", gap: 10
            }}>
              <BotAvatar size={34} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#e8e8e8", fontSize: 13, fontWeight: 500, margin: 0 }}>
                  Core AI Assistant
                </p>
                <p style={{ color: "#9f9e9e", fontSize: 11, margin: 0 }}>
                  Ask me anything about LLMs
                </p>
              </div>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: C.accent, boxShadow: `0 0 6px ${C.accent}`
              }} />
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none", border: "none", color: "#555",
                  cursor: "pointer", fontSize: 16, padding: 4, marginLeft: 4
                }}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: 14,
              display: "flex", flexDirection: "column", gap: 10, background: "#0d0d0d"
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "flex-end",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row"
                }}>
                  {msg.role === "assistant" && <BotAvatar />}
                  <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column" }}>
                    <div style={{
                      padding: "9px 13px", borderRadius: 14, fontSize: 13, lineHeight: 1.6,
                      background: msg.role === "user" ? "#7c3aed" : "#242424",
                      border: msg.role === "user" ? "none" : "0.5px solid #3a3a3a",
                      borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14,
                      borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                      fontWeight: msg.role === "user" ? 500 : 400,
                    }}>
                      <div className="chat-md" style={{ color: "#ffffff" }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Video button below assistant reply */}
                    {msg.role === "assistant" && msg.video && (
                      <VideoButton
                        video={msg.video}
                        onClick={() => setActiveVideo(msg.video)}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Suggestion chips */}
              {showSuggestions && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 32 }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        background: "transparent", border: `0.5px solid ${C.chipBorder}`,
                        borderRadius: 20, padding: "5px 11px", fontSize: 12,
                        color: C.accentLight, cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <BotAvatar />
                  <div style={{
                    background: "#1a1a1a", border: "0.5px solid #2a2a2a",
                    borderRadius: 14, borderBottomLeftRadius: 4,
                    padding: "10px 14px", display: "flex", gap: 4
                  }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: C.accentLight, opacity: 0.4,
                        animation: `blink 1.2s ${d}s infinite`
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
              borderTop: "0.5px solid #1f1f1f", background: "#141414"
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                placeholder="Ask about LLMs..."
                style={{
                  flex: 1, border: "0.5px solid #2a2a2a", borderRadius: 20,
                  padding: "8px 14px", fontSize: 13, background: "#0d0d0d",
                  color: "#ffffff", outline: "none",
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading}
                style={{
                  width: 34, height: 34, borderRadius: "50%", background: C.accent,
                  border: "none", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  opacity: loading ? 0.4 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

        ) : (
          /* ── Trigger Button ── */
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "#1a1a1a", border: "0.5px solid #2e2e2e",
              borderRadius: 20, padding: "8px 14px", fontSize: 13,
              color: "#888", whiteSpace: "nowrap"
            }}>
              Have a doubt? <strong style={{ color: C.accentLight, fontWeight: 500 }}>Ask here</strong>
            </div>
            <button
              onClick={() => setOpen(true)}
              style={{
                width: 52, height: 52, borderRadius: "50%", background: C.accent,
                border: "none", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 18px ${C.glow}`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="white" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <style>{`
          @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
          .chat-md p { color: #ffffff; margin: 0 0 6px 0; }
          .chat-md p:last-child { margin-bottom: 0; }
          .chat-md strong { color: #ffffff; font-weight: 600; }
          .chat-md em { color: #d4c5ff; }
          .chat-md ul, .chat-md ol { color: #ffffff; padding-left: 16px; margin: 4px 0; }
          .chat-md li { margin-bottom: 3px; }
          .chat-md code { background: #ffffff18; padding: 1px 5px; border-radius: 4px; font-size: 12px; color: #d4c5ff; }
          .chat-md pre { background: #ffffff10; padding: 8px; border-radius: 6px; overflow-x: auto; }
          .chat-md h1, .chat-md h2, .chat-md h3 { color: #ffffff; font-weight: 500; margin: 6px 0 4px; }
        `}</style>
      </div>
    </>
  );
}