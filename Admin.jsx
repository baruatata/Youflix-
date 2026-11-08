import { useState } from "react";
import Icon from "./Icon";
import { useStore } from "../lib/store";
import { download, newSalt, okImg, posterStyle, readImage, sha } from "../lib/utils";

// Barua pepe ya admin haiko wazi kwenye msimbo — kuna alama yake iliyosimbwa (SHA-256) tu.
// Ili kubadilisha admin: sha256("barua@pepe.com" kwa herufi ndogo) na uiweke hapa (pamoja na toleo mbadala la "f..." kwa vivinjari visivyo na crypto.subtle).
const ADMIN_EH = ["2c643d903efe35e90cbb70afe09bc31799bb96f0c7525e1f34802165910b51e4", "f1023948892"];
const emailOk = (em) => sha(em.trim().toLowerCase()).then((h) => ADMIN_EH.includes(h));
const GENRES = ["Thamthilia", "Hadithi", "Vichekesho", "Matukio", "Bongo", "Muziki"];

export default function Admin({ onClose }) {
  const { state, update, t, notify, videos, promos } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("videos");
  const [edit, setEdit] = useState(null);      // id ya video inayohaririwa
  const [poster, setPoster] = useState(null);  // picha ya jalada (data URL) iliyochaguliwa
  const [banner, setBanner] = useState(null);  // picha ya bango iliyochaguliwa
  const [formKey, setFormKey] = useState(0);   // kusafisha fomu baada ya kuhifadhi

  const switchTab = (k) => { setTab(k); setEdit(null); setPoster(null); setBanner(null); setFormKey((x) => x + 1); };

  /* ---------- Lango (barua pepe + nenosiri) ---------- */
  const setup = !state.admin;
  const gate = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const em = String(f.get("email") || ""), p = String(f.get("pass") || "");
    if (!em.trim() || !p) return notify(t("ad_wrong_login"));
    if (setup) {
      if (p.length < 4) return notify(t("ad_short"));
      if (p !== String(f.get("pass2") || "")) return notify(t("ad_mismatch"));
    }
    emailOk(em).then((ok) => {
      if (!ok) return notify(t("ad_wrong_login"));
      if (setup) {
        const salt = newSalt();
        return sha(salt + p).then((hash) => { update({ admin: { salt, hash } }); setUnlocked(true); });
      }
      return sha(state.admin.salt + p).then((hash) => {
        if (hash !== state.admin.hash) return notify(t("ad_wrong_login"));
        setUnlocked(true);
      });
    });
  };

  if (!unlocked) {
    return (
      <div id="admin" className="modal">
        <form className="ad-gate" onSubmit={gate} noValidate>
          <button type="button" className="close" aria-label={t("close")} onClick={onClose}>✕</button>
          <div className="ad-lock"><Icon name="lock" /></div>
          <h2>{t(setup ? "ad_gate_new" : "ad_gate")}</h2>
          <p className="sub">{t(setup ? "ad_gate_new_sub" : "ad_gate_sub")}</p>
          <input name="email" type="email" placeholder={t("ad_email")} autoComplete="username" inputMode="email"
            autoCapitalize="off" spellCheck={false} maxLength={80} />
          <input name="pass" type="password" placeholder={t("ad_pass")} maxLength={60}
            autoComplete={setup ? "new-password" : "current-password"} />
          {setup && <input name="pass2" type="password" placeholder={t("ad_pass2")} maxLength={60} autoComplete="new-password" />}
          <button className="ap-btn on" type="submit">{t(setup ? "ad_save_pass" : "ad_open")}</button>
        </form>
      </div>
    );
  }

  /* ---------- Video ---------- */
  const editing = edit ? state.custom.find((c) => c.id === edit) : null;
  const e0 = editing || {};
  const purl = e0.poster && !/^data:/.test(e0.poster) ? e0.poster : "";

  const startEdit = (c) => {
    setEdit(c.id);
    setPoster(/^data:/.test(c.poster || "") ? c.poster : null);
    setFormKey((x) => x + 1);
  };
  const saveVideo = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), o = {};
    f.forEach((v, k) => { if (typeof v === "string") o[k] = v.trim(); });
    if (!o.title) return notify(t("ad_title_req"));
    if (o.src && !/^https?:\/\//i.test(o.src)) return notify(t("badlink"));
    const img = poster || (/^https?:\/\//i.test(o.posterUrl || "") ? o.posterUrl : "");
    const rec = {
      title: o.title, src: o.src || "", type: o.type === "series" ? "series" : "movie", genre: o.genre || "",
      year: parseInt(o.year, 10) || new Date().getFullYear(), dur: o.dur || "", desc: o.desc || "",
    };
    if (img) rec.poster = img;
    const isEdit = !!editing;
    update((s) => ({
      custom: isEdit ? s.custom.map((c) => (c.id === edit ? { ...rec, id: edit } : c)) : [...s.custom, { ...rec, id: "c" + Date.now() }],
    }));
    notify(t(isEdit ? "ad_updated" : "saved"));
    setEdit(null); setPoster(null); setFormKey((x) => x + 1);
  };
  const delVideo = (id) => {
    if (!window.confirm(t("delq"))) return;
    update((s) => ({ custom: s.custom.filter((c) => c.id !== id), list: s.list.filter((i) => i !== id) }));
    if (edit === id) setEdit(null);
  };

  const videosTab = (
    <>
      <h2 className="sec">{t(editing ? "ad_edit_video" : "addvideo")}</h2>
      <form className="form" key={formKey} onSubmit={saveVideo}>
        <label>{t("f_title")}<input name="title" required maxLength={80} defaultValue={e0.title || ""} /></label>
        <label>{t("f_src")}<input name="src" type="url" placeholder="https://..." defaultValue={e0.src || ""} /></label>
        <label>{t("f_type")}
          <select name="type" defaultValue={e0.type === "series" ? "series" : "movie"}>
            <option value="movie">{t("k_movie")}</option><option value="series">{t("k_series")}</option>
          </select>
        </label>
        <label>{t("f_genre")}<input name="genre" list="adGenres" maxLength={30} defaultValue={e0.genre || ""} /></label>
        <datalist id="adGenres">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
        <label>{t("ad_f_year")}<input name="year" type="number" inputMode="numeric" min="1900" max="2100" defaultValue={e0.year || new Date().getFullYear()} /></label>
        <label>{t("ad_f_dur")}<input name="dur" maxLength={20} defaultValue={e0.dur || ""} /></label>
        <label>{t("f_desc")}<input name="desc" maxLength={300} defaultValue={e0.desc || ""} /></label>
        <label>{t("f_poster")}<input name="posterUrl" type="url" placeholder="https://..." defaultValue={purl} /></label>
        <label>{t("ad_f_poster_file")}
          <input type="file" accept="image/*" onChange={(ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (file) readImage(file, 400, (d) => { setPoster(d); if (!d) notify(t("ad_import_bad")); });
          }} />
        </label>
        <p className="help">{poster ? t("ad_poster_ok") : ""}</p>
        <button className="btn" type="submit">{t("f_save")}</button>
        {editing && <button className="btn ghost" type="button" onClick={() => { setEdit(null); setPoster(null); setFormKey((x) => x + 1); }}>{t("ad_cancel")}</button>}
      </form>
      <h2 className="sec">{t("myvideos")} ({state.custom.length})</h2>
      {state.custom.length === 0 && <p className="empty">{t("ad_no_videos")}</p>}
      {state.custom.slice().reverse().map((c) => (
        <div className="ad-row" key={c.id}>
          <span className="th" style={posterStyle(c, state.saver)} />
          <span className="info">
            <b>{c.title}</b>
            <small>{[c.type === "series" ? t("k_series") : t("k_movie"), c.genre, c.year].filter(Boolean).join(" • ")}</small>
          </span>
          <button className="btn ghost" onClick={() => startEdit(c)}>{t("ad_edit")}</button>
          <button className="btn ghost" onClick={() => delVideo(c.id)}>{t("del")}</button>
        </div>
      ))}
    </>
  );

  /* ---------- Mabango ---------- */
  const mine = (state.promos || []).map((p) => p.id);
  const hidden = state.hidePromos || [];
  const addBanner = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), url = String(f.get("url") || "").trim(), alt = String(f.get("alt") || "").trim();
    const img = banner || (/^https?:\/\//i.test(url) ? url : "");
    if (!img) return notify(t("ad_need_img"));
    update((s) => ({ promos: [...(s.promos || []), { id: "bp" + Date.now(), img, alt }] }));
    setBanner(null); setFormKey((x) => x + 1); notify(t("ad_banner_saved"));
  };
  const delBanner = (id) => {
    if (!window.confirm(t("delq"))) return;
    if (mine.includes(id)) update((s) => ({ promos: s.promos.filter((p) => p.id !== id) }));
    else update((s) => ({ hidePromos: [...(s.hidePromos || []), id] }));
  };

  const bannersTab = (
    <>
      <h2 className="sec">{t("ad_banners")}</h2>
      <p className="help" style={{ padding: "0 14px" }}>{t("ad_banners_sub")}</p>
      {promos.length === 0 && <p className="empty">{t("ad_no_banners")}</p>}
      {promos.map((p) => (
        <div className="ad-row" key={p.id}>
          <span className="th" style={{ backgroundImage: `url(${JSON.stringify(p.img)})` }} />
          <span className="info"><b>{p.alt || "—"}</b>{!mine.includes(p.id) && <small>{t("ad_builtin")}</small>}</span>
          <button className="btn ghost" onClick={() => delBanner(p.id)}>{t(mine.includes(p.id) ? "del" : "ad_hide")}</button>
        </div>
      ))}
      {hidden.length > 0 && <div className="set"><button className="btn ghost" onClick={() => update({ hidePromos: [] })}>{t("ad_restore")}</button></div>}
      <h2 className="sec">{t("ad_add_banner")}</h2>
      <form className="form" key={formKey} onSubmit={addBanner}>
        <label>{t("ad_banner_alt")}<input name="alt" maxLength={100} /></label>
        <label>{t("ad_banner_file")}
          <input type="file" accept="image/*" onChange={(ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (file) readImage(file, 720, (d) => { setBanner(d); if (!d) notify(t("ad_import_bad")); });
          }} />
        </label>
        <p className="help">{banner ? t("ad_poster_ok") : ""}</p>
        <label>{t("ad_banner_url")}<input name="url" type="url" placeholder="https://..." /></label>
        <button className="btn" type="submit">{t("ad_add_banner")}</button>
      </form>
    </>
  );

  /* ---------- Data: hamisha, leta, nenosiri ---------- */
  const exportJson = () => download("youflix-nakala.json", JSON.stringify({ v: 1, videos: state.custom, promos: state.promos || [] }), "application/json");
  const exportCatalog = () =>
    download("catalog.js",
      `/* Imetengenezwa na Admin Panel — ${new Date().toISOString().slice(0, 10)} */\n` +
      `export const PROMOS = ${JSON.stringify(promos, null, 1)};\n` +
      `export const VIDEOS = ${JSON.stringify(videos, null, 1)};\n`, "text/javascript");
  const importJson = (file) => {
    const r = new FileReader();
    r.onerror = () => notify(t("ad_import_bad"));
    r.onload = () => {
      let j;
      try { j = JSON.parse(r.result); } catch { return notify(t("ad_import_bad")); }
      if (!j || typeof j !== "object" || !Array.isArray(j.videos)) return notify(t("ad_import_bad"));
      let n = 0;
      const vids = [];
      j.videos.forEach((v) => {
        if (!v || typeof v.title !== "string" || !v.title.trim()) return;
        const rec = {
          id: /^c\d+$/.test(v.id) ? v.id : "c" + Date.now() + n, title: v.title.slice(0, 80),
          src: /^https?:\/\//i.test(v.src) ? v.src : "", type: v.type === "series" ? "series" : "movie",
          genre: String(v.genre || "").slice(0, 30), year: parseInt(v.year, 10) || new Date().getFullYear(),
          dur: String(v.dur || "").slice(0, 20), desc: String(v.desc || "").slice(0, 300),
        };
        if (okImg(v.poster)) rec.poster = v.poster;
        vids.push(rec); n++;
      });
      const prs = [];
      (Array.isArray(j.promos) ? j.promos : []).forEach((p) => {
        if (!p || !okImg(p.img)) return;
        prs.push({ id: /^bp\d+$/.test(p.id) ? p.id : "bp" + Date.now() + n, img: p.img, alt: String(p.alt || "").slice(0, 100) }); n++;
      });
      update((s) => ({
        custom: [...s.custom.filter((c) => !vids.some((v) => v.id === c.id)), ...vids],
        promos: [...(s.promos || []).filter((p) => !prs.some((x) => x.id === p.id)), ...prs],
      }));
      notify(t("ad_import_ok") + " (" + n + ")");
    };
    r.readAsText(file);
  };
  const wipe = () => {
    if (!window.confirm(t("ad_wipe_q"))) return;
    update({ custom: [], promos: [], hidePromos: [], list: [] });
    notify(t("cleared"));
  };
  const changePass = (e) => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const old = String(f.get("old") || ""), nw = String(f.get("nw") || "");
    if (nw.length < 4) return notify(t("ad_short"));
    sha(state.admin.salt + old).then((h) => {
      if (h !== state.admin.hash) return notify(t("ad_wrong"));
      const salt = newSalt();
      return sha(salt + nw).then((h2) => { update({ admin: { salt, hash: h2 } }); notify(t("ad_pass_changed")); form.reset(); });
    });
  };

  const dataTab = (
    <>
      <h2 className="sec">{t("ad_data_title")}</h2>
      <p className="help" style={{ padding: "0 14px 6px" }}>{t("ad_data_note")}</p>
      <div className="set">
        <button className="btn" onClick={exportCatalog}>{t("ad_dl_datajs")}</button>
        <button className="btn ghost" onClick={exportJson}>{t("ad_export")}</button>
        <label>{t("ad_import")}
          <input type="file" accept="application/json,.json" onChange={(ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (file) { importJson(file); ev.target.value = ""; }
          }} />
        </label>
        <button className="btn ghost" onClick={wipe}>{t("ad_wipe")}</button>
      </div>
      <h2 className="sec">{t("ad_change_pass")}</h2>
      <form className="form" onSubmit={changePass}>
        <label>{t("ad_old_pass")}<input name="old" type="password" autoComplete="current-password" maxLength={60} /></label>
        <label>{t("ad_new_pass")}<input name="nw" type="password" autoComplete="new-password" maxLength={60} /></label>
        <button className="btn" type="submit">{t("ad_save_pass")}</button>
      </form>
    </>
  );

  const tabs = [["videos", "ad_tab_videos"], ["banners", "ad_tab_banners"], ["data", "ad_tab_data"]];
  return (
    <div id="admin" className="modal">
      <div className="ad">
        <div className="ad-top">
          <h1><Icon name="lock" />{t("ad_title")}</h1>
          <button className="ap-back" onClick={onClose}>{t("ad_exit")}</button>
        </div>
        <div className="ad-tabs">
          {tabs.map(([k, label]) => <button key={k} className={"chip" + (tab === k ? " on" : "")} onClick={() => switchTab(k)}>{t(label)}</button>)}
        </div>
        {tab === "videos" ? videosTab : tab === "banners" ? bannersTab : dataTab}
      </div>
    </div>
  );
}
