const REPLY_APP_URL = "https://aireply.co.kr/app";
const MAX_LENGTH = 1200;

const textArea = document.getElementById("text");
const sendBtn = document.getElementById("send");
const charCount = document.getElementById("charCount");
const modeBtns = document.querySelectorAll(".mode-btn");
const openFullBtn = document.getElementById("openFull");

let selectedMode = "generate";

function updateCharCount() {
  const len = textArea.value.length;
  charCount.textContent = `${len} / ${MAX_LENGTH}`;
  charCount.classList.toggle("over", len > MAX_LENGTH);
  sendBtn.disabled = !textArea.value.trim() || len > MAX_LENGTH;
}

modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMode = btn.dataset.mode;
  });
});

textArea.addEventListener("input", updateCharCount);

sendBtn.addEventListener("click", () => {
  const text = textArea.value.trim();
  if (!text) return;

  const encoded = encodeURIComponent(text);
  const url = `${REPLY_APP_URL}?shared=${encoded}&mode=${selectedMode}`;
  chrome.tabs.create({ url });
});

openFullBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: REPLY_APP_URL });
});

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
    // 클립보드 접근 권한 없으면 무시
  }
}

document.addEventListener("DOMContentLoaded", () => {
  tryReadClipboard();
  textArea.focus();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    tryReadClipboard();
  }
});
