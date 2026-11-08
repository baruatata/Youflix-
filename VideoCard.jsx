import { useStore } from "./store.jsx";
import { posterStyle } from "./utils.js";

export function Card({ video, onOpen }) {
  const { state, t } = useStore();
  const pct = state.progress[video.id] && state.progress[video.id].p;
  return (
    <div className="card" role="button" tabIndex={0} onClick={() => onOpen(video.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(video.id); } }}>
      <div className="poster" style={posterStyle(video, state.saver)}>{video.title}</div>
      {video.type === "series" && <span className="badge">{t("badge_series")}</span>}
      {pct ? <span className="tag">{Math.round(pct)}%</span> : null}
      <small>{video.genre || ""}{video.year ? " • " + video.year : ""}</small>
    </div>
  );
}

export function Rail({ title, items, onOpen }) {
  if (!items.length) return null;
  return (
    <>
      <h2 className="sec">{title}</h2>
      <div className="rail">{items.map((v) => <Card key={v.id} video={v} onOpen={onOpen} />)}</div>
    </>
  );
}

export function Grid({ items, emptyMsg, onOpen }) {
  if (!items.length) return <p className="empty">{emptyMsg}</p>;
  return <div className="grid">{items.map((v) => <Card key={v.id} video={v} onOpen={onOpen} />)}</div>;
}
