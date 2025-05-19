
const ecoTips = [
  "Use dark mode to reduce screen power consumption.",
  "Close unused tabs to save memory and energy.",
  "Lower screen brightness to save battery.",
  "Avoid auto-play videos to reduce data usage.",
  "Bookmark your frequently visited pages."
];
let lastTip = "";
let lastTipTime = 0;

function formatDate(ms) {
  const date = new Date(ms);
  return date.toLocaleString();
}
function sendNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message
  });
}
function updateDisplay() {
  chrome.storage.local.get(["startTime", "totalData", "siteData", "isPaused"], (data) => {
    const startTime = data.startTime || Date.now();
    const totalBytes = data.totalData || 0;
    const siteData = data.siteData || {};
    const dataInGB = totalBytes / (1024 ** 3);
    const energyPerGB = 5;
    const co2PerKWh = 475;
    const totalCO2 = dataInGB * energyPerGB * co2PerKWh;
    const carbon = totalCO2.toFixed(3);
    const goal = 500;
    const percentage = Math.min((totalCO2 / goal) * 100, 100).toFixed(1);
    document.getElementById("startTime").textContent = formatDate(startTime);
    document.getElementById("carbon").textContent = `${carbon} grams`;
    document.getElementById("goalProgress").textContent = `${percentage}%`;
    document.getElementById("goalBar").style.width = `${percentage}%`;
    const topSite = Object.entries(siteData)
      .sort((a, b) => b[1] - a[1])
      .map(([site, val]) => `${site} (${(val / (1024**2)).toFixed(1)} MB)`)[0] || "N/A";
    document.getElementById("topSite").textContent = topSite;
    const now = Date.now();
    if (now - lastTipTime > 5000 || !lastTip) {
      lastTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
      lastTipTime = now;
    }
    document.getElementById("ecoTip").textContent = lastTip;
    const carbonInt = Math.floor(totalCO2);
    if (carbonInt >= 100 && carbonInt % 100 === 0 && lastNotified !== carbonInt) {
      
      lastNotified = carbonInt;
    }
    document.getElementById("toggleTrack").textContent = data.isPaused ? "Resume" : "Pause";
  });
}
document.getElementById("toggleTrack").addEventListener("click", () => {
  chrome.storage.local.get("isPaused", (data) => {
    const newState = !data.isPaused;
    chrome.storage.local.set({ isPaused: newState });
    document.getElementById("toggleTrack").textContent = newState ? "Resume" : "Pause";
  });
});
updateDisplay();
setInterval(updateDisplay, 1000);
