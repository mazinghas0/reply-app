const API_BASE = "https://www.aireply.co.kr";
const MAX_LENGTH = 1200;

const textArea     = document.getElementById("text");
const sendBtn      = document.getElementById("send");
const charCount    = document.getElementById("charCount");
const modeBtns     = document.querySelectorAll(".mode-btn");
const toneBtns     = document.querySelectorAll(".tone-btn");
const openFullBtn  = document.getElementById("openFull");
const authSection  = document.getElementById("authSection");
const mainSection  = document.getElementById("mainSection");
const loadingEl    = document.getElementById("loading");
const resultsEl    = document.getElementById("results");
const replyList    = document.getElementById("replyList");
const errorMsg     = document.getElementById("errorMsg");
const backBtn      = document.getElementById("backBtn");
const creditsBadge = document.getElementById("creditsBadge");
const loginBtn     = document.getElementById("loginBtn");
const toneRow      = document.getElementById("toneRow");
const modesRow     = document.querySelector(".modes");

let selectedMode = "generate";
let selectedTone = "polite";

// ── Auth ──────────────────────────────────────────

async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/api/credits`, { credentials: "include" });
    const data = await res.json();
    if (data.isAuthenticated) {
      showMain(data.credits);
    } else {
      showAuth();
    }
  } catch {
    showAuth();
  }
}

function showAuth() {
  authSection.style.display = "flex";
  mainSection.style.display = "none";
}

function showMain(credits) {
  authSection.style.display = "none";
  mainSection.style.display = "flex";
  if (credits !== null && credits !== undefined) {
    creditsBadge.textContent = `${credits} 크레딧`;
    creditsBadge.style.display = "inline";
  }
}

// ── Input ─────────────────────────────────────────

function updateCharCount() {
  const len = textArea.value.length;
  charCount.textContent = `${len} / ${MAX_LENGTH}`;
  charCount.classList.toggle("over", len > MAX_LENGTH);
  sendBtn.disabled = !textArea.value.trim() || len > MAX_LENGTH;
}

textArea.addEventListener("input", updateCharCount);

// ── Mode tabs ─────────────────────────────────────

modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMode = btn.dataset.mode;
    if (selectedMode === "refine") {
      toneRow.style.display = "none";
      textArea.placeholder = "하고 싶은 말을 입력하세요...";
      sendBtn.textContent = "메시지 만들기";
    } else if (selectedMode === "review") {
      toneRow.style.display = "none";
      textArea.placeholder = "검토할 답장을 붙여넣으세요...";
      sendBtn.textContent = "답장 검토하기";
    } else {
      toneRow.style.display = "flex";
      textArea.placeholder = "답장할 메시지를 붙여넣으세요...";
      sendBtn.textContent = "답장 만들기";
    }
    updateCharCount();
  });
});

// ── Tone buttons ──────────────────────────────────

toneBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    toneBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTone = btn.dataset.tone;
  });
});

// ── Generate ──────────────────────────────────────

sendBtn.addEventListener("click", handleSend);

async function handleSend() {
  const text = textArea.value.trim();
  if (!text) return;

  if (selectedMode === "review" || selectedMode === "refine") {
    const encoded = encodeURIComponent(text);
    chrome.tabs.create({ url: `${API_BASE}/app?shared=${encoded}&mode=${selectedMode}` });
    return;
  }

  showLoading();

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, tone: selectedTone, speed: "fast" }),
    });

    if (res.status === 401) {
      showAuth();
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "오류가 발생했습니다.");
      return;
    }

    if (data.remaining !== undefined) {
      creditsBadge.textContent = `${data.remaining} 크레딧`;
    }

    showResults(data.replies);
  } catch {
    showError("네트워크 오류가 발생했습니다.");
  }
}

// ── UI states ─────────────────────────────────────

function showLoading() {
  textArea.style.display = "none";
  charCount.style.display = "none";
  modesRow.style.display = "none";
  toneRow.style.display = "none";
  sendBtn.style.display = "none";
  loadingEl.style.display = "flex";
  resultsEl.style.display = "none";
  errorMsg.style.display = "none";
}

function showResults(replies) {
  loadingEl.style.display = "none";
  resultsEl.style.display = "flex";

  replyList.innerHTML = "";
  replies.forEach((reply) => {
    const card = document.createElement("div");
    card.className = "reply-card";

    const label = document.createElement("p");
    label.className = "reply-label";
    label.textContent = reply.label;

    const content = document.createElement("p");
    content.className = "reply-content";
    content.textContent = reply.content;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "복사하기";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(reply.content).then(() => {
        copyBtn.textContent = "복사됨!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "복사하기";
          copyBtn.classList.remove("copied");
        }, 1500);
      });
    });

    card.appendChild(label);
    card.appendChild(content);
    card.appendChild(copyBtn);
    replyList.appendChild(card);
  });
}

function showError(msg) {
  loadingEl.style.display = "none";
  restoreInput();
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

function restoreInput() {
  textArea.style.display = "block";
  charCount.style.display = "block";
  modesRow.style.display = "flex";
  if (selectedMode === "generate") toneRow.style.display = "flex";
  sendBtn.style.display = "block";
  updateCharCount();
}

backBtn.addEventListener("click", () => {
  resultsEl.style.display = "none";
  errorMsg.style.display = "none";
  restoreInput();
});

// ── Footer buttons ────────────────────────────────

openFullBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/app` });
});

loginBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/sign-in` });
});

// ── Clipboard auto-paste ──────────────────────────

async function tryReadClipboard() {
  if (textArea.value.trim().length > 0) return;
  try {
    const clip = await navigator.clipboard.readText();
    if (clip && clip.trim().length >= 5 && clip.trim().length <= MAX_LENGTH) {
      textArea.value = clip.trim();
      updateCharCount();
      textArea.select();
    }
  } catch {
    // 클립보드 권한 없으면 무시
  }
}

// ── Pending text from context menu ───────────────

async function loadPendingText() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pendingText", "pendingMode"], (result) => {
      if (result.pendingText) {
        textArea.value = result.pendingText;
        if (result.pendingMode) {
          modeBtns.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.mode === result.pendingMode);
          });
          selectedMode = result.pendingMode;
        }
        chrome.storage.local.remove(["pendingText", "pendingMode"]);
        updateCharCount();
      }
      resolve();
    });
  });
}

// ── Init ──────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  await loadPendingText();
  if (!textArea.value.trim()) {
    await tryReadClipboard();
  }
  textArea.focus();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && mainSection.style.display !== "none") {
    tryReadClipboard();
  }
});
