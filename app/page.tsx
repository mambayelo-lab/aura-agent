"use client";

import { useState } from "react";

type StormingMap = {
  actors?: string[];
  events?: string[];
  commands?: string[];
  aggregates?: string[];
  policies?: string[];
  externalSystems?: string[];
  dataObjects?: string[];
  issues?: string[];
  steps?: string[];
  contexts?: string[];
};

const TimelineEventStorming = ({ storming }: { storming: any }) => {
  const events = storming.events || [];
  const commands = storming.commands || [];
  const actors = storming.actors || [];

  const timelineItems = [
    ...events.map((e: string) => ({ type: "event", label: e })),
    ...commands.map((c: string) => ({ type: "command", label: c })),
    ...actors.map((a: string) => ({ type: "actor", label: a })),
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">📅 Timeline Event Storming</h2>

      <div className="overflow-x-auto whitespace-nowrap border border-slate-700 rounded-lg p-4">
        {timelineItems.length === 0 && (
          <div className="text-slate-400 text-sm">
            Aucune information pour la timeline pour le moment...
          </div>
        )}

        {timelineItems.map((item, idx) => {
          const colors: any = {
            event: "bg-orange-500",
            command: "bg-yellow-500",
            actor: "bg-blue-500",
          };

          return (
            <div
              key={idx}
              className={`
                inline-block px-4 py-2 m-2 
                text-white rounded shadow 
                ${colors[item.type]}
              `}
            >
              <span className="font-semibold capitalize">{item.type}</span> — {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour, je suis Aura Design Agent. Pour commencer, décris-moi ton entreprise et sa mission principale.",
    },
  ]);

  const [storming, setStorming] = useState<StormingMap>({
    actors: [],
    events: [],
    commands: [],
    aggregates: [],
    policies: [],
    externalSystems: [],
    dataObjects: [],
    issues: [],
    steps: [],
    contexts: [],
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMsgs }),
    });

    const data = await res.json();

    // Ajout de la réponse d’Aura
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    // Mise à jour de la carte Event Storming
    if (data.storming) {
      const s = data.storming;

      setStorming((prev) => ({
        actors: [...new Set([...(prev.actors || []), ...(s.actors || [])])],
        events: [...new Set([...(prev.events || []), ...(s.events || [])])],
        commands: [...new Set([...(prev.commands || []), ...(s.commands || [])])],
        aggregates: [...new Set([...(prev.aggregates || []), ...(s.aggregates || [])])],
        policies: [...new Set([...(prev.policies || []), ...(s.policies || [])])],
        externalSystems: [
          ...new Set([...(prev.externalSystems || []), ...(s.externalSystems || [])]),
        ],
        dataObjects: [
          ...new Set([...(prev.dataObjects || []), ...(s.dataObjects || [])]),
        ],
        issues: [...new Set([...(prev.issues || []), ...(s.issues || [])])],
        steps: [...new Set([...(prev.steps || []), ...(s.steps || [])])],
        contexts: [...new Set([...(prev.contexts || []), ...(s.contexts || [])])],
      }));
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Aura Design Agent — Event Storming</h1>

      {/* Zone de chat */}
      <div className="flex gap-6">
        <div className="flex-1 bg-slate-800 rounded-lg p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded max-w-[80%] ${
                m.role === "assistant"
                  ? "bg-slate-700 text-white"
                  : "bg-indigo-600 text-white ml-auto"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <div className="text-slate-400">Aura réfléchit...</div>}
        </div>

        {/* Carte Event Storming */}
        <div className="w-1/3 bg-slate-800 rounded-lg p-4 overflow-y-auto max-h-[60vh]">
          <h2 className="text-xl font-semibold mb-4">📌 Carte Event Storming</h2>

          {Object.entries(storming).map(([key, list]) => (
            <div key={key} className="mb-4">
              <h3 className="text-lg font-bold capitalize">
                {key}
              </h3>
              <ul className="ml-4 list-disc text-sm text-slate-300">
                {(list || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <TimelineEventStorming storming={storming} />


      {/* Input */}
      <div className="flex gap-3">
        <input
          className="flex-1 bg-slate-800 p-3 rounded text-white"
          placeholder="Écris ta réponse..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button
          className="bg-indigo-600 px-4 py-2 rounded"
          onClick={send}
        >
          Envoyer
        </button>
        <button
          onClick={async () => {
            const res = await fetch("/api/export/drawio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storming }),
          });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "aura-event-storming.drawio";
    a.click();
  }}
  className="bg-emerald-600 px-4 py-2 rounded"
>
  Exporter Draw.io
</button>

      </div>
    </main>
  );
}
