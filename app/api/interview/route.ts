import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 🧠 Prompt système Aura
const SYSTEM_PROMPT = `
Tu es "Aura Design Agent", expert en Event Storming.
À chaque message de l'utilisateur, tu dois :

1) Répondre naturellement à l'utilisateur pour poursuivre l'interview.
2) Extraire les éléments métier présents dans son message sous forme de JSON structuré :

{
  "actors": [...],
  "events": [...],
  "commands": [...],
  "aggregates": [...],
  "policies": [...],
  "externalSystems": [...],
  "dataObjects": [...],
  "issues": [...],
  "steps": [...],
  "contexts": [...]
}

Règles :
- N'invente rien.
- N'ajoute que ce qui est explicitement mentionné.
- Le JSON doit être valide.
- Retourner la réponse d'Aura dans "reply".
- Retourner les éléments extraits dans "storming".
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 🔥 Protection anti-null / undefined / mauvais formats venant du frontend
    const safeMessages = (messages || [])
      .filter((m: any) => m && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role || "user",
        content: m.content ?? ""
      }));

    // 📡 Appel OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "aura_event_storming_output",
          strict: false,
          schema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              storming: {
                type: "object",
                properties: {
                  actors: { type: "array", items: { type: "string" } },
                  events: { type: "array", items: { type: "string" } },
                  commands: { type: "array", items: { type: "string" } },
                  aggregates: { type: "array", items: { type: "string" } },
                  policies: { type: "array", items: { type: "string" } },
                  externalSystems: { type: "array", items: { type: "string" } },
                  dataObjects: { type: "array", items: { type: "string" } },
                  issues: { type: "array", items: { type: "string" } },
                  steps: { type: "array", items: { type: "string" } },
                  contexts: { type: "array", items: { type: "string" } }
                },
                required: []
              }
            },
            required: ["reply"]
          }
        }
      },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeMessages,
      ],
    });

    const output = completion.choices[0].message;

    // 🧩 Vérification finale
    if (!output?.content) {
      throw new Error("OpenAI returned an empty content field");
    }

    // 📦 Retour au frontend
    return NextResponse.json(JSON.parse(output.content));
  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne Aura",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
