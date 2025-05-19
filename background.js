let startTime = Date.now();
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ startTime, totalData: 0, siteData: {}, isPaused: false });
});
function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = nextMidnight - now;
  setTimeout(() => {
    chrome.storage.local.set({ totalData: 0, siteData: {} });
    scheduleMidnightReset();
  }, msUntilMidnight);
}
scheduleMidnightReset();
chrome.webRequest.onCompleted.addListener(
  (details) => {
    chrome.storage.local.get(["isPaused", "siteData", "totalData"], (data) => {
      if (data.isPaused) return;
      const contentLengthHeader = details.responseHeaders?.find(
        (header) => header.name.toLowerCase() === 'content-length'
      );
      if (contentLengthHeader && !isNaN(contentLengthHeader.value)) {
        const bytes = parseInt(contentLengthHeader.value, 10);
        const url = new URL(details.url);
        const domain = url.hostname;
        const newTotal = (data.totalData || 0) + bytes;
        const siteData = data.siteData || {};
        siteData[domain] = (siteData[domain] || 0) + bytes;
        chrome.storage.local.set({ totalData: newTotal, siteData });
      }
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);