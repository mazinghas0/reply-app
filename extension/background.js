const REPLY_APP_URL = "https://aireply.co.kr/app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "reply-generate",
    title: "리플라이로 답장 만들기",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "reply-review",
    title: "리플라이로 답장 검토하기",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "reply-refine",
    title: "리플라이로 다듬기",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const text = info.selectionText;
  if (!text) return;

  const encoded = encodeURIComponent(text.trim());

  /** @type {Record<string, string>} */
  const modeMap = {
    "reply-generate": "generate",
    "reply-review": "review",
    "reply-refine": "refine",
  };

  const mode = modeMap[info.menuItemId];
  if (!mode) return;

  const url = `${REPLY_APP_URL}?shared=${encoded}&mode=${mode}`;
  chrome.tabs.create({ url });
});
