/**
 * pages/api/ai-advisor.js
 * Groq API — Free, fast, works in India
 * Model: llama-3.1-8b-instant
 */

// Strip all markdown formatting — returns clean plain text
function stripMarkdown(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')   // ***bold italic***
    .replace(/\*\*(.+?)\*\*/g, '$1')        // **bold**
    .replace(/\*(.+?)\*/g, '$1')            // *italic*
    .replace(/\_\_(.+?)\_\_/g, '$1')        // __bold__
    .replace(/\_(.+?)\_/g, '$1')            // _italic_
    .replace(/\#\#\#\s/g, '')               // ### heading
    .replace(/\#\#\s/g, '')                 // ## heading
    .replace(/\#\s/g, '')                   // # heading
    .replace(/^\s*[-*+]\s+/gm, '• ')        // bullet points → •
    .replace(/^\s*\d+\.\s+/gm, '')          // numbered lists
    .replace(/`{3}[\s\S]*?`{3}/g, '')       // code blocks
    .replace(/`(.+?)`/g, '$1')              // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')     // links → just text
    .replace(/\n{3,}/g, '\n\n')             // multiple blank lines → max 2
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key missing',
      content: 'Groq API key not found. Please add GROQ_API_KEY to .env.local and restart.',
    });
  }

  try {
    const groqMessages = [];

    // Stronger system prompt — explicitly tells model to avoid markdown
    const cleanSystem = (system || '') + `

IMPORTANT FORMATTING RULES:
- Never use markdown formatting like **bold**, *italic*, ## headings, or bullet points with *
- Write in plain conversational sentences only
- Use bullet points with • symbol only if listing items
- Keep response to 3-4 sentences maximum
- Be warm, professional and concise`;

    groqMessages.push({ role: 'system', content: cleanSystem });

    (messages || []).forEach(m => {
      groqMessages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      });
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: 'Groq API error',
        content: `Error: ${data?.error?.message || 'Unknown error. Please try again.'}`,
      });
    }

    const raw = data?.choices?.[0]?.message?.content || 'Could not generate a response. Please try again.';

    // Clean markdown from response before sending to client
    const content = stripMarkdown(raw);

    return res.status(200).json({ content });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      content: `Connection error: ${error.message}`,
    });
  }
}