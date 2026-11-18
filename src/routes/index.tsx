import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAVELA ANGOLANA — Mundo Aberto" },
      { name: "description", content: "Primeiro protótipo jogável de FAVELA ANGOLANA." },
    ],
  }),
  component: FavelaAngolana,
});

type Point = { x: number; y: number };

const WORLD = { width: 1800, height: 1200 };
const buildings = [
  { x: 120, y: 100, w: 210, h: 130, c: "#b66b3d" },
  { x: 410, y: 90, w: 170, h: 150, c: "#d2a15d" },
  { x: 760, y: 110, w: 230, h: 120, c: "#a95b42" },
  { x: 1110, y: 100, w: 190, h: 150, c: "#c58b4c" },
  { x: 1450, y: 120, w: 220, h: 130, c: "#a85c3a" },
  { x: 130, y: 390, w: 180, h: 160, c: "#c28b52" },
  { x: 440, y: 420, w: 230, h: 120, c: "#a85e40" },
  { x: 790, y: 390, w: 190, h: 160, c: "#d2a15d" },
  { x: 1110, y: 420, w: 220, h: 130, c: "#a95b42" },
  { x: 1460, y: 390, w: 180, h: 160, c: "#c58b4c" },
  { x: 110, y: 790, w: 230, h: 140, c: "#a95b42" },
  { x: 450, y: 770, w: 170, h: 170, c: "#d2a15d" },
  { x: 780, y: 790, w: 220, h: 140, c: "#b66b3d" },
  { x: 1120, y: 770, w: 180, h: 170, c: "#c58b4c" },
  { x: 1450, y: 790, w: 220, h: 140, c: "#a85e40" },
];

const initialNpcs: Point[] = [
  { x: 350, y: 315 }, { x: 690, y: 650 }, { x: 1030, y: 310 },
  { x: 1370, y: 650 }, { x: 620, y: 1030 }, { x: 1540, y: 650 },
];

