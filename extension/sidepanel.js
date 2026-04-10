const REPLY_APP_URL = "https://www.aireply.co.kr/app";
const LOAD_TIMEOUT_MS = 8000;

const iframe = document.getElementById("replyFrame");
const loading = document.getElementById("loading");
const fallback = document.getElementById("fallback");
const openTabBtn = document.getElementById("openTabBtn");

let loaded = false;

function showFallback() {
  if (loaded) return;
  loading.classList.add("hidden");
  iframe.classList.add("hidden");
  fallback.classList.remove("hidden");
}

function showIframe() {
  loaded = true;
  loading.classList.add("hidden");
  fallback.classList.add("hidden");
  iframe.classList.remove("hidden");
}

iframe.addEventListener("load", () => {
  showIframe();
});

iframe.addEventListener("error", () => {
  showFallback();
});

setTimeout(() => {
  if (!loaded) showFallback();
}, LOAD_TIMEOUT_MS);

openTabBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: REPLY_APP_URL });
});
