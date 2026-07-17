"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/app/lib/ThemeContext";

type ReleasedFish = {
  _id: string;
  name: string;
  texture: ImageBitmap;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVx: number;
  targetVy: number;
  size: number;
  baseSize: number;
  weight: number;
  ate: number;
  tailPhase: number;
  turnTimer: number;
};

type Food = { x: number; y: number; vy: number; alpha: number; wobble: number };

function loadBitmap(url: string): Promise<ImageBitmap> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => resolve(await createImageBitmap(img));
    img.src = url;
  });
}

export default function FishTank() {
  const [mounted, setMounted] = useState(false);
  const { colors } = useTheme();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const c = mounted ? colors : {
    text: "#374151",
    textSec: "#6b7280",
    textMuted: "#9ca3af",
    border: "#d1d5db",
    card: "#ffffff",
    inputBg: "#ffffff",
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [fishList, setFishList] = useState<ReleasedFish[]>([]);
  const [name, setName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#f97316");
  const [brushSize, setBrushSize] = useState(6);
  const [showDrawer, setShowDrawer] = useState(false);
  const animRef = useRef<number>(0);
  const foodsRef = useRef<Food[]>([]);
  const fishListRef = useRef<ReleasedFish[]>([]);

  useEffect(() => { fishListRef.current = fishList; }, [fishList]);

  const displayFishData = fishList.map(f => ({
    _id: f._id,
    name: f.name,
    weight: Math.round(f.weight * 10) / 10,
    size: Math.round(f.size),
  }));

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/fish");
      const json = await res.json();
      if (json.code === 200) {
        const loaded: ReleasedFish[] = await Promise.all(
          json.data.map(async (f: { _id: string; name: string; drawing: string; weight: number; size: number; baseSize: number; ate: number }) => ({
            _id: f._id,
            name: f.name,
            texture: await loadBitmap(f.drawing),
            x: 80 + Math.random() * 540,
            y: 60 + Math.random() * 200,
            vx: 0, vy: 0,
            targetVx: (Math.random() - 0.5) * 1.2,
            targetVy: (Math.random() - 0.5) * 0.6,
            size: f.size,
            baseSize: f.baseSize,
            weight: f.weight,
            ate: f.ate,
            tailPhase: Math.random() * Math.PI * 2,
            turnTimer: 0,
          }))
        );
        setFishList(loaded);
      }
    })();
  }, []);

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [color, brushSize]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [isDrawing, color, brushSize]);

  const endDraw = useCallback(() => setIsDrawing(false), []);
  const clearDraw = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const releaseFish = useCallback(async () => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas || !name.trim()) return;

    const ctx = drawCanvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    if (!imageData.data.some((v) => v > 0)) return;

    const dataUrl = drawCanvas.toDataURL("image/png");

    const res = await fetch("/api/fish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), drawing: dataUrl }),
    });
    const json = await res.json();
    if (json.code !== 200) return;

    const f = json.data;
    const bitmap = await loadBitmap(f.drawing);
    const newFish: ReleasedFish = {
      _id: f._id,
      name: f.name,
      texture: bitmap,
      x: 80 + Math.random() * 540,
      y: 60 + Math.random() * 200,
      vx: 0, vy: 0,
      targetVx: (Math.random() - 0.5) * 1.2,
      targetVy: (Math.random() - 0.5) * 0.6,
      size: f.size,
      baseSize: f.baseSize,
      weight: f.weight,
      ate: f.ate,
      tailPhase: Math.random() * Math.PI * 2,
      turnTimer: 0,
    };

    setFishList(prev => [...prev, newFish]);
    setName("");
    clearDraw();
    setShowDrawer(false);
  }, [name, clearDraw]);

  const deleteFish = useCallback(async (id: string) => {
    await fetch(`/api/fish/${id}`, { method: "DELETE" });
    setFishList(prev => prev.filter(f => f._id !== id));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 700, H = 320;
    const MAX_FISH_SIZE = H * 0.3;

    const seaweeds = Array.from({ length: 12 }, (_, i) => ({
      x: 30 + i * 58 + Math.random() * 20, h: 40 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2, color: i % 2 === 0 ? "#34d399" : "#6ee7b7",
    }));
    const rocks = Array.from({ length: 8 }, () => ({
      x: Math.random() * W, y: H - 15 - Math.random() * 10,
      r: 8 + Math.random() * 18, color: `hsl(30, 10%, ${40 + Math.random() * 30}%)`,
    }));
    const sands = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: H - 5 - Math.random() * 12, r: 0.5 + Math.random() * 1.5,
    }));

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      for (let i = 0; i < 6; i++) {
        foodsRef.current.push({
          x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20,
          vy: 0.15 + Math.random() * 0.25, alpha: 1, wobble: Math.random() * Math.PI * 2,
        });
      }
    };
    canvas.addEventListener("click", handleClick);

    const loop = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#e0f2fe");
      grad.addColorStop(0.4, "#bae6fd");
      grad.addColorStop(0.8, "#7dd3fc");
      grad.addColorStop(1, "#38bdf8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < 8; i++) {
        const bx = 30 + Math.sin(time / 3000 + i * 3.7) * 25 + i * 35;
        const by = ((time / 3500 + i * 6.3) % (H + 20)) - 10;
        const br = 2 + Math.sin(time / 2000 + i * 2.1) * 1;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      }
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const x = 50 + i * 150 + Math.sin(time / 6000 + i) * 30;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 20 + Math.sin(time / 3000 + i) * 10, H);
        ctx.lineTo(x - 10 + Math.sin(time / 4000 + i) * 8, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.sin(time / 5000 + i) * 0.015})`;
        ctx.fill();
      }
      ctx.restore();
      for (const sw of seaweeds) {
        const sway = Math.sin(time / 2000 + sw.phase) * 6;
        ctx.beginPath();
        ctx.moveTo(sw.x, H - 5);
        ctx.quadraticCurveTo(sw.x + sway, H - sw.h * 0.5, sw.x + sway * 1.5, H - sw.h);
        ctx.strokeStyle = sw.color; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
      }
      for (const r of rocks) {
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = r.color; ctx.fill();
      }
      for (const s of sands) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,140,100,${0.3 + Math.random() * 0.1})`; ctx.fill();
      }
      const currentFish = fishListRef.current;
      for (const f of currentFish) {
        f.turnTimer--;
        if (f.turnTimer <= 0) {
          f.targetVx = (Math.random() - 0.5) * 1.6;
          f.targetVy = (Math.random() - 0.5) * 0.8;
          if (Math.random() < 0.15) { f.targetVx *= 0.1; f.targetVy *= 0.1; }
          f.turnTimer = 80 + Math.random() * 160;
        }
        let nearestDist = Infinity;
        for (const fd of foodsRef.current) {
          const d = Math.hypot(fd.x - f.x, fd.y - f.y);
          if (d < nearestDist) nearestDist = d;
        }
        if (nearestDist < 250) {
          const nearest = foodsRef.current.reduce((a, b) =>
            Math.hypot(a.x - f.x, a.y - f.y) < Math.hypot(b.x - f.x, b.y - f.y) ? a : b
          );
          const dx = nearest.x - f.x, dy = nearest.y - f.y;
          f.targetVx = dx * 0.008; f.targetVy = dy * 0.008;
          const spd = Math.hypot(f.targetVx, f.targetVy);
          if (spd > 1.2) { f.targetVx *= 1.2 / spd; f.targetVy *= 1.2 / spd; }
        }
        f.vx += (f.targetVx - f.vx) * 0.02;
        f.vy += (f.targetVy - f.vy) * 0.02;
        f.x += f.vx; f.y += f.vy;
        f.tailPhase += 0.06 * (0.6 + Math.hypot(f.vx, f.vy) * 0.4);
        const margin = 50;
        if (f.x < margin) f.targetVx += 0.03;
        if (f.x > W - margin) f.targetVx -= 0.03;
        if (f.y < margin) f.targetVy += 0.02;
        if (f.y > H - margin) f.targetVy -= 0.02;
        f.x = Math.max(20, Math.min(W - 20, f.x));
        f.y = Math.max(20, Math.min(H - 20, f.y));
        const angle = Math.atan2(f.vy, f.vx);
        const s = f.size;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(angle);
        ctx.scale(f.vx < 0 ? -1 : 1, 1);
        ctx.rotate(Math.sin(f.tailPhase) * 0.04);
        ctx.drawImage(f.texture, -s * 0.5, -s * 0.5, s, s);
        ctx.restore();
      }
      const foods = foodsRef.current;
      let ate = false;
      for (let i = foods.length - 1; i >= 0; i--) {
        const fd = foods[i];
        fd.wobble += 0.03;
        fd.x += Math.sin(fd.wobble) * 0.3;
        fd.y += fd.vy;
        fd.alpha -= 0.003;
        if (fd.alpha <= 0 || fd.y > H - 10) { foods.splice(i, 1); continue; }
        for (const f of currentFish) {
          if (Math.hypot(f.x - fd.x, f.y - fd.y) < f.size * 0.45) {
            foods.splice(i, 1);
            f.ate++;
            f.weight = 10 + f.ate * 1.5;
            f.size = f.baseSize + Math.min(f.ate * 0.8, MAX_FISH_SIZE - f.baseSize);
            ate = true;
            break;
          }
        }
        ctx.beginPath(); ctx.arc(fd.x, fd.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${fd.alpha})`; ctx.fill();
        ctx.beginPath(); ctx.arc(fd.x, fd.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${fd.alpha * 0.15})`; ctx.fill();
      }
      if (ate) setFishList(prev => [...prev]);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0, color: c.text }}>🐟 摸鱼</h2>
        <button
          onClick={() => setShowDrawer(true)}
          disabled={fishList.length >= 3}
          style={{
            padding: "8px 20px", fontSize: 14,
            background: fishList.length >= 3 ? c.border : "#2563eb",
            color: "#fff", border: "none", borderRadius: 6,
            cursor: fishList.length >= 3 ? "not-allowed" : "pointer",
          }}
        >
          投放鱼 {fishList.length}/3
        </button>
      </div>

      {showDrawer && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setShowDrawer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.card, borderRadius: 12, padding: 24, width: 440,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: c.text }}>绘制你的鱼</h3>
            <canvas
              ref={drawCanvasRef}
              width={400}
              height={260}
              style={{
                width: "100%", height: 260, borderRadius: 8,
                background: "#fffbe6", cursor: "crosshair",
                border: `1px solid ${c.border}`,
              }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
            />
            <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 12, color: c.textSec }}>颜色</label>
                <input type="color" value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 36, height: 28, padding: 0, border: "none", cursor: "pointer", display: "block" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: c.textSec }}>大小: {brushSize}px</label>
                <input type="range" min={2} max={20} value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={{ width: 100, display: "block" }}
                />
              </div>
              <button onClick={clearDraw} style={{
                padding: "4px 14px", fontSize: 13, background: c.border,
                border: `1px solid ${c.border}`, borderRadius: 4, cursor: "pointer", color: c.text,
              }}>清空</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <input placeholder="给鱼取个名字..." value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 14, background: c.inputBg, color: c.text }}
              />
              <button onClick={releaseFish} style={{
                padding: "8px 24px", background: "#2563eb", color: "#fff",
                border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer",
              }}>投放</button>
            </div>
            <p style={{ fontSize: 12, color: c.textMuted, margin: "8px 0 0" }}>鼠标绘制，命名后投放鱼缸</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <canvas
          ref={canvasRef}
          width={700}
          height={320}
          style={{
            width: "100%", maxWidth: 700, height: 320, flex: 1,
            borderRadius: 12, cursor: "pointer", display: "block",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        />
        <div style={{
          background: c.card, borderRadius: 10, padding: 16, minWidth: 180,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ fontSize: 14, margin: "0 0 12px", color: c.text }}>鱼的数据</h3>
          {displayFishData.length === 0 ? (
            <p style={{ fontSize: 13, color: c.textMuted }}>鱼缸是空的</p>
          ) : (
            displayFishData.map((f) => (
              <div key={f._id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10, paddingBottom: 10,
                borderBottom: `1px solid ${c.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: c.textSec, marginTop: 2 }}>
                    体重: {f.weight}g
                  </div>
                </div>
                <button
                  onClick={() => deleteFish(f._id)}
                  style={{
                    padding: "4px 10px", fontSize: 12,
                    background: "#fee2e2", color: "#dc2626",
                    border: "none", borderRadius: 4, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}>
        点击鱼缸喂食
      </p>
    </div>
  );
}