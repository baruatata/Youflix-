import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";

// Hero: mabango na matangazo tu (picha). Haichezi video na haigusiki.
export default function Hero() {
  const { promos, state } = useStore();
  const n = promos.length;
  const [i, setI] = useState(0);
  const x0 = useRef(null);

  useEffect(() => {
    if (n < 2 || state.saver) return undefined;
    const id = setInterval(() => { if (!document.hidden) setI((k) => (k + 1) % n); }, 4500);
    return () => clearInterval(id);
  }, [n, state.saver]);

  if (!n || state.saver) return null; // Hifadhi Data: bila picha nzito
  const cur = i % n;

  const onEnd = (e) => {
    if (x0.current == null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    x0.current = null;
    if (Math.abs(dx) > 40) setI((k) => (k + (dx < 0 ? 1 : -1) + n) % n); // telezesha kubadili picha
  };

  return (
    <section className="hero" aria-roledescription="carousel"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }} onTouchEnd={onEnd}>
      {promos.map((p, k) => (
        <div key={p.id} className={"slide promo" + (k === cur ? " on" : "")} role="img" aria-label={p.alt || ""}
          style={{ backgroundImage: `url(${JSON.stringify(p.img)})` }} />
      ))}
      {n > 1 && (
        <div className="dots">
          {promos.map((p, k) => <b key={p.id} className={k === cur ? "on" : ""} />)}
        </div>
      )}
    </section>
  );
}
