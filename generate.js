// generate.js
// Roda 1x por dia via GitHub Actions. Chama a API da Anthropic (com busca na
// web ativada) para gerar UMA notícia real de tecnologia + UMA dica prática,
// e adiciona ao posts.json do site.

const fs = require('fs');
const path = require('path');

const POSTS_PATH = path.join(__dirname, 'posts.json');
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('ERRO: variável de ambiente ANTHROPIC_API_KEY não encontrada.');
  process.exit(1);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function callClaude() {
  const prompt = `Hoje é ${todayISO()}. Use a busca na web para achar UMA notícia
real e relevante de tecnologia (IA, redes/telecom, hardware, software, cibersegurança
ou internet) publicada nas últimas 24-48h. Depois, crie também UMA dica prática de
tecnologia (segurança digital, produtividade, uso de internet, boas práticas de IA, etc)
que não precisa estar ligada à notícia.

Responda APENAS com um JSON válido, sem markdown, sem crases, no formato exato:
{
  "noticia": { "tag": "categoria curta (ex: IA, Redes, Hardware, Segurança)", "title": "título curto e direto em português", "summary": "resumo de 2-3 frases em português, claro e sem jargão excessivo" },
  "dica": { "tag": "categoria curta", "title": "título curto e direto em português", "summary": "explicação prática de 2-3 frases em português" }
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API retornou ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();

  const cleaned = textBlock.replace(/^```json\s*|```$/g, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  const raw = fs.readFileSync(POSTS_PATH, 'utf-8');
  const posts = JSON.parse(raw);

  const today = todayISO();
  if (posts.some(p => p.date === today)) {
    console.log(`Já existe post para ${today}, nada a fazer.`);
    return;
  }

  console.log('Chamando a API da Anthropic...');
  const generated = await callClaude();

  const newPost = { date: today, ...generated };
  posts.unshift(newPost);

  fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2) + '\n');
  console.log(`Post de ${today} adicionado com sucesso.`);
}

main().catch(err => {
  console.error('Falha ao gerar conteúdo do dia:', err);
  process.exit(1);
});
