document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const statusDiv = document.getElementById('status');
  const saveBtn = document.getElementById('saveBtn');

  // Load existing key if present
  chrome.storage.local.get("geminiApiKey", (data) => {
    if (data.geminiApiKey) {
      apiKeyInput.value = data.geminiApiKey;
      statusDiv.textContent = "Key loaded.";
    }
  });

  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    
    if (!key) {
      statusDiv.style.color = "red";
      statusDiv.textContent = "Please enter a key.";
      return;
    }

    chrome.storage.local.set({ 'geminiApiKey': key }, () => {
      statusDiv.style.color = "green";
      statusDiv.textContent = 'Key saved! Reload your tabs.';
      console.log("API Key saved to storage.");
    });
  });
});