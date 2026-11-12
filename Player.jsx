import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";
import { ytId } from "./utils.js";
import { supabase } from "./supabase.js";

export default function Player({ video, onClose }) {
  const { state, update, t, notify } = useStore();
  const [started, setStarted] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [muxPlaybackUrl, setMuxPlaybackUrl] = useState("");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const el = useRef(null);
  const last = useRef(0);
  const yt = ytId(videoSrc);
  const [muxEmbedUrl, setMuxEmbedUrl] = useState("");
  const startsAt = state.subscription?.starts_at ? new Date(state.subscription.starts_at).getTime() : 0;
  const endsAt = state.subscription?.ends_at ? new Date(state.subscription.ends_at).getTime() : 0;
  const activePackage = !!state.me && state.subscription?.status === "active" &&
    Number.isFinite(startsAt) && startsAt <= clock &&
    Number.isFinite(endsAt) && endsAt > clock;

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activePackage || !started) return;
    setStarted(false);
    setVideoSrc("");
    setMuxPlaybackUrl("");
    setMuxEmbedUrl("");
    setLocked(true);
    if (el.current) { el.current.pause(); el.current.removeAttribute("src"); el.current.load(); }
    notify("Muda wa kifurushi chako umeisha. Tafadhali jiunge upya ili kuendelea kutazama.");
  }, [activePackage, started, notify]);

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
    setLocked(false);
    setMuxPlaybackUrl("");
    setMuxEmbedUrl("");
    try {
      const { data, error } = await supabase.from("media").select("video_url").eq("id", video.id).single();
      if (error) throw error;
      const stored = String(data?.video_url || "").trim();
      if (!stored) throw new Error("Video haijapatikana.");

      let muxUrl = "";
      let embedUrl = "";
      const iframeSrc = stored.match(/<iframe[^>]*src=["']([^"']+)["']/i)?.[1];
      if (iframeSrc) {
        const parsedEmbed = new URL(iframeSrc);
        if (parsedEmbed.protocol === "https:" && parsedEmbed.hostname === "player.mux.com") embedUrl = parsedEmbed.href;
      } else if (/^https:\/\/player\.mux\.com\//i.test(stored)) {
        embedUrl = stored;
      }
      if (embedUrl) {
        setMuxEmbedUrl(embedUrl);
      } else if (stored.startsWith("http://") || stored.startsWith("https://")) {
        try {
          const parsed = new URL(stored);
          if (parsed.hostname === "stream.mux.com") {
            muxUrl = `https://stream.mux.com${parsed.pathname.replace(/\\.m3u8$/i, "")}.m3u8`;
          }
        } catch {}
      } else if (!ytId(stored)) {
        muxUrl = `https://stream.mux.com/${encodeURIComponent(stored)}.m3u8`;
      }

      if (muxUrl) {
        setMuxPlaybackUrl(muxUrl);
      } else {
        setVideoSrc(stored);
      }
      setStarted(true);
    } catch (err) {
      setLocked(true);
      notify(err?.message || "Unahitaji kifurushi kilichothibitishwa ili kutazama video.");
    } finally { setLoading(false); }
  };

  let stage;
  if (locked || !activePackage) stage = <div className="empty"><p>{state.subscription?.ends_at && new Date(state.subscription.ends_at).getTime() <= clock
    ? "Kifurushi chako kimeisha. Jiunge upya ili kuendelea kutazama video."
    : "Video hii inahitaji kifurushi hai kilicholipiwa na kuthibitishwa na Admin."}</p><button className="btn" onClick={() => { onClose(); location.hash = "#join"; }}>Jiunge na kifurushi</button></div>;
  else if (!started) stage = <button className="big" aria-label={t("play")} disabled={loading} onClick={beginPlayback}>{loading ? "..." : "▶"}</button>;
  else if (yt) stage = <iframe title={video.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} />;
  else if (muxEmbedUrl) stage = <iframe title={video.title} src={muxEmbedUrl} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />;
  else if (muxPlaybackUrl) stage = <video ref={(v) => { if (v) el.current = v; }} src={muxPlaybackUrl} controls autoPlay playsInline preload="none" onLoadedMetadata={onMeta} onTimeUpdate={onTime} onError={() => notify(t("videoerr"))} />
  else stage = <video ref={(v) => { if (v) el.current = v; }} src={videoSrc} controls autoPlay playsInline preload="none" onLoadedMetadata={onMeta} onTimeUpdate={onTime} onError={() => notify(t("videoerr"))} />;

  return <div id="player" className="player"><div className="player-box">
    <button className="close" aria-label={t("close")} onClick={onClose}>✕</button>
    <div className="stage">{stage}</div>
    <div className="player-info"><h2>{video.title}</h2><p className="meta">{meta}</p><p>{video.desc || ""}</p></div>
  </div></div>;
}
