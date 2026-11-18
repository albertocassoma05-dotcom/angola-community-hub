import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAVELA ANGOLANA — Cidade Aberta" },
      { name: "description", content: "Explora o Bairro da Paz no primeiro protótipo de FAVELA ANGOLANA." },
    ],
  }),
  component: FavelaAngolana,
});

type Point = { x: number; y: number };
type Building = { x: number; y: number; w: number; h: number; color: string; floors: number; shop?: string };
type Car = { x: number; y: number; dir: 1 | -1; speed: number; color: string; type: "sedan" | "van" | "taxi"; road: number };

const WORLD = { width: 2200, height: 1500 };
const ROAD_Y = [310, 750, 1190];
const ROAD_X = [390, 830, 1270, 1710];
const palette = ["#bd8052", "#d0a16a", "#a95e46", "#d4bd91", "#b7a16e", "#9c6e55", "#d2a45c"];
const buildings: Building[] = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 5; col++) {
    const x = 55 + col * 440 + ((row + col) % 2) * 18;
    const y = 55 + row * 350 + (col % 2) * 12;
    if (x + 280 < WORLD.width && y + 220 < WORLD.height) {
      buildings.push({
        x, y, w: 170 + ((row * 31 + col * 17) % 105),
        h: 125 + ((row * 23 + col * 29) % 90),
        color: palette[(row * 3 + col) % palette.length],
        floors: 1 + ((row + col) % 3),
        shop: (row + col) % 5 === 0 ? ["MERCEARIA", "BARBEARIA", "OFICINA", "CANTINA"][((row + col) / 5) % 4] : undefined,
      });
    }
  }
}
// Deixa corredores largos e seguros para a circulação, sem edifícios sobre as estradas.
const safeBuildings = buildings.filter((b) =>
  !ROAD_Y.some((y) => b.y < y + 105 && b.y + b.h > y - 35) &&
  !ROAD_X.some((x) => b.x < x + 105 && b.x + b.w > x - 35)
);

const initialNpcs: Point[] = [
  { x: 260, y: 440 }, { x: 600, y: 590 }, { x: 1040, y: 470 },
  { x: 1460, y: 880 }, { x: 1900, y: 520 }, { x: 620, y: 1320 },
  { x: 1510, y: 1320 }, { x: 2050, y: 930 },
];

const initialCars: Car[] = [
  { x: 100, y: 290, dir: 1, speed: 1.55, color: "#d7d9dc", type: "sedan", road: 0 },
  { x: 900, y: 332, dir: -1, speed: 1.35, color: "#d9a52e", type: "taxi", road: 0 },
  { x: 1550, y: 290, dir: 1, speed: 1.7, color: "#426b9b", type: "van", road: 0 },
  { x: 500, y: 730, dir: -1, speed: 1.5, color: "#b64f3f", type: "sedan", road: 1 },
  { x: 1300, y: 772, dir: 1, speed: 1.65, color: "#e4e0d5", type: "taxi", road: 1 },
  { x: 1850, y: 730, dir: -1, speed: 1.4, color: "#477a58", type: "van", road: 1 },
  { x: 200, y: 1170, dir: 1, speed: 1.6, color: "#e1e3e6", type: "sedan", road: 2 },
  { x: 1050, y: 1232, dir: -1, speed: 1.45, color: "#d7a32f", type: "taxi", road: 2 },
  { x: 1650, y: 1170, dir: 1, speed: 1.75, color: "#735d91", type: "sedan", road: 2 },
];

function circleRect(px: number, py: number, radius: number, r: { x: number; y: number; w: number; h: number }) {
  const nx = Math.max(r.x, Math.min(px, r.x + r.w));
  const ny = Math.max(r.y, Math.min(py, r.y + r.h));
  return Math.hypot(px - nx, py - ny) < radius;
}

