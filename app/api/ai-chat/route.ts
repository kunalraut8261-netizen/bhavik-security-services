// app/api/ai-chat/route.ts
// Secure server-side route — Gemini API key is NEVER exposed to the browser.

// ── System Prompt (as specified by Bhavik Security Services) ─────────────────
const SYSTEM_PROMPT = `You are the official AI support assistant for Bhavik Security Services.
Help visitors with security guard services, industrial security, residential security, corporate security, event security, service areas across Maharashtra, contact support, and inquiry guidance.
Keep replies short, professional, polite, and business-focused.
Do not answer unrelated questions — politely redirect the visitor to Bhavik Security Services support.
If pricing is requested, collect: full name, mobile number, location, and required service type — then tell the user that the admin team will contact them within 24 hours.
Available services: Industrial Security, Security Guards, Gunman, Bouncers, Event Security, Corporate Security, Residential Security.
Service areas: All of Maharashtra, India.
Contact: Phone +91 7744086999, Email bhavikscrtsrvc@gmail.com.
Never invent phone numbers, prices, or company details that are not listed above.`;

// ── Server-side in-memory rate limiter ────────────────────────────────────────
// Resets per chatId, per minute. Prevents AI spam even if client-side limits are bypassed.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(chatId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(chatId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(chatId, { count: 1, resetAt: now + 60_000 });
    return true; // allowed
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false; // rate-limited
  }
  entry.count += 1;
  return true; // allowed
}

// ── Fallback replies when Gemini is unavailable ───────────────────────────────
const FALLBACK_REPLIES = [
  "Thank you for reaching out to Bhavik Security Services! Our team will get back to you shortly. For urgent assistance, please call +91 7744086999.",
  "We've received your message! A Bhavik Security Services representative will respond soon. You can also reach us directly at +91 7744086999.",
  "Hello! We're here to help with all your security needs. For immediate assistance, please call +91 7744086999 or our team will respond here shortly.",
];

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, userMessage, chatHistory } = body as {
      chatId: string;
      userMessage: string;
      chatHistory?: Array<{ role: 'user' | 'model'; text: string }>;
    };

    // ── Input validation ──────────────────────────────────────────────────────
    if (!chatId || typeof chatId !== 'string' || chatId.length > 100) {
      return Response.json({ error: 'Invalid chatId' }, { status: 400 });
    }
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      return Response.json({ error: 'Invalid message' }, { status: 400 });
    }
    if (userMessage.length > 500) {
      return Response.json({ error: 'Message too long' }, { status: 400 });
    }

    // ── Server-side rate limit ────────────────────────────────────────────────
    if (!checkRateLimit(chatId)) {
      return Response.json(
        { reply: "You've sent too many messages. Please wait a moment, or call us directly at +91 7744086999." },
        { status: 429 }
      );
    }

    // ── API key check ─────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[AI Chat] GEMINI_API_KEY is not configured in environment variables.');
      return Response.json({ reply: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)] });
    }

    // ── Build Gemini conversation contents ────────────────────────────────────
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Normalize chat history to strictly alternate roles (Gemini requires this)
    // If there are consecutive messages with the same role, merge them.
    if (chatHistory && Array.isArray(chatHistory)) {
      let lastRole = '';
      for (const msg of chatHistory) {
        if (!msg.role || !msg.text || typeof msg.text !== 'string') continue;
        
        if (msg.role === lastRole && contents.length > 0) {
          // Merge with previous
          contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
        } else {
          contents.push({ role: msg.role, parts: [{ text: msg.text }] });
          lastRole = msg.role;
        }
      }
    }

    // Add the current user message, merging if the last one was also a user
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n\n${userMessage}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    console.log(`[AI Chat] Sending request to Gemini... History items: ${contents.length}`);

    // ── Call Gemini API ───────────────────────────────────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 300,
          topP: 0.85,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',    threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',   threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(`[AI Chat] Gemini API error! Status: ${geminiResponse.status}. Error:`, errText);
      return Response.json({ reply: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)] });
    }

    const geminiData = await geminiResponse.json();
    const reply: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
    if (!reply) {
      console.error('[AI Chat] Gemini API returned empty or unexpected response format:', JSON.stringify(geminiData));
      return Response.json({ reply: FALLBACK_REPLIES[0] });
    }

    return Response.json({ reply });

  } catch (err) {
    console.error('[AI Chat] Unexpected error:', err);
    return Response.json({ reply: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)] });
  }
}
