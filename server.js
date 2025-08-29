// server.js - Backend for AI suggestions (Node + Express)
// server.js (CommonJS version)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Suggest roles endpoint
app.post('/api/suggest', async (req, res) => {
  try {
    const profile = req.body || {};

    // Compose a concise prompt for the model and request structured JSON back
    const system = `You are a career coach AI. Return EXACT JSON with an array 'roles' of 4 objects.
Each object: { "role": string, "fit": number (0-100), "whyGood": string, "gaps": string, "nextSteps": string }.
Be brief and specific for 'gaps' and 'nextSteps'.`;

    const user = {
      type: 'text',
      text: `Resume Type: ${profile.resumeType}
Name: ${profile.fullName}
Location: ${profile.location}
Summary: ${profile.summary}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : ''}
Experience: ${(profile.experiences || []).map(e => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate}): ${e.description}`).join(' | ')}
Education: ${(profile.educations || []).map(e => `${e.degree} - ${e.institution} (${e.graduationYear}) GPA:${e.gpa}`).join(' | ')}
Certifications: ${(profile.certifications || []).join(', ')}

Return only JSON.`
    };

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Using Chat Completions API (Node SDK)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user.text }
      ],
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = {}; }

    if (!parsed.roles || !Array.isArray(parsed.roles)) {
      return res.status(502).json({ error: 'Malformed AI response', raw: text });
    }
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static client files if you want to host both together
// app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
