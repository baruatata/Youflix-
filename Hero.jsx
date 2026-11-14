import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";

// Hero hutumia matangazo yaliyopakiwa kutoka Supabase.
// Picha ikikataa kupakia hata baada ya fallback, slide hiyo inaondolewa
// kwenye mzunguko ili isiache nafasi nyeusi kwa mtazamaji.
export default function Hero() {
  const { promos } = useStore();
  const [failedIds, setFailedIds] = useState([]);
  const [i, setI] = useState(0);
  const x0 = useRef(null);

  useEffect(() => {
    setFailedIds([]);
    setI(0);
  }, [promos]);

  const visiblePromos = promos.filter(
    (p) => p?.img && !failedIds.includes(String(p.id ?? p.img))
  );
  const n = visiblePromos.length;

  useEffect(() => {
    if (n < 2) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) setI((k) => (k + 1) % n);
    }, 4500);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    setI((k) => (n ? k % n : 0));
  }, [n]);

  useEffect(() => {
    const first = visiblePromos[0]?.img;
    if (!first) return undefined;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = first;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => link.remove();
  }, [promos, failedIds]);

  const cur = n ? i % n : 0;
  const onEnd = (e) => {
    if (n < 2 || x0.current == null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    x0.current = null;
    if (Math.abs(dx) > 40) {
      setI((k) => (k + (dx < 0 ? 1 : -1) + n) % n);
    }
  };

  const failImage = (p, e) => {
    const image = e.currentTarget;
    const fallback = image.dataset.fallback;
    if (fallback && !image.dataset.fallbackTried) {
      image.dataset.fallbackTried = "1";
      image.src = fallback;
      return;
    }
    setFailedIds((ids) => {
      const id = String(p.id ?? p.img);
      return ids.includes(id) ? ids : [...ids, id];
    });
  };

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={onEnd}
    >
      {n ? visiblePromos.map((p, k) => (
        <div
          key={p.id ?? p.img}
          className={"slide promo" + (k === cur ? " on" : "")}
          aria-hidden={k !== cur}
        >
          <img
            className="hero-image"
            src={p.img}
            alt={p.alt || ""}
            data-fallback={p.fallbackImg || ""}
            onError={(e) => failImage(p, e)}
            loading={k === 0 ? "eager" : "lazy"}
            fetchPriority={k === cur ? "high" : "auto"}
            decoding="async"
          />
        </div>
      )) : <div className="slide promo on" aria-hidden="true" />}
      {n > 1 && (
        <div className="dots">
          {visiblePromos.map((p, k) => (
            <b key={p.id ?? p.img} className={k === cur ? "on" : ""} />
          ))}
        </div>
      )}
    </section>
  );
}
