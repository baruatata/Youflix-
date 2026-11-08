import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";
import { ytId } from "./utils.js";

export default function Player({ video, onClose }) {
  const { state, update, t, notify } = useStore();
  const [started, setStarted] = useState(false);
  const el = useRef(null);
  const last = useRef(0);
  const inList = state.list.includes(video.id);
  const yt = ytId(video.src);

  // Funga video vizuri tunapotoka (acha kupakia data)
  useEffect(() => () => {
    const v = el.current;
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
  }, []);

  const onMeta = (e) => {
    const p = state.progress[video.id];
    if (p && p.t && p.p < 95) e.currentTarget.currentTime = p.t; // endelea ulipoachia
  };
  const onTime = (e) => {
    const v = e.currentTarget;
    if (!v.duration) return;
    const now = Date.now();
    if (now - last.current < 3000) return;
    last.current = now;
    update((s) => ({ progress: { ...s.progress, [video.id]: { t: v.currentTime, p: (v.currentTime / v.duration) * 100 } } }));
  };
  const toggleList = () =>
    update((s) => ({ list: s.list.includes(video.id) ? s.list.filter((i) => i !== video.id) : [...s.list, video.id] }));
  const share = () => {
    const url = location.href.split("#")[0];
    if (navigator.share) navigator.share({ title: video.title + " — Youflix", url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => notify("✓"));
  };

  const meta = [video.type === "series" ? t("k_series") : t("k_movie"), video.genre, video.year, video.dur].filter(Boolean).join(" • ");

  let stage;
  if (!video.src) stage = <p className="empty">{t("novideo")}</p>;
  else if (!started) // video haipakiwi mpaka mtumiaji agusa — inaokoa data
    stage = <button className="big" aria-label={t("play")} onClick={() => setStarted(true)}>▶</button>;
  else if (yt)
    stage = <iframe title={video.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen
      src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} />;
  else
    stage = <video ref={(v) => { if (v) el.current = v; }} src={video.src} controls autoPlay playsInline preload="none"
      onLoadedMetadata={onMeta} onTimeUpdate={onTime} onError={() => notify(t("videoerr"))} />;

  return (
    <div id="player" className="player">
      <div className="player-box">
        <button className="close" aria-label={t("close")} onClick={onClose}>✕</button>
        <div className="stage">{stage}</div>
        <div className="player-info">
          <h2>{video.title}</h2>
          <p className="meta">{meta}</p>
          <p>{video.desc || ""}</p>
          <div className="row-btns">
            <button className="btn ghost" onClick={toggleList}>{inList ? t("in_list") : t("add_list")}</button>
            <button className="btn ghost" onClick={share}>{t("share")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
