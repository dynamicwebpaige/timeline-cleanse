// 1. Create the Tooltip Element
const tooltip = document.createElement("div");
tooltip.id = "gemini-tooltip-container";
document.body.appendChild(tooltip);

function showTooltip(event, text) {
  // Show the ORIGINAL text in the tooltip
  tooltip.innerText = text;
  
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  tooltip.style.top = `${rect.bottom + scrollTop + 8}px`; // Show below badge
  tooltip.style.left = `${rect.left}px`;
  
  tooltip.classList.add("gemini-tooltip-visible");
}

function hideTooltip() {
  tooltip.classList.remove("gemini-tooltip-visible");
}

// 2. Scanner Logic
const SELECTORS = {
  container: 'article[data-testid="tweet"]',
  textParams: 'div[data-testid="tweetText"]'
};

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1) {
        if (node.matches && node.matches(SELECTORS.container)) scanPost(node);
        const nested = node.querySelectorAll ? node.querySelectorAll(SELECTORS.container) : [];
        nested.forEach(scanPost);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

setTimeout(() => {
  document.querySelectorAll(SELECTORS.container).forEach(scanPost);
}, 1500);

function scanPost(postElement) {
  if (postElement.dataset.geminiScanned) return;
  postElement.dataset.geminiScanned = "true";

  const textElement = postElement.querySelector(SELECTORS.textParams);
  if (!textElement || textElement.innerText.trim().length < 10) return;

  const originalText = textElement.innerText;

  chrome.runtime.sendMessage(
    { action: "analyzeText", text: originalText },
    (response) => {
      if (!response || response.error) return;

      // Only hide if API says it is negative
      if (response.isNegative) {
        
        // Hide original text visually
        textElement.style.display = "none";

        // Create the Sparkle Badge
        const badge = document.createElement("div");
        badge.className = "gemini-blocked-badge";
        // Sparkle Emoji + Blue Bold Text
        badge.innerHTML = `<span>✨ Negativity Blocked</span>`;
        
        // Hover event: Show ORIGINAL text
        badge.addEventListener("mouseenter", (e) => showTooltip(e, originalText));
        badge.addEventListener("mouseleave", hideTooltip);
        
        textElement.parentNode.insertBefore(badge, textElement);
      }
    }
  );
}