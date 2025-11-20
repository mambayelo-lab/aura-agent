import { NextResponse } from "next/server";

// Fonction utilitaire qui génère un bloc Draw.io (mxCell)
function node(id: string, text: string, x: number, y: number, color: string) {
  return `
    <mxCell id="${id}" value="${text}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${color};strokeColor=#000000;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="180" height="60" as="geometry"/>
    </mxCell>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const storming = body.storming;
    if (!storming) {
      return NextResponse.json({ error: "Aucune carte storming fournie." }, { status: 400 });
    }

    let xmlNodes = "";
    let y = 20;

    const addCategory = (title: string, items: string[], color: string) => {
      if (!items || items.length === 0) return;

      xmlNodes += node(`title_${title}`, `=== ${title.toUpperCase()} ===`, 20, y, "#f5f5f5");
      y += 80;

      items.forEach((item, index) => {
        xmlNodes += node(`${title}_${index}`, item, 40, y, color);
        y += 80;
      });

      y += 20;
    };

    addCategory("Actors", storming.actors || [], "#a7c7e7");
    addCategory("Events", storming.events || [], "#f8c471");
    addCategory("Commands", storming.commands || [], "#f7dc6f");
    addCategory("Aggregates", storming.aggregates || [], "#d7bde2");
    addCategory("Policies", storming.policies || [], "#fadbd8");
    addCategory("External Systems", storming.externalSystems || [], "#bb8fce");
    addCategory("Data Objects", storming.dataObjects || [], "#aed6f1");
    addCategory("Issues", storming.issues || [], "#f5b7b1");
    addCategory("Steps", storming.steps || [], "#d5d8dc");

    const drawio = `
      <mxfile>
        <diagram id="AuraEventStorming" name="Aura Event Storming">
          <mxGraphModel dx="1062" dy="575" grid="1" gridSize="10" guides="1" tooltips="1" connect="1">
            <root>
              <mxCell id="0"/>
              <mxCell id="1" parent="0"/>
              ${xmlNodes}
            </root>
          </mxGraphModel>
        </diagram>
      </mxfile>
    `;

    const headers = {
      "Content-Type": "application/xml",
      "Content-Disposition": "attachment; filename=aura-event-storming.drawio",
    };

    return new NextResponse(drawio, { status: 200, headers });
  } catch (e: any) {
    console.error("DRAW.IO EXPORT ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
