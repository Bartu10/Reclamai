const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const GROQ_MODEL   = process.env.GROQ_MODEL   || "llama-3.1-8b-instant";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const TIPOS = {
  luz_gas: {
    label: "Luz / Gas", icon: "⚡",
    empresa_placeholder: "Endesa, Iberdrola, Repsol...",
    system: `Eres un experto en derecho del consumidor eléctrico y gasístico en España.
Redactas cartas de reclamación formales, firmes y técnicamente correctas.
Citas la normativa cuando aplica (Ley 24/2013 del Sector Eléctrico, Real Decreto 1955/2000).
SOLO el texto de la carta. Sin explicaciones, sin notas, sin comillas.`,
    build: (d) => `Redacta carta de reclamación formal a ${d.empresa} (servicio: ${d.servicio || "electricidad"}).
Reclamante: ${d.nombre}, contrato/CUPS: ${d.contrato || "en factura adjunta"}.
Motivo: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Solicita respuesta en plazo legal (1 mes). Solo la carta.`
  },
  telefonia: {
    label: "Telefonía / Internet", icon: "📱",
    empresa_placeholder: "Movistar, Vodafone, Orange, Yoigo...",
    system: `Eres experto en derecho de telecomunicaciones en España (Ley 9/2014 General de Telecomunicaciones).
Redactas cartas de reclamación claras con hechos ordenados y exigencias concretas. SOLO la carta.`,
    build: (d) => `Carta de reclamación a ${d.empresa} por telecomunicaciones.
Cliente: ${d.nombre}, nº/contrato: ${d.contrato || "en adjunto"}.
Motivo: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Menciona derecho a reclamar ante SETSI si no hay respuesta en 1 mes. Solo la carta.`
  },
  banco: {
    label: "Banco / Financiero", icon: "🏦",
    empresa_placeholder: "BBVA, Santander, CaixaBank, ING...",
    system: `Eres experto en derecho bancario en España (Ley 16/2011, normativa Banco de España).
Redactas reclamaciones bancarias formales citando normativa. SOLO la carta.`,
    build: (d) => `Carta de reclamación al SAC de ${d.empresa}.
Titular: ${d.nombre}, cuenta/contrato: ${d.contrato || "en adjunto"}.
Motivo: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Si no responden en 2 meses, acudirán al Defensor del Cliente y al Banco de España. Solo la carta.`
  },
  aerolinea: {
    label: "Aerolínea / Viaje", icon: "✈️",
    empresa_placeholder: "Ryanair, Iberia, Vueling, EasyJet...",
    system: `Eres experto en derechos de pasajeros aéreos en la UE (Reglamento CE 261/2004).
Redactas reclamaciones por vuelos cancelados, retrasados o equipaje. Citas importes de compensación. SOLO la carta.`,
    build: (d) => `Reclamación a ${d.empresa}. Pasajero: ${d.nombre}. Reserva: ${d.contrato || "en adjunto"}. Vuelo: ${d.vuelo || "en adjunto"}.
Incidencia: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Cita Reglamento CE 261/2004 y compensación aplicable. Solo la carta.`
  },
  seguro: {
    label: "Seguro", icon: "🛡️",
    empresa_placeholder: "Mapfre, Allianz, Mutua, AXA...",
    system: `Eres experto en derecho asegurador en España (Ley 50/1980 de Contrato de Seguro).
Redactas reclamaciones a aseguradoras por siniestros no atendidos o coberturas denegadas. SOLO la carta.`,
    build: (d) => `Reclamación al SAC de ${d.empresa} (aseguradora).
Asegurado: ${d.nombre}, póliza/siniestro: ${d.contrato || "en adjunto"}.
Motivo: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Si no responden en 2 meses, acudirán a la Dirección General de Seguros. Solo la carta.`
  },
  ecommerce: {
    label: "Tienda online / Amazon", icon: "📦",
    empresa_placeholder: "Amazon, Zara, El Corte Inglés, AliExpress...",
    system: `Eres experto en derechos del consumidor en comercio electrónico en España (RDL 1/2007, Ley 3/2014).
Redactas reclamaciones por productos defectuosos o devoluciones rechazadas. SOLO la carta.`,
    build: (d) => `Reclamación a ${d.empresa}. Comprador: ${d.nombre}, pedido: ${d.contrato || "en adjunto"}.
Problema: ${d.motivo}. Solución: ${d.solicitud}.
Tono: ${d.tono}. Menciona garantía legal 3 años (RDL 1/2007) y desistimiento 14 días si aplica. Solo la carta.`
  },
  comunidad: {
    label: "Vecinos / Comunidad", icon: "🏘️",
    empresa_placeholder: "Administrador de fincas, Presidente comunidad...",
    system: `Eres experto en Ley de Propiedad Horizontal en España (Ley 49/1960).
Redactas cartas formales para comunidades de propietarios. SOLO la carta.`,
    build: (d) => `Carta a ${d.empresa} (${d.cargo || "administrador/presidente"}).
Remitente: ${d.nombre}, vivienda: ${d.contrato || "indicada"}.
Asunto: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Cita LPH si aplica. Solo la carta.`
  },
  hacienda: {
    label: "Hacienda / DGT / Admin", icon: "🏛️",
    empresa_placeholder: "Agencia Tributaria, DGT, Ayuntamiento...",
    system: `Eres experto en derecho administrativo y tributario en España (Ley 39/2015, Ley 58/2003).
Redactas recursos e instancias a organismos públicos. Estructura: EXPONE / SOLICITA. SOLO el escrito.`,
    build: (d) => `Escrito/recurso a ${d.empresa}. Firmante: ${d.nombre}, expediente: ${d.contrato || "en adjunto"}.
Motivo: ${d.motivo}. Solicitud: ${d.solicitud}.
Tono: ${d.tono}. Formato instancia administrativa con EXPONE y SOLICITA. Solo el escrito.`
  },
};

