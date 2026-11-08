import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";
import { ytId } from "./utils.js";
import { supabase } from "./supabase.js";

export default function Player({ video, onClose }) {
  const { state, update, t, notify } = useStore();
  const [started, setStarted] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const el = useRef(null);
  const last = useRef(0);
  const yt = ytId(videoSrc);
  const activePackage = !!state.me && state.subscription?.status === "active" && new Date(state.subscription.starts_at).getTime() <= Date.now() && new Date(state.subscription.ends_at).getTime() > Date.now();
  const streamId = !yt && /^[a-zA-Z0-9_-]{30,80}$/.test(String(videoSrc || "").trim())
    ? String(videoSrc).trim() : null;

  useEffect(() => () => {
    const v = el.current;
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
  }, []);

  const onMeta = (e) => {
    const p = state.progress[video.id];
    if (p && p.t && p.p < 95) e.currentTarget.currentTime = p.t;
  };
  const onTime = (e) => {
    const v = e.currentTarget;
    if (!v.duration) return;
    const now = Date.now();
    if (now - last.current < 3000) return;
    last.current = now;
    update((s) => ({ progress: { ...s.progress, [video.id]: { t: v.currentTime, p: (v.currentTime / v.duration) * 100 } } }));
  };

  const meta = [video.genre, video.year, video.dur].filter(Boolean).join(" • ");
  const beginPlayback = async () => {
    if (!activePackage) { setLocked(true); return; }
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("media").select("video_url").eq("id", video.id).single();
      if (error) throw error;
      const stored = String(data?.video_url || "").trim();
      if (!stored) throw new Error("Video haijapatikana.");

      // Mux Signed Playback IDs hazina URL ya moja kwa moja; token hutolewa server-side.
      if (!/^https?:\/\//i.test(stored) && !ytId(stored)) {
        const { data: signed, error: tokenError } = await supabase.functions.invoke("mux-admin", {
          body: { action: "get-playback-token", playback_id: stored },
        });
        if (tokenError) throw new Error(signed?.error || tokenError.message || "Imeshindikana kupata ruhusa ya video.");
        if (!signed?.playback_token) throw new Error(signed?.error || "Mux haijatoa token ya video.");
        setVideoSrc("https://stream.mux.com/" + encodeURIComponent(stored) + ".m3u8?token=" + encodeURIComponent(signed.playback_token));
      } else {
        // Viungo vya zamani vya public vinaendelea kufanya kazi wakati wa uhamishaji.
        setVideoSrc(stored);
      }
      setStarted(true);
    } catch (err) {
      setLocked(true);
      notify(err?.message || "Unahitaji kifurushi kilichothibitishwa ili kutazama video.");
    } finally { setLoading(false); }
  };
  let stage;
  if (locked || !activePackage) stage = <div className="empty"><p>Video hii inahitaji kifurushi hai kilicholipiwa na kuthibitishwa na Admin.</p><button className="btn" onClick={() => { onClose(); location.hash = "#join"; }}>Jiunge na kifurushi</button></div>;
  else if (!started) stage = <button className="big" aria-label={t("play")} disabled={loading} onClick={beginPlayback}>{loading ? "..." : "▶"}</button>;
  else if (yt) stage = <iframe title={video.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} />;
  else if (streamId) stage = <video ref={(v) => { if (v) el.current = v; }} src={videoSrc} controls autoPlay playsInline preload="none" onLoadedMetadata={onMeta} onTimeUpdate={onTime} onError={() => notify(t("videoerr"))} />;
  else stage = <video ref={(v) => { if (v) el.current = v; }} src={videoSrc} controls autoPlay playsInline preload="none" onLoadedMetadata={onMeta} onTimeUpdate={onTime} onError={() => notify(t("videoerr"))} />;

  return <div id="player" className="player"><div className="player-box">
    <button className="close" aria-label={t("close")} onClick={onClose}>✕</button>
    <div className="stage">{stage}</div>
    <div className="player-info"><h2>{video.title}</h2><p className="meta">{meta}</p><p>{video.desc || ""}</p></div>
  </div></div>;
}
