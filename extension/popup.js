const REPLY_APP_URL = "https://reply-app-sepia.vercel.app/app";
const MAX_LENGTH = 500;

const textArea = document.getElementById("text");
const sendBtn = document.getElementById("send");
const charCount = document.getElementById("charCount");
const modeBtns = document.querySelectorAll(".mode-btn");

let selectedMode = "generate";

function updateCharCount() {
  const len = textArea.value.length;
  charCount.textContent = `${len} / ${MAX_LENGTH}`;
  charCount.classList.toggle("over", len > MAX_LENGTH);
  sendBtn.disabled = !textArea.value.trim() || len > MAX_LENGTH;
}

// 모드 버튼 토글
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMode = btn.dataset.mode;
  });
});

// 텍스트 입력 시 전송 버튼 활성화 + 글자수 표시
textArea.addEventListener("input", updateCharCount);

// 전송
sendBtn.addEventListener("click", () => {
  const text = textArea.value.trim();
  if (!text) return;

  const encoded = encodeURIComponent(text);
  const url = `${REPLY_APP_URL}?shared=${encoded}&mode=${selectedMode}`;
  chrome.tabs.create({ url });
  window.close();
});

// 팝업 열릴 때 클립보드 자동 감지
document.addEventListener("DOMContentLoaded", async () => {
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
  textArea.focus();
});
