chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("sidePanel setPanelBehavior failed", error));

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
    title: "리플라이로 메시지 만들기",
    contexts: ["selection"],
  });
});

/** @type {Record<string, string>} */
const modeMap = {
  "reply-generate": "generate",
  "reply-review": "review",
  "reply-refine": "refine",
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText;
  if (!text || !tab?.id) return;

  const mode = modeMap[info.menuItemId];
  if (!mode) return;

  chrome.storage.local.set({ pendingText: text.trim(), pendingMode: mode }, () => {
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => {
      // 사이드패널 열기 실패 시 새 탭 fallback
      chrome.tabs.create({
        url: `https://www.aireply.co.kr/app?shared=${encodeURIComponent(text.trim())}&mode=${mode}`,
      });
    });
  });
});
