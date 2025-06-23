import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

import cors from 'cors';
app.use(cors());

app.get('/', (_req, res) => {
  res.send('✅ API server alive');
});

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('⭕ Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

app.post('/push-ai', async (req, res) => {
  const { sceneDefs, instruction } = req.body;
  if (!Array.isArray(sceneDefs) || !instruction) {
    return res.status(400).json({ error: 'sceneDefs+instruction required' });
  }

  // build messages exactly as in ai.js
  const messages = [
    {
      role: 'system',
      content: `
You’re an editor for a 2D scene represented as a JSON array...
Only return the updated JSON array, no extra text.
`
    },
    {
      role: 'user',
      content: `Current scene:\n\`\`\`json\n${JSON.stringify(sceneDefs, null,2)}\`\`\`\nInstruction: ${instruction}`
    }
  ];

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0
      })
    });
    const { choices } = await apiRes.json();
    return res.json({ updatedJson: choices[0].message.content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'OpenAI request failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
