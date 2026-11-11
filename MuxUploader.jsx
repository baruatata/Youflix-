import { useState } from "react";
import { supabase } from "./supabase.js";

const GENRES = ["Tamthilia", "Filamu", "Mawaidha", "Vichekesho"];

export default function MuxUploader({ notify, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Tamthilia");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const invoke = async (action, extra = {}) => {
    const { data, error } = await supabase.functions.invoke("mux-admin", { body: { action, ...extra } });
    if (error) throw new Error(data?.error || error.message || "Hitilafu ya Mux.");
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const upload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.video.files?.[0];
    const cover = form.elements.cover.files?.[0];
    if (!file) return notify("Chagua video kutoka kwenye simu yako.");
    if (!cover) return notify("Chagua picha ya cover ya video.");
    if (!cover.type.startsWith("image/")) return notify("Cover lazima iwe picha.");
    if (cover.size > 8 * 1024 * 1024) return notify("Picha ya cover isizidi MB 8.");
    if (!title.trim()) return notify("Weka jina la video.");
    if (busy) return;
    setBusy(true); setProgress(0); setStatus("Inaandaa upload yenye Public Playback...");
    try {
      const created = await invoke("create-upload");
      setStatus("Inatuma video kwenda Mux...");
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", created.upload_url);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Mux imekataa video. Jaribu tena."));
        xhr.onerror = () => reject(new Error("Mtandao umekatika wakati wa kupakia video."));
        xhr.onabort = () => reject(new Error("Upload imesitishwa."));
        xhr.send(file);
      });

      setStatus("Inahifadhi picha ya cover...");
      const coverExt = (cover.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const coverPath = `posters/${Date.now()}-${Math.random().toString(36).slice(2)}.${coverExt}`;
      const { error: coverError } = await supabase.storage.from("hero-banners").upload(coverPath, cover, { contentType: cover.type, cacheControl: "31536000", upsert: false });
      if (coverError) throw new Error("Imeshindikana kuhifadhi cover: " + coverError.message);
      const posterUrl = supabase.storage.from("hero-banners").getPublicUrl(coverPath).data.publicUrl;

      const category = genre === "Tamthilia" ? "Mfululizo" : genre === "Mawaidha" ? "Nyaraka" : "Filamu";
      let result = null;
      for (let attempt = 0; attempt < 120; attempt++) {
        setStatus("Mux inachakata video... (" + (attempt + 1) + ")");
        try {
          result = await invoke("finalize-upload", {
            upload_id: created.upload_id, title: title.trim(), category,
            release_year: Number(year) || new Date().getFullYear(),
            age_rating: "13+", genre, description: description.trim(), poster_url: posterUrl
          });
          break;
        } catch (err) {
          if (!String(err.message).includes("bado inachakatwa")) throw err;
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
      if (!result?.media?.id) throw new Error("Video bado inachakatwa. Jaribu tena baada ya dakika chache.");
      setStatus("Video imehifadhiwa kwa Public Playback. Inasubiri kuchapishwa na Admin.");
      notify("Video imepakiwa kwa ulinzi wa Public Playback; ichapishe kupitia Admin baada ya ukaguzi.");
      setTitle(""); setDescription(""); setProgress(0); setCoverFile(null); form.reset(); onSaved?.();
    } catch (error) {
      notify(error?.message || "Imeshindikana kupakia video.");
      setStatus(error?.message || "Upload imeshindikana.");
    } finally { setBusy(false); }
  };

  return <section className="form" style={{ marginBottom: 22, padding: 14, border: "1px solid rgba(255,255,255,.14)", borderRadius: 12 }}>
    <h2 className="sec">Pakia video kutoka simu (Mux)</h2>
    <p className="help">Video itatumwa Mux kwa Public Playback ili ihitaji token halali ya Youflix kutazamwa.</p>
    <form onSubmit={upload}>
      <label>Jina la video<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} /></label>
      <label>Aina ya video<select value={genre} onChange={(e) => setGenre(e.target.value)}>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
      <label>Mwaka<input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} /></label>
      <label>Maelezo<input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} /></label>
      <label>Chagua cover / poster ya video<input name="cover" type="file" accept="image/*" required disabled={busy} onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></label>
      {coverFile && <p className="help">Cover imechaguliwa: {coverFile.name}</p>}
      <label>Chagua video<input name="video" type="file" accept="video/*" required disabled={busy} /></label>
      {busy && <div><p className="help">{status}</p><progress value={progress} max="100" style={{ width: "100%" }} /> <small>{progress}%</small></div>}
      {!busy && status && <p className="help">{status}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Inapakia..." : "Pakia video Mux"}</button>
    </form>
  </section>;
}
