import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  toggleChat,
  addUserMessage,
  sendRagQuery,
  clearMessages,
} from "../state/rag.slice";
import "./RagChat.scss";

// ── Suggested starter questions ──────────────────────────────────────
const STARTER_QUESTIONS = [
  "What are the key consent requirements under the DPDP Act?",
  "How does the EU AI Act classify prohibited AI practices?",
  "What constitutes an unfair trade practice under Indian law?",
  "What penalties apply for dark pattern violations?",
];

// ── Markdown-lite renderer ──────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;

  return text.split("\n").map((line, i) => {
    // Headers
    if (line.startsWith("### "))
      return (
        <h4 key={i} className="rag-md-h4">
          {line.slice(4)}
        </h4>
      );
    if (line.startsWith("## "))
      return (
        <h3 key={i} className="rag-md-h3">
          {line.slice(3)}
        </h3>
      );

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* "))
      return (
        <li key={i} className="rag-md-li">
          {renderInline(line.slice(2))}
        </li>
      );

    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch)
      return (
        <li key={i} className="rag-md-li rag-md-li--ordered">
          <span className="rag-md-num">{numMatch[1]}.</span>{" "}
          {renderInline(numMatch[2])}
        </li>
      );

    // Empty line
    if (!line.trim()) return <br key={i} />;

    // Paragraph
    return (
      <p key={i} className="rag-md-p">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ── Chat Panel Component ─────────────────────────────────────────────
export default function RagChat() {
  const dispatch = useDispatch();
  const { messages, isOpen, isLoading, activeReportId } = useSelector(
    (s) => s.rag
  );
  const currentReportId = useSelector((s) => s.audit.currentReportId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-sync the active report from the audit slice
  useEffect(() => {
    if (currentReportId && currentReportId !== activeReportId) {
      dispatch({ type: "rag/setActiveReport", payload: currentReportId });
    }
  }, [currentReportId, activeReportId, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    dispatch(addUserMessage(trimmed));
    setInput("");

    // Build chat history for context
    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    dispatch(
      sendRagQuery({
        question: trimmed,
        reportId: activeReportId,
        chatHistory,
      })
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFollowUp = (question) => {
    setInput(question);
    // Auto-send follow-up
    dispatch(addUserMessage(question));
    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    dispatch(
      sendRagQuery({
        question,
        reportId: activeReportId,
        chatHistory,
      })
    );
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        className={`rag-fab ${isOpen ? "rag-fab--hidden" : ""}`}
        onClick={() => dispatch(toggleChat())}
        aria-label="Open compliance assistant"
        id="rag-fab"
      >
        <div className="rag-fab__glow" />
        <Sparkles className="rag-fab__sparkle" size={14} />
        <MessageSquare size={22} />
      </button>

      {/* ── Chat Panel ── */}
      <div className={`rag-panel ${isOpen ? "rag-panel--open" : ""}`}>
        {/* Header */}
        <div className="rag-panel__header">
          <div className="rag-panel__header-left">
            <div className="rag-panel__avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="rag-panel__title">Compliance Assistant</h3>
              <p className="rag-panel__subtitle">
                DPDP · EU AI Act · Consumer Protection
              </p>
            </div>
          </div>
          <div className="rag-panel__header-actions">
            {messages.length > 0 && (
              <button
                className="rag-panel__icon-btn"
                onClick={() => dispatch(clearMessages())}
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              className="rag-panel__icon-btn"
              onClick={() => dispatch(toggleChat())}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Context Badge */}
        {activeReportId && (
          <div className="rag-panel__context">
            <BookOpen size={14} />
            <span>Answers grounded in your latest audit report</span>
          </div>
        )}

        {/* Messages */}
        <div className="rag-panel__messages">
          {messages.length === 0 ? (
            <div className="rag-panel__empty">
              <div className="rag-panel__empty-icon">
                <Sparkles size={32} />
              </div>
              <h4>Ask me about regulatory compliance</h4>
              <p>
                I can help you understand DPDP Act, EU AI Act, and Consumer
                Protection law as they relate to dark patterns and your website
                audit.
              </p>
              <div className="rag-panel__starters">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="rag-panel__starter"
                    onClick={() => handleFollowUp(q)}
                  >
                    <ChevronRight size={14} />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rag-msg ${
                    msg.role === "user" ? "rag-msg--user" : "rag-msg--assistant"
                  } ${msg.isError ? "rag-msg--error" : ""}`}
                >
                  <div className="rag-msg__avatar">
                    {msg.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div className="rag-msg__body">
                    <div className="rag-msg__content">
                      {msg.role === "user"
                        ? msg.content
                        : renderMarkdown(msg.content)}
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="rag-msg__sources">
                        <span className="rag-msg__sources-label">
                          <BookOpen size={12} /> Sources:
                        </span>
                        {msg.sources.map((s, j) => (
                          <span key={j} className="rag-msg__source-chip">
                            {s.document} — {s.section}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="rag-msg__followups">
                        {msg.followUps.map((q, j) => (
                          <button
                            key={j}
                            className="rag-msg__followup"
                            onClick={() => handleFollowUp(q)}
                          >
                            <ChevronRight size={12} />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="rag-msg rag-msg--assistant rag-msg--loading">
                  <div className="rag-msg__avatar">
                    <Bot size={16} />
                  </div>
                  <div className="rag-msg__body">
                    <div className="rag-msg__thinking">
                      <Loader2 size={16} className="rag-spinner" />
                      <span>Analyzing regulatory knowledge base...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="rag-panel__input">
          <textarea
            ref={inputRef}
            className="rag-panel__textarea"
            placeholder="Ask about DPDP, EU AI Act, compliance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={`rag-panel__send ${
              input.trim() && !isLoading ? "rag-panel__send--active" : ""
            }`}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
