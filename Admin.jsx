import { useState } from "react";
import { supabase } from "./supabase.js";
import Icon from "./Icon";
import { useStore } from "./store.jsx";
import { download, newSalt, okImg, posterStyle, readImage, sha } from "./utils.js";

// Barua pepe ya admin haiko wazi kwenye msimbo — kuna alama yake iliyosimbwa (SHA-256) tu.
// Ili kubadilisha admin: sha256("barua@pepe.com" kwa herufi ndogo) na uiweke hapa (pamoja na toleo mbadala la "f..." kwa vivinjari visivyo na crypto.subtle).
const GENRES = ["Thamthilia", "Hadithi", "Vichekesho", "Matukio", "Bongo", "Muziki"];

export default function Admin({ onClose }) {
  const { state, update, t, notify, videos, promos } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [tab, setTab] = useState("videos");
  const [edit, setEdit] = useState(null);      // id ya video inayohaririwa
  const [poster, setPoster] = useState(null);  // picha ya jalada (data URL) iliyochaguliwa
  const [banner, setBanner] = useState(null);  // picha ya bango iliyochaguliwa
  const [formKey, setFormKey] = useState(0);   // kusafisha fomu baada ya kuhifadhi

  const switchTab = (k) => { setTab(k); setEdit(null); setPoster(null); setBanner(null); setFormKey((x) => x + 1); };

  /* ---------- Lango (barua pepe + nenosiri) ---------- */
  const setup = false;
  const gate = async (e) => {
    e.preventDefault();
    if (!supabase || authBusy) return notify("Muunganisho wa Supabase haujapatikana. Jaribu tena baadaye.");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim().toLowerCase();
    const password = String(f.get("pass") || "");
    if (!email || !password) return notify(t("ad_wrong_login"));
    setAuthBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("role").eq("id", data.user.id).single();
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
  };  const addBanner = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const alt = String(f.get("alt") || "").trim();
    const url = String(f.get("url") || "").trim();
    if (!supabase) return notify("Supabase haijaunganishwa.");
    let imageUrl = /^https?:\\/\\//i.test(url) ? url : "";
    let storagePath = null;
    if (banner && banner.startsWith("data:")) {
      try {
        const response = await fetch(banner);
        const blob = await response.blob();
        const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error: uploadError } = await supabase.storage.from("hero-banners").upload(path, blob, {
          contentType: blob.type || "image/webp", upsert: false,
        });
        if (uploadError) throw uploadError;
        storagePath = path;
        imageUrl = supabase.storage.from("hero-banners").getPublicUrl(path).data.publicUrl;
      } catch (err) {
        return notify(err?.message || "Imeshindikana kupakia picha.");
      }
    }
    if (!imageUrl) return notify(t("ad_need_img"));
    const { data, error } = await supabase.from("hero_banners").insert({
      title: alt || "Youflix banner", subtitle: "", image_url: imageUrl,
      storage_path: storagePath, is_active: true, sort_order: promos.length,
    }).select("id,title,subtitle,image_url,is_active,sort_order,storage_path").single();
    if (error) return notify(error.message);
    update((st) => ({ promos: [...(st.promos || []).filter((p) => !p.remote), {
      id: data.id, img: data.image_url, alt: data.title, remote: true, storage_path: data.storage_path,
    }] }));
    setBanner(null); setFormKey((x) => x + 1); notify(t("ad_banner_saved"));
  };  const delBanner = async (id) => {
    if (!window.confirm(t("delq"))) return;
    const item = (state.promos || []).find((p) => p.id === id);
    if (item?.remote) {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) return notify(error.message);
      if (item.storage_path) await supabase.storage.from("hero-banners").remove([item.storage_path]);
      update((st) => ({ promos: (st.promos || []).filter((p) => p.id !== id) }));
    } else {
      update((st) => ({ hidePromos: [...(st.hidePromos || []), id] }));
    }
  };