// ── Status ─────────────────────────────────────────────
app.get("/api/status", (_req, res) => {
  res.json({ ok: Boolean(GROQ_API_KEY), model: GROQ_MODEL });
});

// ── Tipos ──────────────────────────────────────────────
app.get("/api/tipos", (_req, res) => {
  res.json(Object.entries(TIPOS).map(([k, v]) => ({
    key: k, label: v.label, icon: v.icon,
    empresa_placeholder: v.empresa_placeholder
  })));
});

// ── Generar carta (SSE streaming) ──────────────────────
app.post("/api/generar", async (req, res) => {
  const { tipo, datos } = req.body;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Falta GROQ_API_KEY en las variables de entorno" });
  }

  const t = TIPOS[tipo];
  if (!t) return res.status(400).json({ error: "Tipo no válido" });

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        stream:      true,
        temperature: 0.7,
        max_tokens:  1024,
        messages: [
          { role: "system", content: t.system },
          { role: "user",   content: t.build(datos) }
        ]
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      res.write(`data: ${JSON.stringify({ error: err?.error?.message || groqRes.statusText })}\n\n`);
      return res.end();
    }

    const reader  = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const clean = line.trim();
        if (!clean || clean === "data: [DONE]") continue;
        if (!clean.startsWith("data: ")) continue;
        try {
          const json  = JSON.parse(clean.slice(6));
          const token = json.choices?.[0]?.delta?.content;
          if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
          if (json.choices?.[0]?.finish_reason === "stop") {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch {}
      }
    }
    res.end();

  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n🔥  ReclamaAI  →  http://localhost:${PORT}`);
  console.log(`🤖  Modelo     →  ${GROQ_MODEL}`);
  console.log(`🔑  Groq key   →  ${GROQ_API_KEY ? "✅ OK" : "❌ falta GROQ_API_KEY"}\n`);
});
