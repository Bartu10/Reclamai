# ReclamaAI 🔥
### Generador de cartas de reclamación con IA — powered by Groq

Stack: Node.js + Express + Groq API (llama-3.1-8b-instant)
Coste en producción: 0€ hasta ~14.400 cartas/día (free tier de Groq)

---

## Setup local

```bash
npm install
cp .env.example .env   # pon tu GROQ_API_KEY
npm start              # → http://localhost:3000
```

## Consigue tu API key de Groq (gratis, sin tarjeta)

1. https://console.groq.com → crear cuenta
2. API Keys → Create API Key (empieza por gsk_...)
3. Pégala en .env

Free tier: 14.400 req/día · 30 req/min · sin tarjeta de crédito

---

## Deploy en Render

1. Sube a GitHub (sin .env)
2. render.com → New Web Service → conecta repo
3. Build: npm install | Start: npm start
4. Environment Variables:
   GROQ_API_KEY = gsk_tu_key
   GROQ_MODEL   = llama-3.1-8b-instant
5. Deploy → URL pública en 2 minutos

Nota: el free tier de Render duerme tras 15 min sin tráfico.
Para producción real usa Railway o el plan Starter de Render (7$/mes).

---

## Variables de entorno

GROQ_API_KEY  → obligatoria (conseguir en console.groq.com)
GROQ_MODEL    → llama-3.1-8b-instant (default, no tocar)
PORT          → 3000 (Render lo sobreescribe automáticamente)

---

## AdSense slots

Busca los comentarios ADSENSE en public/index.html.
3 slots preparados: top (728x90), mid (728x90), sidebar (300x600).