function FavelaAngolana() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const player = useRef<Point>({ x: 890, y: 650 });
  const camera = useRef<Point>({ x: 0, y: 0 });
  const npcs = useRef<Point[]>(initialNpcs.map((p) => ({ ...p })));
  const [position, setPosition] = useState("Bairro da Paz");
  const [missionDone, setMissionDone] = useState(false);
  const [message, setMessage] = useState("Bem-vindo ao bairro! Explora a cidade.");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      keys.current[key] = true;
      if (key === "e") {
        const p = player.current;
        const near = Math.hypot(p.x - 900, p.y - 300) < 95;
        if (near) {
          setMissionDone(true);
          setMessage("Missão concluída! Entregaste a encomenda no mercado.");
        }
      }
      if (key === "escape") setPaused((v) => !v);
    };
    const up = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let raf = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (!paused) {
        const speed = keys.current["shift"] ? 4.2 : 2.6;
        const dx = (keys.current["d"] || keys.current["arrowright"] ? 1 : 0) - (keys.current["a"] || keys.current["arrowleft"] ? 1 : 0);
        const dy = (keys.current["s"] || keys.current["arrowdown"] ? 1 : 0) - (keys.current["w"] || keys.current["arrowup"] ? 1 : 0);
        const length = Math.hypot(dx, dy) || 1;
        player.current.x = Math.max(35, Math.min(WORLD.width - 35, player.current.x + (dx / length) * speed));
        player.current.y = Math.max(35, Math.min(WORLD.height - 35, player.current.y + (dy / length) * speed));
      }
      camera.current.x += (Math.max(0, Math.min(WORLD.width - w, player.current.x - w / 2)) - camera.current.x) * 0.12;
      camera.current.y += (Math.max(0, Math.min(WORLD.height - h, player.current.y - h / 2)) - camera.current.y) * 0.12;
      const ox = camera.current.x;
      const oy = camera.current.y;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#b99a6b";
      ctx.fillRect(0, 0, w, h);

      // Terra batida, passeios e ruas do bairro.
      ctx.fillStyle = "#4b4b45";
      for (const y of [270, 650, 1030]) ctx.fillRect(0, y - oy, w, 82);
      for (const x of [350, 700, 1050, 1400]) ctx.fillRect(x - ox, 0, 76, h);
      ctx.strokeStyle = "#c9b88b";
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 18]);
      for (const y of [311, 691, 1071]) { ctx.beginPath(); ctx.moveTo(0, y - oy); ctx.lineTo(w, y - oy); ctx.stroke(); }
      ctx.setLineDash([]);

      // Casas e pequenos comércios.
      for (const b of buildings) {
        const x = b.x - ox, y = b.y - oy;
        ctx.fillStyle = "rgba(0,0,0,.22)";
        ctx.fillRect(x + 9, y + 12, b.w, b.h);
        ctx.fillStyle = b.c;
        ctx.fillRect(x, y, b.w, b.h);
        ctx.fillStyle = "#51463b";
        ctx.fillRect(x - 5, y - 10, b.w + 10, 18);
        ctx.fillStyle = "#49392e";
        ctx.fillRect(x + b.w / 2 - 16, y + b.h - 48, 32, 48);
        ctx.fillStyle = "#8cc0c8";
        ctx.fillRect(x + 24, y + 38, 34, 28);
        ctx.fillRect(x + b.w - 58, y + 38, 34, 28);
      }

      // Árvores e postes.
      for (let i = 0; i < 18; i++) {
        const x = ((i * 193 + 80) % WORLD.width) - ox;
        const y = ((i * 127 + 65) % WORLD.height) - oy;
        ctx.fillStyle = "#5a3e28"; ctx.fillRect(x - 4, y, 8, 22);
        ctx.fillStyle = "#426c3e"; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill();
      }

      // Mercado e ponto de missão.
      ctx.fillStyle = "#e7bd43";
      ctx.fillRect(820 - ox, 250 - oy, 165, 55);
      ctx.fillStyle = "#28251f";
      ctx.font = "bold 16px Arial";
      ctx.fillText("MERCADO DO BAIRRO", 827 - ox, 284 - oy);
      ctx.fillStyle = missionDone ? "#38a169" : "#f0c34e";
      ctx.beginPath(); ctx.arc(900 - ox, 330 - oy, 16 + Math.sin(frame / 12) * 3, 0, Math.PI * 2); ctx.fill();

      // NPCs.
      npcs.current.forEach((npc, i) => {
        const wander = Math.sin(frame / 70 + i) * 7;
        ctx.fillStyle = "#24262a"; ctx.beginPath(); ctx.arc(npc.x - ox + wander, npc.y - oy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ["#e8b34b", "#4f8d78", "#bd6654"][i % 3];
        ctx.fillRect(npc.x - ox - 8 + wander, npc.y - oy + 9, 16, 22);
      });

      // Jogador.
      const px = player.current.x - ox, py = player.current.y - oy;
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(px, py + 17, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d7a36d"; ctx.beginPath(); ctx.arc(px, py - 7, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#245b9b"; ctx.fillRect(px - 10, py + 2, 20, 22);
      ctx.fillStyle = "#171b22"; ctx.fillRect(px - 9, py + 23, 7, 13); ctx.fillRect(px + 2, py + 23, 7, 13);
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.fillText("TU", px, py - 23); ctx.textAlign = "left";

      // Minimap.
      const mw = 138, mh = 92, mx = w - mw - 16, my = 16;
      ctx.fillStyle = "rgba(12,16,20,.82)"; ctx.fillRect(mx, my, mw, mh);
      ctx.fillStyle = "#b99a6b"; ctx.fillRect(mx + 5, my + 5, mw - 10, mh - 10);
      ctx.fillStyle = "#454641";
      for (const y of [270, 650, 1030]) ctx.fillRect(mx + 5, my + (y / WORLD.height) * (mh - 10), mw - 10, 5);
      for (const x of [350, 700, 1050, 1400]) ctx.fillRect(mx + (x / WORLD.width) * (mw - 10) + 5, my + 5, 5, mh - 10);
      ctx.fillStyle = "#ffdb61"; ctx.beginPath();
      ctx.arc(mx + 5 + (player.current.x / WORLD.width) * (mw - 10), my + 5 + (player.current.y / WORLD.height) * (mh - 10), 4, 0, Math.PI * 2); ctx.fill();
      if (paused) {
        ctx.fillStyle = "rgba(0,0,0,.62)"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff"; ctx.font = "bold 34px Arial"; ctx.textAlign = "center"; ctx.fillText("JOGO EM PAUSA", w / 2, h / 2); ctx.textAlign = "left";
      }
      frame++;
      if (frame % 30 === 0) setPosition(player.current.y < 390 ? "Zona do Mercado" : player.current.y > 800 ? "Rua das Acácias" : "Bairro da Paz");
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const hold = (key: string, value: boolean) => { keys.current[key] = value; };
  return (
    <main style={{ minHeight: "100vh", background: "#10151b", color: "#f7f4ed", fontFamily: "Inter, system-ui, sans-serif", padding: "18px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#e7b84b", fontSize: 12, letterSpacing: 3, fontWeight: 800 }}>ANGOLA • MUNDO ABERTO</div>
            <h1 style={{ margin: "3px 0", fontSize: "clamp(26px,4vw,38px)", letterSpacing: -1 }}>FAVELA <span style={{ color: "#e7b84b" }}>ANGOLANA</span></h1>
            <div style={{ color: "#aab2bd", fontSize: 13 }}>Protótipo jogável • Capítulo 01: Bairro da Paz</div>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <span style={{ border: "1px solid #38434e", borderRadius: 30, padding: "8px 12px", fontSize: 12, color: "#aab2bd" }}>● MODO EXPLORAÇÃO</span>
            <button onClick={() => setPaused((v) => !v)} style={buttonStyle}>{paused ? "Continuar" : "Pausar"}</button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ border: "1px solid #3b4651", borderRadius: 14, overflow: "hidden", background: "#b99a6b", boxShadow: "0 18px 55px #0008" }}>
              <canvas ref={canvasRef} width={960} height={560} style={{ width: "100%", display: "block", aspectRatio: "12 / 7" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#9ba6b2", fontSize: 12, padding: "10px 3px" }}>
              <span>WASD / SETAS: mover • SHIFT: correr • E: interagir</span><span>ESC: pausa</span>
            </div>
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>ESTADO DO JOGADOR</div>
              <div style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>Habitante</div>
              <div style={{ color: "#9ba6b2", fontSize: 13, marginTop: 3 }}>Localização: {position}</div>
              <div style={{ height: 7, background: "#303b45", borderRadius: 9, marginTop: 16 }}><div style={{ width: "100%", height: "100%", background: "#4da77a", borderRadius: 9 }} /></div>
              <div style={{ fontSize: 11, color: "#9ba6b2", marginTop: 6 }}>VIDA 100 / 100</div>
            </div>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>MISSÃO ATUAL</div>
              <h3 style={{ margin: "9px 0 6px", fontSize: 16 }}>Entrega no mercado</h3>
              <p style={{ color: "#aab2bd", fontSize: 13, lineHeight: 1.5, margin: 0 }}>Vai até ao mercado do bairro e entrega a encomenda. Aproxima-te do marcador amarelo e carrega em E.</p>
              <div style={{ marginTop: 12, color: missionDone ? "#65c58d" : "#e7b84b", fontSize: 12, fontWeight: 800 }}>{missionDone ? "✓ MISSÃO CONCLUÍDA" : "○ EM ANDAMENTO"}</div>
            </div>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>RÁDIO DO BAIRRO</div>
              <p style={{ margin: "9px 0 0", fontSize: 13, color: "#d4d9df", lineHeight: 1.5 }}>{message}</p>
            </div>
            <div style={{ ...panelStyle, background: "#202a32" }}>
              <div style={eyebrowStyle}>PRÓXIMAS ATUALIZAÇÕES</div>
              <div style={{ fontSize: 12, color: "#aab2bd", lineHeight: 1.8, marginTop: 8 }}>• Personagens e animações 3D<br />• Veículos dirigíveis<br />• Mais bairros de Luanda<br />• Servidor multiplayer e chat</div>
            </div>
          </aside>
        </section>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
          {[[ "w", "▲" ], [ "a", "◀" ], [ "s", "▼" ], [ "d", "▶" ]].map(([key, label]) => (
            <button key={key} onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)} style={{ ...buttonStyle, width: 48, height: 42, touchAction: "none" }}>{label}</button>
          ))}
        </div>
        <footer style={{ color: "#66717d", textAlign: "center", fontSize: 11, marginTop: 18 }}>FAVELA ANGOLANA • VERSÃO DE DESENVOLVIMENTO 0.1 • Projeto em construção</footer>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = { background: "#192129", border: "1px solid #303b45", borderRadius: 12, padding: 15 };
const eyebrowStyle: React.CSSProperties = { color: "#e7b84b", fontSize: 10, fontWeight: 900, letterSpacing: 1.6 };
const buttonStyle: React.CSSProperties = { border: "1px solid #56616d", background: "#26323d", color: "#f7f4ed", borderRadius: 9, padding: "9px 13px", cursor: "pointer", fontWeight: 700 };
