import { useState } from "react";
import { supabase } from "./supabase.js";
import Icon from "./Icon";
import { useStore } from "./store.jsx";
import { download, newSalt, okImg, posterStyle, readImage, sha } from "./utils.js";
import MuxUploader from "./MuxUploader.jsx";

// Barua pepe ya admin haiko wazi kwenye msimbo — kuna alama yake iliyosimbwa (SHA-256) tu.
// Ili kubadilisha admin: sha256("barua@pepe.com" kwa herufi ndogo) na uiweke hapa (pamoja na toleo mbadala la "f..." kwa vivinjari visivyo na crypto.subtle).
const GENRES = ["Tamthilia", "Filamu", "Mawaidha", "Vichekesho"];

export default function Admin({ onClose }) {
  const { state, update, t, notify, videos, promos } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [tab, setTab] = useState("videos");
  const [edit, setEdit] = useState(null);      // id ya video inayohaririwa
  const [poster, setPoster] = useState(null);  // picha ya jalada (data URL) iliyochaguliwa
  const [banner, setBanner] = useState(null);  // picha ya bango iliyochaguliwa
  const [formKey, setFormKey] = useState(0);   // kusafisha fomu baada ya kuhifadhi
  const [customers, setCustomers] = useState([]);
  const [customerBusy, setCustomerBusy] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestBusy, setRequestBusy] = useState(false);
  const loadCustomers = async () => {
    if (!supabase || customerBusy) return;
    setCustomerBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Tafadhali ingia tena kama Admin.");
      const { data, error } = await supabase.functions.invoke("phone-account-auth", {
        body: { action: "list_customers" },
        headers: { Authorization: "Bearer " + token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCustomers(Array.isArray(data?.customers) ? data.customers : []);
    } catch (err) {
      notify(err?.message || "Imeshindikana kupakia wateja.");
    } finally { setCustomerBusy(false); }
  };


  const deleteCustomer = async (customer) => {
    const label = customer.full_name || customer.phone || "mteja huyu";
    if (!window.confirm("Una uhakika unataka kufuta akaunti ya " + label + "? Akaunti na taarifa zake za kifurushi zitaondolewa. Kitendo hiki hakiwezi kutenguliwa.")) return;
    if (!supabase || deletingCustomerId) return;
    setDeletingCustomerId(customer.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Tafadhali ingia tena kama Admin.");
      const { data, error } = await supabase.functions.invoke("phone-account-auth", {
        body: { action: "delete_customer", customer_id: customer.id },
        headers: { Authorization: "Bearer " + token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCustomers((current) => current.filter((c) => c.id !== customer.id));
      notify("Akaunti ya mteja imefutwa.");
    } catch (err) {
      notify(err?.message || "Imeshindikana kufuta akaunti ya mteja.");
    } finally { setDeletingCustomerId(null); }
  };

  const loadRequests = async () => {
    if (!supabase || requestBusy) return;
    setRequestBusy(true);
    try {
      const { data, error } = await supabase.from("subscription_requests")
        .select("id,full_name,phone,plan,price_tzs,status,payment_status,submitted_by,admin_notes,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      notify(err?.message || "Imeshindikana kupakia maombi ya vifurushi.");
    } finally { setRequestBusy(false); }
  };

  const approveRequest = async (r) => {
    if (!r.submitted_by) return notify("Ombi hili halijaunganishwa na akaunti ya mteja.");
    if (r.payment_status === "paid" || r.status === "approved") return notify("Ombi hili tayari limeidhinishwa.");
    if (!window.confirm("Thibitisha kuwa umepokea malipo ya " + (r.price_tzs || 0) + " TSh kutoka kwa " + r.full_name + "?")) return;
    const days = r.plan === "Siku" ? 1 : r.plan === "Wiki" ? 7 : 30;
    const starts = new Date();
    const ends = new Date(starts);
    ends.setDate(ends.getDate() + days);
    const isChangeRequest = r.admin_notes === "CHANGE_PLAN_REQUEST";
    let subError = null;
    if (isChangeRequest) {
      const { data: currentSub, error: currentError } = await supabase.from("subscriptions")
        .select("id").eq("user_id", r.submitted_by).eq("status", "active")
        .gt("ends_at", new Date().toISOString()).order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      if (currentError) return notify(currentError.message || "Imeshindikana kupata kifurushi cha sasa.");
      if (currentSub) {
        const { error } = await supabase.from("subscriptions").update({
          request_id: r.id, plan: r.plan, starts_at: starts.toISOString(),
          ends_at: ends.toISOString(), status: "active",
        }).eq("id", currentSub.id);
        subError = error;
      } else {
        const { error } = await supabase.from("subscriptions").insert({
          request_id: r.id, user_id: r.submitted_by, plan: r.plan,
          starts_at: starts.toISOString(), ends_at: ends.toISOString(), status: "active",
        });
        subError = error;
      }
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        request_id: r.id, user_id: r.submitted_by, plan: r.plan,
        starts_at: starts.toISOString(), ends_at: ends.toISOString(), status: "active",
      });
      subError = error;
    }
    if (subError) return notify(subError.message || "Imeshindikana kuwasha kifurushi.");
    const { error: reqError } = await supabase.from("subscription_requests")
      .update({ payment_status: "paid", status: "approved" }).eq("id", r.id);
    if (reqError) return notify("Kifurushi kimewashwa lakini ombi halikusasishwa: " + reqError.message);
    notify("Malipo yamethibitishwa na kifurushi kimewashwa.");
    loadRequests();
  };


  const [messageBusy, setMessageBusy] = useState(false);
  const [messageAudience, setMessageAudience] = useState("all");
  const [messageCustomerId, setMessageCustomerId] = useState("");
  const [messageChannel, setMessageChannel] = useState("both");

  const sendAdminMessage = async (e) => {
    e.preventDefault();
    if (!supabase || messageBusy) return;
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("messageTitle") || "").trim();
    const message = String(form.get("messageBody") || "").trim();
    if (!title || !message) return notify("Weka kichwa na ujumbe kwanza.");
    if (messageAudience === "single" && !messageCustomerId) return notify("Chagua mteja wa kumtumia ujumbe.");
    if (!window.confirm("Unataka kutuma ujumbe huu kwa " + (messageAudience === "all" ? "wateja wote (hadi 150)" : "mteja aliyechaguliwa") + "?")) return;
    setMessageBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Tafadhali ingia tena kama Admin.");
      const { data, error } = await supabase.functions.invoke("admin-messaging", {
        body: {
          action: "send",
          audience: messageAudience,
          customer_id: messageCustomerId || undefined,
          channel: messageChannel,
          title,
          message,
        },
        headers: { Authorization: "Bearer " + token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      notify("Ujumbe umechakatwa. SMS zimetumwa: " + (data.sms_sent || 0) + ", zilizoshindikana: " + (data.sms_failed || 0) + ", ndani ya app: " + (data.in_app_saved || 0) + ".");
      formElement.reset();
    } catch (err) {
      notify(err?.message || "Imeshindikana kutuma ujumbe.");
    } finally {
      setMessageBusy(false);
    }
  };

  const switchTab = (k) => { setTab(k); setEdit(null); setPoster(null); setBanner(null); setFormKey((x) => x + 1); };

  /* ---------- Lango (barua pepe + nenosiri) ---------- */
  const setup = false;
  const gate = async (e) => {
    e.preventDefault();
    if (!supabase || authBusy) return notify("Supabase haijaunganishwa.");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim().toLowerCase();
    const password = String(f.get("pass") || "");
    if (!email || !password) return notify(t("ad_wrong_login"));
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Akaunti hii haina ruhusa ya Admin.");
      }
      setUnlocked(true);
    } catch (err) {
      notify(err?.message || t("ad_wrong_login"));
    } finally {
      setAuthBusy(false);
    }
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
          <button className="ap-btn on" type="submit" disabled={authBusy}>{authBusy ? "Inathibitisha..." : t("ad_open")}</button>
        </form>
      </div>
    );
  }

  /* ---------- Video ---------- */
  const editing = edit ? videos.find((c) => c.id === edit) : null;
  const e0 = editing || {};
  const purl = e0.poster && !/^data:/.test(e0.poster) ? e0.poster : "";

  const startEdit = (c) => {
    setEdit(c.id);
    setPoster(/^data:/.test(c.poster || "") ? c.poster : null);
    setFormKey((x) => x + 1);
  };
  const saveVideo = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), o = {};
    f.forEach((v, k) => { if (typeof v === "string") o[k] = v.trim(); });
    if (!o.title) return notify(t("ad_title_req"));
    if (o.src && !/^https?:\/\//i.test(o.src)) return notify(t("badlink"));
    if (!supabase) return notify("Supabase haijaunganishwa.");
    let img = /^https?:\/\//i.test(o.posterUrl || "") ? o.posterUrl : "";
    if (poster && poster.startsWith("data:")) {
      try {
        const blob = await (await fetch(poster)).blob();
        const path = `posters/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error: uploadError } = await supabase.storage.from("hero-banners").upload(path, blob, { contentType: blob.type || "image/webp" });
        if (uploadError) throw uploadError;
        img = supabase.storage.from("hero-banners").getPublicUrl(path).data.publicUrl;
      } catch (err) {
        return notify(err?.message || "Imeshindikana kupakia picha ya jalada.");
      }
    }
    const rec = {
      title: o.title, category: o.genre === "Tamthilia" ? "Mfululizo" : "Filamu",
      genre: o.genre || "", release_year: parseInt(o.year, 10) || new Date().getFullYear(),
      duration: o.dur || "", description: o.desc || "", poster_url: img || null, published: true,
    };
    if (o.src) rec.video_url = o.src;
    const isEdit = !!editing;
    const result = isEdit
      ? await supabase.from("media").update(rec).eq("id", edit).select("id").single()
      : await supabase.from("media").insert(rec).select("id").single();
    if (result.error) return notify(result.error.message || "Imeshindikana kuhifadhi video.");
    const saved = { id: result.data.id, title: rec.title, src: rec.video_url, type: rec.category,
      genre: rec.genre, year: rec.release_year, dur: rec.duration, desc: rec.description, poster: rec.poster_url, remote: true };
    update((s) => ({ media: isEdit ? (s.media || []).map((v) => v.id === edit ? saved : v) : [saved, ...(s.media || [])] }));
    notify(t(isEdit ? "ad_updated" : "saved"));
    setEdit(null); setPoster(null); setFormKey((x) => x + 1);
  };
  const delVideo = async (id) => {
    if (!window.confirm(t("delq"))) return;
    if (!supabase) return notify("Supabase haijaunganishwa.");
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) return notify(error.message || "Imeshindikana kufuta video.");
    update((s) => ({ media: (s.media || []).filter((c) => c.id !== id) }));
    if (edit === id) setEdit(null);
  };

  const videosTab = (
    <>
      <MuxUploader notify={notify} onSaved={() => window.location.reload()} />
      <h2 className="sec">{t(editing ? "ad_edit_video" : "addvideo")}</h2>
      <form className="form" key={formKey} onSubmit={saveVideo}>
        <label>{t("f_title")}<input name="title" required maxLength={80} defaultValue={e0.title || ""} /></label>
        <label>{t("f_src")}<input name="src" type="url" placeholder="https://..." defaultValue={e0.src || ""} /></label>
        <label>Aina ya video
          <select name="genre" defaultValue={GENRES.includes(e0.genre) ? e0.genre : ""} required>
            <option value="" disabled>Chagua aina ya video</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
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
      <h2 className="sec">{t("myvideos")} ({videos.length})</h2>
      {videos.length === 0 && <p className="empty">{t("ad_no_videos")}</p>}
      {videos.slice().reverse().map((c) => (
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
  const addBanner = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const url = String(f.get("url") || "").trim();
    const alt = String(f.get("alt") || "").trim();
    if (!supabase) return notify("Supabase haijaunganishwa.");
    let img = /^https?:\/\//i.test(url) ? url : "";
    let storagePath = null;
    if (banner && banner.startsWith("data:")) {
      try {
        const blob = await (await fetch(banner)).blob();
        storagePath = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error: uploadError } = await supabase.storage.from("hero-banners").upload(storagePath, blob, { contentType: blob.type || "image/webp" });
        if (uploadError) throw uploadError;
        img = supabase.storage.from("hero-banners").getPublicUrl(storagePath).data.publicUrl;
      } catch (err) {
        return notify(err?.message || "Imeshindikana kupakia picha.");
      }
    }
    if (!img) return notify(t("ad_need_img"));
    const { data, error } = await supabase.from("hero_banners").insert({
      title: alt || "Youflix banner", subtitle: "", image_url: img,
      storage_path: storagePath, is_active: true, sort_order: promos.length,
    }).select("id,title,image_url,storage_path").single();
    if (error) return notify(error.message);
    update((st) => ({ promos: [...(st.promos || []), {
      id: data.id, img: data.image_url, alt: data.title, remote: true, storage_path: data.storage_path,
    }] }));
    setBanner(null); setFormKey((x) => x + 1); notify(t("ad_banner_saved"));
  };
  const delBanner = async (id) => {
    if (!window.confirm(t("delq"))) return;
    const item = (state.promos || []).find((p) => p.id === id);
    if (item?.remote) {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) return notify(error.message);
      if (item.storage_path) await supabase.storage.from("hero-banners").remove([item.storage_path]);
      update((st) => ({ promos: (st.promos || []).filter((p) => p.id !== id) }));
    } else if (mine.includes(id)) {
      update((st) => ({ promos: (st.promos || []).filter((p) => p.id !== id) }));
    } else {
      update((st) => ({ hidePromos: [...(st.hidePromos || []), id] }));
    }
  };

  const bannersTab = (
    <>
      <h2 className="sec">{t("ad_banners")}</h2>
      <p className="help" style={{ padding: "0 14px" }}>{t("ad_banners_sub")}</p>
      {promos.length === 0 && <p className="empty">{t("ad_no_banners")}</p>}
      {promos.map((p) => (
        <div className="ad-row" key={p.id}>
          <span className="th" style={{ backgroundImage: `url(${JSON.stringify(p.img)})` }} />
          <span className="info"><b>{p.alt || "—"}</b>{!mine.includes(p.id) && <small>{t("ad_builtin")}</small>}{p.remote && <small>Supabase</small>}</span>
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

  const customersTab = (
    <>
      <h2 className="sec">Wateja ({customers.length})</h2>
      <div className="set">
        <button className="btn" type="button" onClick={loadCustomers} disabled={customerBusy}>
          {customerBusy ? "Inapakia..." : "Onyesha / Sasisha wateja"}
        </button>
      </div>
      {customers.length === 0 && <p className="empty">{customerBusy ? "Inapakia taarifa za wateja..." : "Hakuna wateja walioonyeshwa. Bonyeza Onyesha / Sasisha wateja."}</p>}
      {customers.map((c) => (
        <div className="ad-row" key={c.id}>
          <span className="th" aria-hidden="true">👤</span>
          <span className="info">
            <b>{c.full_name || "Mteja"}</b>
            <small>{c.phone || "Hakuna namba"}{c.created_at ? " • " + new Date(c.created_at).toLocaleDateString("sw-TZ") : ""}</small>
          </span>
          <small>{c.role === "customer" ? "Mteja" : c.role}</small>
          <button className="btn ghost" type="button" disabled={!!deletingCustomerId}
            onClick={() => deleteCustomer(c)}>
            {deletingCustomerId === c.id ? "Inafuta..." : "Futa"}
          </button>
        </div>
      ))}
    </>
  );


  const requestsTab = (
    <>
      <h2 className="sec">Maombi ya Vifurushi ({requests.length})</h2>
      <div className="set">
        <button className="btn" type="button" onClick={loadRequests} disabled={requestBusy}>
          {requestBusy ? "Inapakia..." : "Onyesha / Sasisha maombi"}
        </button>
      </div>
      {requests.length === 0 && <p className="empty">Hakuna maombi yaliyoonyeshwa. Bonyeza Onyesha / Sasisha maombi.</p>}
      {requests.map((r) => (
        <div className="ad-row" key={r.id}>
          <span className="th" aria-hidden="true">🎟️</span>
          <span className="info">
            <b>{r.full_name} · {r.plan}</b>\n            {r.admin_notes === "CHANGE_PLAN_REQUEST" && <small>Ombi la kubadilisha kifurushi</small>}
            <small>{r.phone} · TSh {Number(r.price_tzs || 0).toLocaleString("en-US")}</small>
            <small>{r.payment_status === "paid" ? "Malipo yamethibitishwa" : "Malipo hayajathibitishwa"} · {r.status}</small>
          </span>
          {r.status === "pending" && r.payment_status !== "paid" &&
            <button className="btn" type="button" onClick={() => approveRequest(r)}>Thibitisha malipo</button>}
        </div>
      ))}
    </>
  );


  const messagesTab = (
    <>
      <h2 className="sec">Tuma ujumbe kwa wateja</h2>
      <p className="help" style={{ padding: "0 14px" }}>Chagua SMS, ujumbe wa ndani ya Youflix, au vyote viwili.</p>
      <form className="form" onSubmit={sendAdminMessage}>
        <label>Wapokeaji
          <select value={messageAudience} onChange={(e) => setMessageAudience(e.target.value)}>
            <option value="all">Wateja wote (hadi 150 kwa kila utumaji)</option>
            <option value="single">Mteja mmoja</option>
          </select>
        </label>
        {messageAudience === "single" && (
          <>
            <button className="btn ghost" type="button" onClick={loadCustomers} disabled={customerBusy}>
              {customerBusy ? "Inapakia wateja..." : "Pakia orodha ya wateja"}
            </button>
            <label>Chagua mteja
              <select value={messageCustomerId} onChange={(e) => setMessageCustomerId(e.target.value)}>
                <option value="">Chagua mteja</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.full_name || "Mteja"} · {customer.phone || "Hakuna namba"}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <label>Njia ya kutuma
          <select value={messageChannel} onChange={(e) => setMessageChannel(e.target.value)}>
            <option value="both">SMS + ujumbe ndani ya Youflix</option>
            <option value="sms">SMS kupitia Kilakona pekee</option>
            <option value="in_app">Ujumbe ndani ya Youflix pekee</option>
          </select>
        </label>
        <label>Kichwa cha ujumbe<input name="messageTitle" maxLength={100} required placeholder="Mfano: Filamu mpya" /></label>
        <label>Ujumbe<textarea name="messageBody" rows={4} maxLength={1000} required placeholder="Andika taarifa unayotaka wateja waipokee." /></label>
        <button className="btn" type="submit" disabled={messageBusy}>
          {messageBusy ? "Inatuma..." : "Tuma ujumbe"}
        </button>
      </form>
    </>
  );

  const tabs = [["videos", "ad_tab_videos"], ["customers", "Wateja"], ["requests", "Vifurushi"], ["messages", "Ujumbe"], ["banners", "ad_tab_banners"], ["data", "ad_tab_data"]];
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
        {tab === "videos" ? videosTab : tab === "customers" ? customersTab : tab === "requests" ? requestsTab : tab === "messages" ? messagesTab : tab === "banners" ? bannersTab : dataTab}
      </div>
    </div>
  );
}
