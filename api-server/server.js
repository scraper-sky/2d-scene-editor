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
  You’re an editor for a 2D scene represented as a JSON array following this exact schema:
  
  [{
    "id": string,
    "type": "sprite" | "primitive",
    // if type==="sprite": "key": string
    // if type==="primitive": choose one:
    //   circle:    "shape":"circle","radius":number
    //   rectangle: "shape":"rectangle","width":number,"height":number
    //   triangle:  "shape":"triangle","width":number,"height":number
    "fillColor"?: number,
    "position": [number,number,number],
    "rotation": [number,number,number],
    "scale":    [number,number,number]
  }]
  
  When given a high-level instruction such as “create a house” or “create a person”,
  decompose it into multiple primitive entries:
  • For a house: rectangle for the body + triangle for the roof (you may add windows/doors)
  • For a person: circle for head, rectangles for body/arms/legs
  
  Always generate unique “id” values (e.g. “houseBody1”, “roof1”, “person1_head”).
  Only return the updated JSON array—no extra text or markdown.`
    },
    {
      role: 'user',
      content: `Current scene:
  \`\`\`json
  ${JSON.stringify(sceneDefs, null, 2)}
  \`\`\`
  Instruction: ${instruction}`
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
