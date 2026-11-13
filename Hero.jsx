import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";

// Hero hutumia URL za kudumu za Supabase Storage; haitegemei cache ya simu.
export default function Hero() {
  const { promos } = useStore();
  const n = promos.length;
  const [i, setI] = useState(0);
  const x0 = useRef(null);

  useEffect(() => {
    if (n < 2) return undefined;
    const id = setInterval(() => { if (!document.hidden) setI((k) => (k + 1) % n); }, 4500);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    setI((k) => (n ? k % n : 0));
  }, [n]);

  useEffect(() => {
    const first = promos[0]?.img;
    if (!first) return undefined;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = first;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => link.remove();
  }, [promos]);

  const cur = n ? i % n : 0;
  const onEnd = (e) => {
    if (n < 2 || x0.current == null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    x0.current = null;
    if (Math.abs(dx) > 40) setI((k) => (k + (dx < 0 ? 1 : -1) + n) % n);
  };

  return (
    <section className="hero" aria-roledescription="carousel"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }} onTouchEnd={onEnd}>
      {n ? promos.map((p, k) => (
        <div key={p.id} className={"slide promo" + (k === cur ? " on" : "")}>
          {p.img && <img className="hero-image" src={p.img} alt={p.alt || ""}
            data-fallback={p.fallbackImg || ""}
            onError={(e) => {
              const fallback = e.currentTarget.dataset.fallback;
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
                e.currentTarget.dataset.fallback = "";
              } else {
                e.currentTarget.style.visibility = "hidden";
              }
            }}
            loading={k === 0 ? "eager" : "lazy"}
            fetchPriority={k === cur ? "high" : "auto"} decoding="async" />}
        </div>
      )) : <div className="slide promo on" aria-hidden="true" />}
      {n > 1 && <div className="dots">{promos.map((p, k) => <b key={p.id} className={k === cur ? "on" : ""} />)}</div>}
    </section>
  );
}
