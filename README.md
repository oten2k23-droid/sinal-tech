# SINAL — site de tecnologia atualizado todo dia por IA

## O que é isso

Um site estático (`index.html` + `posts.json`) que mostra, todo dia, uma
notícia de tecnologia (buscada na web) e uma dica prática — geradas
automaticamente pela API da Anthropic (Claude) via GitHub Actions, sem
você precisar tocar em nada depois de configurado.

## Passo 1 — Criar conta no GitHub

1. Acesse https://github.com/signup e crie sua conta (gratuita).
2. Confirme seu e-mail.

## Passo 2 — Criar o repositório

1. No GitHub, clique em **New repository**.
2. Nome sugerido: `sinal-tech` (pode ser outro).
3. Deixe como **Public** (necessário pro plano gratuito do Netlify funcionar
   sem custo) e clique em **Create repository**.

## Passo 3 — Subir os arquivos

Forma mais simples (sem usar terminal):
1. Na página do repositório recém-criado, clique em **uploading an existing file**.
2. Arraste TODOS os arquivos e pastas deste projeto (`index.html`,
   `posts.json`, `generate.js`, `README.md` e a pasta `.github` inteira).
3. Clique em **Commit changes**.

> Atenção: a pasta `.github/workflows/daily-update.yml` precisa manter
> exatamente esse caminho. Se o GitHub achatar a pasta no upload, crie a
> pasta manualmente pelo site (botão "Add file" → "Create new file" e digite
> o caminho `.github/workflows/daily-update.yml` no nome).

## Passo 4 — Adicionar sua chave de API como "secret"

1. No repositório, vá em **Settings** → **Secrets and variables** → **Actions**.
2. Clique em **New repository secret**.
3. Nome: `ANTHROPIC_API_KEY`
4. Valor: sua chave da API da Anthropic (gerada em console.anthropic.com,
   na seção "API Keys"). É uma chave diferente da sua conta do claude.ai —
   API é cobrada à parte, por uso (bem barato para 1 chamada por dia).
5. Clique em **Add secret**.

## Passo 5 — Testar a automação manualmente

1. Vá na aba **Actions** do repositório.
2. Clique no workflow **Atualização diária do SINAL**.
3. Clique em **Run workflow** → **Run workflow**.
4. Aguarde ~30s e veja se rodou sem erro (bolinha verde). Se der erro
   vermelho, clique para ver o log — geralmente é a chave de API errada.

Se funcionou, o `posts.json` vai ganhar um novo post automaticamente, todo
dia às 06:00 (horário de Brasília), sem você precisar fazer nada.

## Passo 6 — Publicar o site (Netlify)

1. Acesse https://app.netlify.com e crie conta (pode usar login do GitHub).
2. Clique em **Add new site** → **Import an existing project**.
3. Escolha **GitHub** e selecione o repositório `sinal-tech`.
4. Não precisa configurar build command nem publish directory (deixe em
   branco ou `.`) — é um site estático puro.
5. Clique em **Deploy**.

Pronto: seu site vai estar no ar em um link tipo
`https://algum-nome-aleatorio.netlify.app`. Você pode trocar esse nome nas
configurações do site (**Site settings** → **Change site name**).

## Como funciona no dia a dia

- Todo dia às 06:00 (BRT), o GitHub Actions roda `generate.js`.
- O script chama a API da Anthropic com busca na web ativada, pede uma
  notícia real recente + uma dica, e recebe a resposta em JSON.
- O novo post é adicionado ao `posts.json` e o Actions faz o commit
  automaticamente.
- O Netlify detecta o commit novo e republica o site sozinho, em segundos.

Você não precisa fazer nada no dia a dia. Se quiser mudar o horário, edite
a linha `cron` no arquivo `.github/workflows/daily-update.yml` (o formato é
`minuto hora * * *`, sempre em UTC).
