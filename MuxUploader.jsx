import { useState } from "react";
import { supabase } from "./supabase.js";

const GENRES = ["Tamthilia", "Filamu", "Hadithi", "Vichekesho"];

export default function MuxUploader({ notify, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [genre, setGenre] = useState("Tamthilia");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState("");

  const api = async (action, extra = {}) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) throw new Error("Tafadhali ingia tena kama Admin.");
    const response = await fetch("/api/mux-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Hitilafu ya Mux.");
    return result;
  };

  const upload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.video.files?.[0];
    if (!file) return notify("Chagua video kutoka kwenye simu yako.");
    if (!title.trim()) return notify("Weka jina la video.");
    if (!supabase) return notify("Supabase haijaunganishwa.");
    if (busy) return;
    setBusy(true); setProgress(0); setStatus("Inaandaa sehemu salama ya kupakia...");
    try {
      const created = await api("create");
      setStatus("Inatuma video kwenda Mux...");
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", created.uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Mux imekataa video. Jaribu tena."));
        xhr.onerror = () => reject(new Error("Mtandao umekatika wakati wa kupakia video."));
        xhr.onabort = () => reject(new Error("Upload imesitishwa."));
        xhr.send(file);
      });

      let result = null;
      for (let attempt = 0; attempt < 120; attempt++) {
        setStatus("Mux inachakata video... (" + (attempt + 1) + ")");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        result = await api("status", { uploadId: created.uploadId });
        if (result.ready) break;
        if (result.status === "errored" || result.status === "cancelled") throw new Error("Mux imeshindwa kuchakata video hii.");
      }
      if (!result?.ready || !result.playbackUrl) throw new Error("Video bado inachakatwa. Jaribu tena baada ya dakika chache; upload imetumwa Mux.");
      const { error } = await supabase.from("media").insert({
        title: title.trim(),
        video_url: result.playbackUrl,
        category: type === "series" ? "Mfululizo" : "Filamu",
        genre,
        release_year: Number(year) || new Date().getFullYear(),
        duration: result.duration ? Math.round(result.duration / 60) + " min" : "",
        description: description.trim(),
        published: true,
      });
      if (error) throw error;
      setStatus("Video imehifadhiwa na iko tayari kutazamwa.");
      notify("Video imepakiwa Mux na kuhifadhiwa Youflix.");
      setTitle(""); setDescription(""); setProgress(0);
      form.reset();
      onSaved?.();
    } catch (error) {
      notify(error?.message || "Imeshindikana kupakia video.");
      setStatus(error?.message || "Upload imeshindikana.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="form" style={{ marginBottom: 22, padding: 14, border: "1px solid rgba(255,255,255,.14)", borderRadius: 12 }}>
      <h2 className="sec">Pakia video kutoka simu (Mux)</h2>
      <p className="help">Chagua video kwenye iPhone yako. Video itatumwa moja kwa moja Mux bila kupitia hifadhi ya simu ya Youflix.</p>
      <form onSubmit={upload}>
        <label>Jina la video<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} /></label>
        <label>Muundo wa video<select value={type} onChange={(e) => setType(e.target.value)}><option value="movie">Filamu</option><option value="series">Mfululizo</option></select></label>
        <label>Aina ya video<select value={genre} onChange={(e) => setGenre(e.target.value)}>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
        <label>Mwaka<input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} /></label>
        <label>Maelezo<input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} /></label>
        <label>Chagua video<input name="video" type="file" accept="video/*" required disabled={busy} /></label>
        {busy && <div><p className="help">{status}</p><progress value={progress} max="100" style={{ width: "100%" }} /> <small>{progress}%</small></div>}
        {!busy && status && <p className="help">{status}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Inapakia..." : "Pakia video Mux"}</button>
      </form>
    </section>
  );
}