function FavelaAngolana() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const player = useRef<Point>({ x: 640, y: 500 });
  const camera = useRef<Point>({ x: 0, y: 0 });
  const cars = useRef<Car[]>(initialCars.map((c) => ({ ...c })));
  const npcs = useRef<Point[]>(initialNpcs.map((p) => ({ ...p })));
  const [position, setPosition] = useState("Bairro da Paz");
  const [missionDone, setMissionDone] = useState(false);
  const [message, setMessage] = useState("A cidade está viva. Explora com cuidado!");
  const [paused, setPaused] = useState(false);
  const [trafficCount, setTrafficCount] = useState(initialCars.length);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      keys.current[key] = true;
      if (key === "e" && Math.hypot(player.current.x - 1090, player.current.y - 410) < 95) {
        setMissionDone(true);
        setMessage("Boa! A encomenda chegou ao Mercado do Bairro.");
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
    let lastTrafficCount = -1;

    const drawRoads = (ox: number, oy: number, w: number, h: number) => {
      ctx.fillStyle = "#a98d68";
      ctx.fillRect(0, 0, w, h);
      // Ruas principais com bermas, passeios e asfalto.
      for (const y of ROAD_Y) {
        const sy = y - oy;
        ctx.fillStyle = "#d0b58a"; ctx.fillRect(0, sy - 52, w, 144);
        ctx.fillStyle = "#555956"; ctx.fillRect(0, sy - 35, w, 110);
        ctx.fillStyle = "#686c67"; ctx.fillRect(0, sy - 31, w, 102);
        ctx.strokeStyle = "#e4d4a9"; ctx.lineWidth = 2; ctx.setLineDash([24, 22]);
        ctx.beginPath(); ctx.moveTo(0, sy + 18); ctx.lineTo(w, sy + 18); ctx.stroke(); ctx.setLineDash([]);
        // Passadeiras.
        for (let x = 180; x < WORLD.width; x += 440) {
          for (let k = 0; k < 6; k++) {
            ctx.fillStyle = "rgba(240,235,218,.75)";
            ctx.fillRect(x - ox + k * 10, sy - 28, 6, 18);
          }
        }
      }
      for (const x of ROAD_X) {
        const sx = x - ox;
        ctx.fillStyle = "#d0b58a"; ctx.fillRect(sx - 52, 0, 144, h);
        ctx.fillStyle = "#555956"; ctx.fillRect(sx - 35, 0, 110, h);
        ctx.fillStyle = "#686c67"; ctx.fillRect(sx - 31, 0, 102, h);
        ctx.strokeStyle = "#e4d4a9"; ctx.lineWidth = 2; ctx.setLineDash([24, 22]);
        ctx.beginPath(); ctx.moveTo(sx + 18, 0); ctx.lineTo(sx + 18, h); ctx.stroke(); ctx.setLineDash([]);
      }
    };

    const drawBuilding = (b: Building, ox: number, oy: number) => {
      const x = b.x - ox, y = b.y - oy;
      if (x + b.w < -30 || y + b.h < -30 || x > canvas.width + 30 || y > canvas.height + 30) return;
      ctx.fillStyle = "rgba(35,26,19,.24)"; ctx.fillRect(x + 9, y + 12, b.w, b.h);
      ctx.fillStyle = "#55483d"; ctx.fillRect(x - 7, y - 12, b.w + 14, 22);
      ctx.fillStyle = b.color; ctx.fillRect(x, y, b.w, b.h);
      // Faixas de piso e janelas.
      for (let floor = 0; floor < b.floors; floor++) {
        const fy = y + 20 + floor * 36;
        for (let win = 0; win < Math.max(2, Math.floor(b.w / 48)); win++) {
          const wx = x + 14 + win * 43;
          ctx.fillStyle = "#455c60"; ctx.fillRect(wx, fy, 25, 19);
          ctx.fillStyle = "rgba(210,231,225,.35)"; ctx.fillRect(wx + 3, fy + 3, 8, 13);
        }
      }
      ctx.fillStyle = "#49382d"; ctx.fillRect(x + b.w / 2 - 15, y + b.h - 42, 30, 42);
      ctx.fillStyle = "#302a25"; ctx.fillRect(x + b.w / 2 - 18, y + b.h - 45, 36, 5);
      if (b.shop) {
        ctx.fillStyle = "#f0c04d"; ctx.fillRect(x + 8, y + b.h - 70, b.w - 16, 20);
        ctx.fillStyle = "#2b2925"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
        ctx.fillText(b.shop, x + b.w / 2, y + b.h - 56); ctx.textAlign = "left";
      }
      ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(x + 4, y + 4, b.w - 8, 3);
    };

    const drawCar = (car: Car, ox: number, oy: number) => {
      const x = car.x - ox, y = car.y - oy;
      if (x < -100 || x > canvas.width + 100 || y < -50 || y > canvas.height + 50) return;
      ctx.save();
      if (car.dir < 0) { ctx.translate(x, y); ctx.scale(-1, 1); }
      else ctx.translate(x, y);
      // Sombra, carroçaria, vidros, rodas e faróis.
      ctx.fillStyle = "rgba(0,0,0,.32)"; ctx.fillRect(-28, -9, 62, 25);
      ctx.fillStyle = "#171a1d"; ctx.fillRect(-25, -13, 13, 8); ctx.fillRect(15, -13, 13, 8);
      ctx.fillRect(-25, 10, 13, 8); ctx.fillRect(15, 10, 13, 8);
      ctx.fillStyle = car.color; ctx.fillRect(-31, -13, 64, 25);
      ctx.fillStyle = "#252c31"; ctx.fillRect(-11, -10, 27, 18);
      ctx.fillStyle = "#8eb5c1"; ctx.fillRect(-8, -9, 10, 16); ctx.fillRect(4, -9, 9, 16);
      ctx.fillStyle = "#f6e5a5"; ctx.fillRect(29, -9, 4, 5);
      ctx.fillStyle = "#d85c4e"; ctx.fillRect(-31, 5, 4, 5);
      if (car.type === "taxi") { ctx.fillStyle = "#f4d24e"; ctx.fillRect(-4, -18, 15, 5); }
      if (car.type === "van") { ctx.fillStyle = "#d9e1e3"; ctx.fillRect(-20, -10, 8, 17); }
      ctx.restore();
    };

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (!paused) {
        const speed = keys.current["shift"] ? 3.4 : 2.15;
        const dx = (keys.current["d"] || keys.current["arrowright"] ? 1 : 0) - (keys.current["a"] || keys.current["arrowleft"] ? 1 : 0);
        const dy = (keys.current["s"] || keys.current["arrowdown"] ? 1 : 0) - (keys.current["w"] || keys.current["arrowup"] ? 1 : 0);
        const len = Math.hypot(dx, dy) || 1;
        const nextX = player.current.x + (dx / len) * speed;
        const nextY = player.current.y + (dy / len) * speed;
        const hitsBuilding = safeBuildings.some((b) => circleRect(nextX, nextY, 13, b));
        const hitsCar = cars.current.some((c) => Math.hypot(nextX - c.x, nextY - c.y) < 42);
        if (!hitsBuilding && !hitsCar) {
          player.current.x = Math.max(18, Math.min(WORLD.width - 18, nextX));
          player.current.y = Math.max(18, Math.min(WORLD.height - 18, nextY));
        }
        // Trânsito abranda e pára antes de atingir o jogador ou outro veículo.
        cars.current.forEach((car, index) => {
          let blocked = Math.abs(player.current.y - car.y) < 30 &&
            ((car.dir > 0 && player.current.x > car.x && player.current.x - car.x < 68) ||
             (car.dir < 0 && player.current.x < car.x && car.x - player.current.x < 68));
          for (let j = 0; j < cars.current.length; j++) {
            if (j === index) continue;
            const other = cars.current[j];
            if (Math.abs(other.y - car.y) < 15 && other.dir === car.dir &&
              ((car.dir > 0 && other.x > car.x && other.x - car.x < 76) ||
               (car.dir < 0 && other.x < car.x && car.x - other.x < 76))) blocked = true;
          }
          if (!blocked) car.x += car.dir * car.speed;
          if (car.x > WORLD.width + 90) car.x = -90;
          if (car.x < -90) car.x = WORLD.width + 90;
        });
      }

      const targetX = Math.max(0, Math.min(WORLD.width - w, player.current.x - w / 2));
      const targetY = Math.max(0, Math.min(WORLD.height - h, player.current.y - h / 2));
      camera.current.x += (targetX - camera.current.x) * 0.11;
      camera.current.y += (targetY - camera.current.y) * 0.11;
      const ox = camera.current.x, oy = camera.current.y;

      drawRoads(ox, oy, w, h);
      // Pequenos detalhes urbanos: árvores, candeeiros e muros baixos.
      for (let i = 0; i < 44; i++) {
        const x = ((i * 197 + 65) % WORLD.width) - ox;
        const y = ((i * 137 + 45) % WORLD.height) - oy;
        if (ROAD_Y.some((ry) => Math.abs(y + oy - ry) < 65) || ROAD_X.some((rx) => Math.abs(x + ox - rx) < 65)) continue;
        ctx.fillStyle = "#59432e"; ctx.fillRect(x - 3, y + 6, 6, 18);
        ctx.fillStyle = i % 3 === 0 ? "#547847" : "#456d42";
        ctx.beginPath(); ctx.arc(x, y, 13 + (i % 4), 0, Math.PI * 2); ctx.fill();
      }
      safeBuildings.forEach((b) => drawBuilding(b, ox, oy));

      // Mercado de referência da missão.
      const mx = 1010 - ox, my = 400 - oy;
      ctx.fillStyle = "#f0c04d"; ctx.fillRect(mx, my, 170, 56);
      ctx.fillStyle = "#2d2922"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center";
      ctx.fillText("MERCADO DO BAIRRO", mx + 85, my + 34); ctx.textAlign = "left";
      ctx.fillStyle = missionDone ? "#44b77b" : "#f4d04e";
      ctx.beginPath(); ctx.arc(1090 - ox, 475 - oy, 15 + Math.sin(frame / 12) * 3, 0, Math.PI * 2); ctx.fill();

      // Trânsito em faixas próprias; carros desenhados sobre o asfalto.
      cars.current.forEach((car) => drawCar(car, ox, oy));
      npcs.current.forEach((npc, i) => {
        const wander = Math.sin(frame / 65 + i) * 6;
        ctx.fillStyle = "#25272a"; ctx.beginPath(); ctx.arc(npc.x - ox + wander, npc.y - oy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ["#e6b24c", "#4f8d78", "#bd6654", "#4d78a8"][i % 4];
        ctx.fillRect(npc.x - ox - 8 + wander, npc.y - oy + 8, 16, 21);
      });

      // Personagem principal com sombra e nome.
      const px = player.current.x - ox, py = player.current.y - oy;
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(px, py + 17, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d7a36d"; ctx.beginPath(); ctx.arc(px, py - 7, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#245b9b"; ctx.fillRect(px - 10, py + 2, 20, 22);
      ctx.fillStyle = "#171b22"; ctx.fillRect(px - 9, py + 23, 7, 13); ctx.fillRect(px + 2, py + 23, 7, 13);
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.fillText("TU", px, py - 23); ctx.textAlign = "left";

      // Minimap.
      const mw = 154, mh = 104, bx = w - mw - 15, by = 15;
      ctx.fillStyle = "rgba(14,19,24,.9)"; ctx.fillRect(bx, by, mw, mh);
      ctx.fillStyle = "#b99a6b"; ctx.fillRect(bx + 5, by + 5, mw - 10, mh - 10);
      ctx.fillStyle = "#555956";
      ROAD_Y.forEach((y) => ctx.fillRect(bx + 5, by + 5 + (y / WORLD.height) * (mh - 10), mw - 10, 5));
      ROAD_X.forEach((x) => ctx.fillRect(bx + 5 + (x / WORLD.width) * (mw - 10), by + 5, 5, mh - 10));
      ctx.fillStyle = "#ffdc62"; ctx.beginPath();
      ctx.arc(bx + 5 + (player.current.x / WORLD.width) * (mw - 10), by + 5 + (player.current.y / WORLD.height) * (mh - 10), 4, 0, Math.PI * 2); ctx.fill();
      if (paused) {
        ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff"; ctx.font = "bold 34px Arial"; ctx.textAlign = "center"; ctx.fillText("JOGO EM PAUSA", w / 2, h / 2); ctx.textAlign = "left";
      }
      frame++;
      if (frame % 45 === 0) {
        setPosition(player.current.y < 520 ? "Zona Norte" : player.current.y > 1000 ? "Rua das Acácias" : "Bairro da Paz");
        if (lastTrafficCount !== cars.current.length) { lastTrafficCount = cars.current.length; setTrafficCount(lastTrafficCount); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [paused, missionDone]);

  const hold = (key: string, value: boolean) => { keys.current[key] = value; };
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#263541 0%,#10151b 62%)", color: "#f7f4ed", fontFamily: "Inter,system-ui,sans-serif", padding: 18, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#e7b84b", fontSize: 11, letterSpacing: 3, fontWeight: 900 }}>ANGOLA • CIDADE ABERTA</div>
            <h1 style={{ margin: "4px 0", fontSize: "clamp(27px,4vw,42px)", letterSpacing: -1.5 }}>FAVELA <span style={{ color: "#e7b84b" }}>ANGOLANA</span></h1>
            <div style={{ color: "#aab5bf", fontSize: 13 }}>Capítulo 01 · Bairro da Paz · Protótipo 0.2</div>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ border: "1px solid #3c4b57", background: "#1b2730", borderRadius: 30, padding: "9px 13px", fontSize: 11, color: "#9bd5ae" }}>● EXPLORAÇÃO LIVRE</span>
            <button onClick={() => setPaused((v) => !v)} style={buttonStyle}>{paused ? "Continuar" : "Pausar"}</button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 270px", gap: 15 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ border: "1px solid #42515c", borderRadius: 16, overflow: "hidden", background: "#a98d68", boxShadow: "0 22px 65px #0009" }}>
              <canvas ref={canvasRef} width={1100} height={660} style={{ width: "100%", display: "block", aspectRatio: "5 / 3" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#9ba8b3", fontSize: 12, padding: "11px 4px" }}>
              <span>WASD / SETAS: mover · SHIFT: correr · E: interagir</span><span>ESC: pausa</span>
            </div>
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>ESTADO DO JOGADOR</div>
              <div style={{ fontSize: 20, fontWeight: 850, marginTop: 9 }}>Habitante</div>
              <div style={{ color: "#aab5bf", fontSize: 12, marginTop: 4 }}>📍 {position}</div>
              <div style={{ height: 7, background: "#303b45", borderRadius: 9, marginTop: 17 }}><div style={{ width: "100%", height: "100%", background: "#4da77a", borderRadius: 9 }} /></div>
              <div style={{ fontSize: 10, color: "#9ba6b2", marginTop: 7 }}>VIDA 100 / 100</div>
            </div>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>TRÂNSITO DA CIDADE</div>
              <div style={{ fontSize: 24, fontWeight: 850, marginTop: 8 }}>{trafficCount} <span style={{ fontSize: 12, color: "#aab5bf", fontWeight: 500 }}>veículos na estrada</span></div>
              <p style={{ color: "#aab5bf", fontSize: 12, lineHeight: 1.5, margin: "7px 0 0" }}>Carros circulam nas faixas e param quando há perigo de colisão.</p>
            </div>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>MISSÃO ATUAL</div>
              <h3 style={{ margin: "10px 0 7px", fontSize: 16 }}>Entrega no mercado</h3>
              <p style={{ color: "#aab5bf", fontSize: 12, lineHeight: 1.6, margin: 0 }}>Vai ao Mercado do Bairro. Aproxima-te do marcador amarelo e carrega em E.</p>
              <div style={{ marginTop: 13, color: missionDone ? "#65c58d" : "#e7b84b", fontSize: 11, fontWeight: 900 }}>{missionDone ? "✓ MISSÃO CONCLUÍDA" : "○ EM ANDAMENTO"}</div>
            </div>
            <div style={panelStyle}>
              <div style={eyebrowStyle}>RÁDIO DO BAIRRO</div>
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "#d4d9df", lineHeight: 1.6 }}>{message}</p>
            </div>
            <div style={{ ...panelStyle, background: "#202b34" }}>
              <div style={eyebrowStyle}>A CIDADE ESTÁ A CRESCER</div>
              <div style={{ fontSize: 11, color: "#aab5bf", lineHeight: 1.9, marginTop: 9 }}>✓ Mais edifícios e lojas<br />✓ Avenidas e passadeiras<br />✓ Carros com travagem<br />✓ Colisão com veículos e casas<br />◦ Multiplayer online: próxima fase</div>
            </div>
          </aside>
        </section>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
          {([["w", "▲"], ["a", "◀"], ["s", "▼"], ["d", "▶"]] as const).map(([key, label]) => (
            <button key={key} onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)} onPointerCancel={() => hold(key, false)} style={{ ...buttonStyle, width: 48, height: 42, touchAction: "none" }}>{label}</button>
          ))}
        </div>
        <footer style={{ color: "#66717d", textAlign: "center", fontSize: 10, marginTop: 20 }}>FAVELA ANGOLANA · DESENVOLVIMENTO 0.2 · CONSTRUINDO A CIDADE</footer>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = { background: "linear-gradient(145deg,#1d2932,#172129)", border: "1px solid #34434e", borderRadius: 13, padding: 16, boxShadow: "0 8px 24px #0002" };
const eyebrowStyle: React.CSSProperties = { color: "#e7b84b", fontSize: 10, fontWeight: 900, letterSpacing: 1.5 };
const buttonStyle: React.CSSProperties = { border: "1px solid #566571", background: "linear-gradient(180deg,#344451,#26323d)", color: "#f7f4ed", borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontWeight: 750 };
