import { useEffect, useRef, useState } from "react";
import { useStore } from "./store.jsx";
import { ytId } from "./utils.js";
import MuxPlayer from "@mux/mux-player-react";
import { supabase } from "./supabase.js";

export default function Player({ video, onClose }) {
  const { state, update, t, notify } = useStore();
  const [started, setStarted] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [muxPlaybackId, setMuxPlaybackId] = useState("");
  const [muxPlaybackToken, setMuxPlaybackToken] = useState("");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const el = useRef(null);
  const last = useRef(0);
  const watchSessionId = useRef(null);
  const watchLastSent = useRef(0);
  const watchPosition = useRef(0);
  const watchPlaying = useRef(false);
  const viewRecorded = useRef(false);
  const recordVideoView = async () => {
    if (viewRecorded.current || !state.me || !activePackage || !watchSessionId.current || !supabase) return;
    viewRecorded.current = true;
    try {
      const { error } = await supabase.rpc('record_video_view', { p_session_id: watchSessionId.current, p_media_id: video.id });
      if (error) viewRecorded.current = false;
    } catch { viewRecorded.current = false; }
  };
  const yt = ytId(videoSrc);

  if (!watchSessionId.current && typeof crypto !== "undefined" && crypto.randomUUID) {
    watchSessionId.current = crypto.randomUUID();
  }

  const sendWatchHeartbeat = async (position, isPlaying, force = false) => {
    watchPosition.current = Number.isFinite(Number(position)) ? Math.max(0, Number(position)) : watchPosition.current;
    watchPlaying.current = !!isPlaying;
    if (!video.remote || !state.me || !activePackage || !watchSessionId.current || !supabase) return;
    const now = Date.now();
    if (!force && isPlaying && now - watchLastSent.current < 10000) return;
    watchLastSent.current = now;
    try {
      await supabase.functions.invoke("creator-watch-heartbeat", {
        body: {
          session_id: watchSessionId.current,
          media_id: video.id,
          position_seconds: watchPosition.current,
          is_playing: !!isPlaying,
        },
      });
    } catch {
      // Takwimu zikishindikana kutumwa, uchezaji wa mteja hauzuiwi.
    }
  };

  const playbackStarted = (event) => {
    recordVideoView();
    const current = event?.currentTarget?.currentTime ?? event?.target?.currentTime ?? el.current?.currentTime ?? watchPosition.current;
    sendWatchHeartbeat(current, true, true);
  };
  const playbackPaused = (event) => {
    const current = event?.currentTarget?.currentTime ?? event?.target?.currentTime ?? watchPosition.current;
    sendWatchHeartbeat(current, false, true);
  };
  const playbackProgress = (event) => {
    const current = event?.currentTarget?.currentTime ?? event?.target?.currentTime ?? el.current?.currentTime;
    if (Number.isFinite(Number(current)) && watchPlaying.current) sendWatchHeartbeat(current, true);
  };
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
    setMuxPlaybackId("");
    setMuxPlaybackToken("");
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

  useEffect(() => () => {
    if (watchPlaying.current) {
      const position = watchPosition.current;
      if (video.remote && state.me && activePackage && watchSessionId.current && supabase) {
        supabase.functions.invoke("creator-watch-heartbeat", {
          body: {
            session_id: watchSessionId.current,
            media_id: video.id,
            position_seconds: position,
            is_playing: false,
          },
        }).catch(() => {});
      }
    }
  }, [state.me, activePackage, video.remote, video.id]);

  const meta = [video.genre, video.year, video.dur].filter(Boolean).join(" • ");
  const beginPlayback = async () => {
    if (!activePackage) { setLocked(true); return; }
    if (loading) return;
    setLoading(true);
    setLocked(false);
    setMuxPlaybackId("");
    setMuxPlaybackToken("");
    try {
      const { data, error } = await supabase.from("media").select("video_url").eq("id", video.id).single();
      if (error) throw error;
      const stored = String(data?.video_url || "").trim();
      if (!stored) throw new Error("Video haijapatikana.");

      if (stored.startsWith("storage://")) {
        const { data: storageData, error: storageError } = await supabase.functions.invoke("mux-admin", {
          body: { action: "get-storage-playback-url", media_id: video.id },
        });
        if (storageError) throw storageError;
        if (storageData?.error) throw new Error(storageData.error);
        if (!storageData?.signed_url) throw new Error("Kiungo salama cha video hakijapatikana.");
        setVideoSrc(storageData.signed_url);
        setStarted(true);
        return;
      }

      let playbackId = "";
      const iframeSrc = stored.match(/<iframe[^>]*src=["']([^"']+)["']/i)?.[1];
      const candidate = iframeSrc || stored;
      try {
        if (/^https:\/\/player\.mux\.com\//i.test(candidate)) {
          const parsed = new URL(candidate);
          if (parsed.protocol === "https:" && parsed.hostname === "player.mux.com") {
            playbackId = decodeURIComponent(parsed.pathname.split("/").filter(Boolean)[0] || "");
          }
        } else if (/^https:\/\/stream\.mux\.com\//i.test(candidate)) {
          const parsed = new URL(candidate);
          if (parsed.protocol === "https:" && parsed.hostname === "stream.mux.com") {
            playbackId = decodeURIComponent(parsed.pathname.split("/").filter(Boolean)[0] || "").replace(/\.m3u8$/i, "");
          }
        } else if (!/^https?:\/\//i.test(candidate) && !ytId(candidate)) {
          playbackId = candidate;
        }
      } catch {}

      if (playbackId) {
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke("mux-admin", {
          body: { action: "get-playback-token", playback_id: playbackId },
        });
        if (tokenError) throw tokenError;
        if (tokenData?.error) throw new Error(tokenData.error);
        if (tokenData?.playback_id !== playbackId) throw new Error("Mux haijathibitisha ruhusa ya video hii.");
        setMuxPlaybackId(playbackId);
        setMuxPlaybackToken(tokenData.playback_token || "");
        setVideoSrc("");
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
  else if (yt) stage = <iframe title={video.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen onLoad={recordVideoView} src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} />;
  else if (muxPlaybackId) stage = <MuxPlayer ref={el} playbackId={muxPlaybackId} tokens={muxPlaybackToken ? { playback: muxPlaybackToken } : undefined} streamType="on-demand" autoPlay onPlay={playbackStarted} onPause={playbackPaused} onTimeUpdate={playbackProgress} onEnded={playbackPaused} style={{ width: "100%", height: "100%" }} />
  else stage = <video ref={(v) => { if (v) el.current = v; }} src={videoSrc} controls autoPlay playsInline preload="none" onLoadedMetadata={onMeta} onPlay={playbackStarted} onPause={playbackPaused} onTimeUpdate={(e) => { onTime(e); playbackProgress(e); }} onEnded={playbackPaused} onError={() => notify(t("videoerr"))} />;

  return <div id="player" className="player"><div className="player-box">
    <button className="close" aria-label={t("close")} onClick={onClose}>✕</button>
    <div className="stage">{stage}</div>
    <div className="player-info"><h2>{video.title}</h2><p className="meta">{meta}</p><p>{video.desc || ""}</p></div>
  </div></div>;
}
