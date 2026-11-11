import { useStore } from "./store.jsx";
import { posterStyle } from "./utils.js";

export function Card({ video, onOpen }) {
  const { state } = useStore();
  return (
    <div className="card" role="button" tabIndex={0} onClick={() => onOpen(video.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(video.id); } }}>
      <div className="poster" style={posterStyle(video, state.saver)} aria-label={video.title} />
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
