chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    processText(request.text).then(sendResponse);
    return true;
  }
});

async function processText(text) {
  const data = await chrome.storage.local.get("geminiApiKey");
  const apiKey = data.geminiApiKey;

  if (!apiKey) return { error: "No API Key" };

  const MODEL_ID = "gemini-2.5-flash-lite";
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

  // SIMPLIFIED PROMPT: Just detect negativity
  const prompt = `
    Analyze this text: "${text}".
    
    Determine if it is toxic, angry, hate speech, or overly negative.
    
    Return JSON:
    {
      "isNegative": boolean
    }
  `;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0].content) {
      return { isNegative: false };
    }

    return JSON.parse(result.candidates[0].content.parts[0].text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return { isNegative: false };
  }
}
