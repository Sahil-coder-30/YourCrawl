"""
RAG Agent — Interactive Test GUI
Run:  python -m rag.test_gui          (from ML/)
      python rag/test_gui.py          (from ML/)
Opens a chat interface at http://localhost:7860
"""

import json
import sys
import os
import time
import logging
from pathlib import Path

# Ensure the ML directory is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn

from rag.engine import get_rag_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RAG Agent Test GUI")

# ── Chat history (in-memory for testing) ──────────────────────────────
chat_sessions: dict[str, list[dict]] = {}

HTML_PAGE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YourCrawl — RAG Agent Tester</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0a0f;--surface:#12121a;--surface2:#1a1a26;--border:#252535;
    --text:#e4e4ef;--text-muted:#8888a0;--accent:#7c5cfc;--accent2:#a78bfa;
    --accent-glow:rgba(124,92,252,.25);--success:#34d399;--error:#f87171;
    --glass:rgba(18,18,26,.75);--radius:14px;
  }
  html,body{height:100%;font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text)}
  body{display:flex;flex-direction:column;overflow:hidden}

  /* ── Header ────────────────────────── */
  .header{
    display:flex;align-items:center;gap:14px;padding:16px 24px;
    background:var(--surface);border-bottom:1px solid var(--border);
    backdrop-filter:blur(20px);z-index:10;flex-shrink:0;
  }
  .header .logo{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(135deg,var(--accent),#a78bfa);
    display:grid;place-items:center;font-weight:800;font-size:16px;color:#fff;
  }
  .header h1{font-size:18px;font-weight:700;letter-spacing:-.3px}
  .header .badge{
    font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;
    background:var(--accent-glow);color:var(--accent2);border:1px solid rgba(124,92,252,.3);
  }
  .header .status{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted)}
  .header .dot{width:8px;height:8px;border-radius:50%;background:var(--success);box-shadow:0 0 6px var(--success)}
  .header .dot.loading{background:#facc15;box-shadow:0 0 6px #facc15;animation:pulse 1s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

  /* ── Chat Area ─────────────────────── */
  .chat-area{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;scroll-behavior:smooth}
  .chat-area::-webkit-scrollbar{width:6px}
  .chat-area::-webkit-scrollbar-track{background:transparent}
  .chat-area::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

  /* ── Messages ──────────────────────── */
  .msg{display:flex;gap:12px;max-width:820px;animation:fadeUp .3s ease}
  .msg.user{align-self:flex-end;flex-direction:row-reverse}
  .msg.assistant{align-self:flex-start}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  .msg .avatar{
    width:34px;height:34px;border-radius:10px;flex-shrink:0;display:grid;place-items:center;
    font-size:14px;font-weight:700;
  }
  .msg.user .avatar{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff}
  .msg.assistant .avatar{background:linear-gradient(135deg,var(--accent),#a78bfa);color:#fff}

  .msg .bubble{
    padding:14px 18px;border-radius:var(--radius);font-size:14px;line-height:1.65;
    word-break:break-word;
  }
  .msg.user .bubble{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border-bottom-right-radius:4px}
  .msg.assistant .bubble{background:var(--surface2);border:1px solid var(--border);border-bottom-left-radius:4px}

  .msg .bubble h1,.msg .bubble h2,.msg .bubble h3{margin:12px 0 6px;font-weight:700}
  .msg .bubble h3{font-size:14px}
  .msg .bubble ul,.msg .bubble ol{padding-left:20px;margin:6px 0}
  .msg .bubble li{margin:3px 0}
  .msg .bubble code{background:rgba(124,92,252,.15);padding:2px 6px;border-radius:4px;font-size:13px}
  .msg .bubble strong{color:var(--accent2);font-weight:600}
  .msg .bubble a{color:var(--accent2);text-decoration:underline}

  /* ── Sources ────────────────────────── */
  .sources{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .sources .chip{
    font-size:11px;padding:4px 10px;border-radius:8px;
    background:rgba(124,92,252,.1);border:1px solid rgba(124,92,252,.2);color:var(--accent2);
  }

  /* ── Follow-ups ─────────────────────── */
  .follow-ups{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .follow-ups button{
    font-size:12px;padding:8px 14px;border-radius:10px;border:1px solid var(--border);
    background:var(--surface);color:var(--text);cursor:pointer;text-align:left;
    transition:all .2s;font-family:inherit;
  }
  .follow-ups button:hover{border-color:var(--accent);background:var(--accent-glow);color:var(--accent2)}

  /* ── Retrieval Scores ───────────────── */
  .scores{margin-top:10px;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--border)}
  .scores summary{font-size:12px;color:var(--text-muted);cursor:pointer;font-weight:600}
  .scores .bar-row{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:11px;color:var(--text-muted)}
  .scores .bar-track{flex:1;height:6px;background:var(--surface);border-radius:3px;overflow:hidden}
  .scores .bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .5s ease}

  /* ── Typing indicator ───────────────── */
  .typing{display:flex;gap:5px;padding:8px 0}
  .typing span{width:7px;height:7px;border-radius:50%;background:var(--text-muted);animation:bounce .6s infinite alternate}
  .typing span:nth-child(2){animation-delay:.15s}
  .typing span:nth-child(3){animation-delay:.3s}
  @keyframes bounce{to{opacity:.3;transform:translateY(-4px)}}

  /* ── Input Bar ──────────────────────── */
  .input-bar{
    padding:16px 24px;background:var(--surface);border-top:1px solid var(--border);
    display:flex;gap:12px;align-items:flex-end;flex-shrink:0;
  }
  .input-bar textarea{
    flex:1;resize:none;border:1px solid var(--border);background:var(--surface2);
    color:var(--text);padding:12px 16px;border-radius:12px;font-size:14px;
    font-family:inherit;outline:none;min-height:46px;max-height:140px;
    transition:border-color .2s;line-height:1.5;
  }
  .input-bar textarea:focus{border-color:var(--accent)}
  .input-bar textarea::placeholder{color:var(--text-muted)}
  .input-bar button{
    width:46px;height:46px;border-radius:12px;border:none;
    background:linear-gradient(135deg,var(--accent),#a78bfa);color:#fff;
    cursor:pointer;display:grid;place-items:center;transition:transform .15s,opacity .2s;
    flex-shrink:0;
  }
  .input-bar button:hover{transform:scale(1.05)}
  .input-bar button:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .input-bar button svg{width:20px;height:20px}

  /* ── Welcome ─────────────────────────── */
  .welcome{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    flex:1;gap:16px;text-align:center;padding:40px;
  }
  .welcome .icon{
    width:72px;height:72px;border-radius:20px;
    background:linear-gradient(135deg,var(--accent),#a78bfa);
    display:grid;place-items:center;font-size:32px;
    box-shadow:0 0 40px var(--accent-glow);
  }
  .welcome h2{font-size:22px;font-weight:700}
  .welcome p{color:var(--text-muted);font-size:14px;max-width:460px;line-height:1.6}
  .welcome .starters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}
  .welcome .starters button{
    font-size:13px;padding:10px 16px;border-radius:12px;border:1px solid var(--border);
    background:var(--surface2);color:var(--text);cursor:pointer;font-family:inherit;
    transition:all .2s;
  }
  .welcome .starters button:hover{border-color:var(--accent);background:var(--accent-glow);color:var(--accent2)}

  /* ── Init overlay ───────────────────── */
  .init-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:100;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
  }
  .init-overlay .spinner{
    width:48px;height:48px;border:3px solid var(--border);border-top-color:var(--accent);
    border-radius:50%;animation:spin .8s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}
  .init-overlay p{color:var(--text-muted);font-size:14px}
  .init-overlay.hidden{display:none}

  /* ── Responsive ─────────────────────── */
  @media(max-width:640px){
    .header{padding:12px 16px}
    .chat-area{padding:16px}
    .input-bar{padding:12px 16px}
    .msg{max-width:100%}
  }
</style>
</head>
<body>

<!-- Init overlay -->
<div class="init-overlay" id="initOverlay">
  <div class="spinner"></div>
  <p id="initMsg">Initializing RAG Engine — embedding knowledge base...</p>
</div>

<!-- Header -->
<div class="header">
  <div class="logo">Y</div>
  <div>
    <h1>YourCrawl RAG Agent</h1>
  </div>
  <span class="badge">Test Mode</span>
  <div class="status">
    <span class="dot" id="statusDot"></span>
    <span id="statusText">Ready</span>
  </div>
</div>

<!-- Chat area -->
<div class="chat-area" id="chatArea">
  <div class="welcome" id="welcome">
    <div class="icon">⚖️</div>
    <h2>Regulatory Compliance Q&A</h2>
    <p>Ask questions about DPDP Act, EU AI Act, Consumer Protection Act, and more. The agent retrieves relevant regulatory knowledge and generates grounded answers.</p>
    <div class="starters">
      <button onclick="askStarter(this)">What are the penalties under DPDP Act?</button>
      <button onclick="askStarter(this)">Explain dark pattern regulations in India</button>
      <button onclick="askStarter(this)">How does EU AI Act classify risk?</button>
      <button onclick="askStarter(this)">Consumer rights for misleading ads?</button>
    </div>
  </div>
</div>

<!-- Input -->
<div class="input-bar">
  <textarea id="userInput" rows="1" placeholder="Ask a compliance question..." onkeydown="handleKey(event)" oninput="autoResize(this)"></textarea>
  <button id="sendBtn" onclick="sendMessage()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  </button>
</div>

<script>
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const welcome = document.getElementById('welcome');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const initOverlay = document.getElementById('initOverlay');
const initMsg = document.getElementById('initMsg');

let chatHistory = [];
let isProcessing = false;

// ── Initialize engine on load ─────────────
async function initEngine() {
  try {
    const res = await fetch('/api/init', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'ok') {
      initOverlay.classList.add('hidden');
      initMsg.textContent = '';
    } else {
      initMsg.textContent = 'Error: ' + (data.error || 'Unknown');
    }
  } catch (e) {
    initMsg.textContent = 'Connection failed — is the server running?';
  }
}
initEngine();

// ── Simple markdown to HTML ───────────────
function md(text) {
  if (!text) return '';
  let h = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n/g, '<br>');
  // wrap consecutive <li> in <ul>
  h = h.replace(/((?:<li>.*?<\/li><br>?)+)/g, (m) => '<ul>' + m.replace(/<br>/g,'') + '</ul>');
  return h;
}

function askStarter(btn) { userInput.value = btn.textContent; sendMessage(); }

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function scrollBottom() {
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

function addMessage(role, content, extra) {
  if (welcome) welcome.style.display = 'none';

  const div = document.createElement('div');
  div.className = 'msg ' + role;

  let avatarLabel = role === 'user' ? 'U' : 'AI';
  let bubbleHTML = md(content);

  // sources
  if (extra?.sources?.length) {
    bubbleHTML += '<div class="sources">';
    extra.sources.forEach(s => {
      bubbleHTML += `<span class="chip">${s.document} — ${s.section}</span>`;
    });
    bubbleHTML += '</div>';
  }

  // retrieval scores
  if (extra?.retrieval_scores?.length) {
    bubbleHTML += '<details class="scores"><summary>Retrieval Scores</summary>';
    extra.retrieval_scores.forEach(s => {
      const pct = Math.round(s.score * 100);
      bubbleHTML += `<div class="bar-row"><span style="width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.source}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
    });
    bubbleHTML += '</details>';
  }

  // follow-ups
  if (extra?.follow_up_questions?.length) {
    bubbleHTML += '<div class="follow-ups">';
    extra.follow_up_questions.forEach(q => {
      bubbleHTML += `<button onclick="askStarter(this)">${q}</button>`;
    });
    bubbleHTML += '</div>';
  }

  div.innerHTML = `<div class="avatar">${avatarLabel}</div><div class="bubble">${bubbleHTML}</div>`;
  chatArea.appendChild(div);
  scrollBottom();
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg assistant';
  div.id = 'typing';
  div.innerHTML = '<div class="avatar">AI</div><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  chatArea.appendChild(div);
  scrollBottom();
}
function hideTyping() { document.getElementById('typing')?.remove(); }

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isProcessing) return;

  isProcessing = true;
  sendBtn.disabled = true;
  statusDot.classList.add('loading');
  statusText.textContent = 'Thinking...';

  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  userInput.value = '';
  autoResize(userInput);

  showTyping();

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, chat_history: chatHistory }),
    });
    const data = await res.json();
    hideTyping();

    const answer = data.answer || 'No response received.';
    addMessage('assistant', answer, {
      sources: data.sources,
      follow_up_questions: data.follow_up_questions,
      retrieval_scores: data.retrieval_scores,
    });
    chatHistory.push({ role: 'assistant', content: answer });
  } catch (e) {
    hideTyping();
    addMessage('assistant', '**Error:** Failed to reach the RAG engine. ' + e.message);
  }

  isProcessing = false;
  sendBtn.disabled = false;
  statusDot.classList.remove('loading');
  statusText.textContent = 'Ready';
  userInput.focus();
}
</script>
</body>
</html>"""


# ── Routes ────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index():
    return HTMLResponse(content=HTML_PAGE)


@app.post("/api/init")
async def init_engine():
    """Initialize the RAG engine (embed knowledge base)."""
    try:
        engine = get_rag_engine()
        engine.initialize()
        return {"status": "ok", "chunks": len(engine._store)}
    except Exception as e:
        logger.error(f"Init failed: {e}")
        return JSONResponse({"status": "error", "error": str(e)}, status_code=500)


@app.post("/api/query")
async def query_engine(request: Request):
    """Query the RAG engine."""
    body = await request.json()
    question = body.get("question", "")
    chat_history = body.get("chat_history", [])
    audit_context = body.get("audit_context")

    if not question:
        return JSONResponse({"error": "No question provided"}, status_code=400)

    engine = get_rag_engine()
    start = time.time()
    result = engine.query(
        question=question,
        audit_context=audit_context,
        chat_history=chat_history,
    )
    result["latency_ms"] = round((time.time() - start) * 1000)

    return result


# ── Entrypoint ────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀  RAG Agent Test GUI")
    print("   http://localhost:7860\n")
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")
