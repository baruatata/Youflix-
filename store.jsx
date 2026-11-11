import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { T } from "./i18n.js";
import { PROMOS, VIDEOS } from "./catalog.js";
import { supabase } from "./supabase.js";
import { canonicalGenre } from "./utils.js";

const KEY = "youflix.v1";
const DEFAULTS = {
  list: [], custom: [], progress: {}, saver: false, light: false, lang: "sw",
  users: [], me: null, promos: [], hidePromos: [], admin: null,
  media: [], subscription: null,
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s && typeof s === "object" ? { ...DEFAULTS, ...s } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState("");
  const timer = useRef(0);
  const warned = useRef(false);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  }, []);
  const t = useCallback((k) => (T[state.lang] && T[state.lang][k]) || T.sw[k] || k, [state.lang]);

  // Rejesha akaunti na taarifa za kifurushi kutoka Supabase.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const syncUser = async (user) => {
      if (!alive) return;
      if (!user || user.user_metadata?.account_method !== "phone_password") {
        setState((s) => ({ ...s, users: [], me: null, subscription: null }));
        return;
      }
      const u = {
        id: user.id,
        name: user.user_metadata.full_name || "Mteja",
        contact: user.user_metadata.phone || "",
      };
      setState((s) => ({ ...s, users: [...(s.users || []).filter((x) => x.id !== u.id), u], me: u.id }));
      const { data } = await supabase.from("subscriptions")
        .select("id,plan,starts_at,ends_at,status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (alive) setState((s) => ({ ...s, subscription: Array.isArray(data) && data.length ? data[0] : null }));
    };
    supabase.auth.getSession().then(({ data }) => syncUser(data?.session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user || null);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  // Pakua video zote zilizochapishwa kutoka jedwali la media_catalog.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.from("media")
      .select("id,title,category,release_year,duration,genre,description,poster_url,featured,published,video_url")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) {
          console.error("Youflix media load failed:", error);
          setState((s) => ({ ...s, media: [] }));
          notify("Video hazijapakiwa: " + (error.message || "Hitilafu ya Supabase"));
          return;
        }
        if (!Array.isArray(data)) {
          notify("Taarifa za video hazijapatikana. Jaribu ku-refresh ukurasa.");
          return;
        }
        const media = data.map((m) => {
          const normalizedGenre = canonicalGenre(m.genre) || canonicalGenre(m.category) || m.genre || m.category || "";
          return {
            id: m.id, title: m.title,
            type: /series|episode|mfululizo/i.test(m.category || "") ? "series" : "movie",
            genre: normalizedGenre, year: m.release_year, dur: m.duration || "",
            desc: m.description || "", poster: m.poster_url || "", src: "",
            featured: !!m.featured, remote: true,
          };
        });
        setState((s) => ({ ...s, media }));
      });
    return () => { alive = false; };
  }, []);

  // Pakua mabango ya Hero.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.from("hero_banners").select("id,title,subtitle,image_url,is_active,sort_order,storage_path")
      .eq("is_active", true).order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!alive || error || !Array.isArray(data)) return;
        const remote = data.map((b) => ({ id: b.id, img: b.image_url, alt: b.title || b.subtitle || "", remote: true, storage_path: b.storage_path || null }));
        setState((s) => {
          const local = (s.promos || []).filter((p) => !p.remote);
          return { ...s, promos: [...local, ...remote] };
        });
      });
    return () => { alive = false; };
  }, []);

  // Hifadhi mapendeleo ya ndani; ruhusa za akaunti na kifurushi zinatoka Supabase.
  useEffect(() => {
    try {
      const { media, subscription, ...localState } = state;
      localStorage.setItem(KEY, JSON.stringify(localState));
      warned.current = false;
    } catch {
      if (!warned.current) { warned.current = true; notify(t("storefull")); }
    }
  }, [state, notify, t]);

  useEffect(() => { document.documentElement.lang = state.lang; }, [state.lang]);

  const update = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) })), []);
  const videos = useMemo(() => {
    const remote = state.media || [];
    return remote.length ? remote : VIDEOS.concat(state.custom || []);
  }, [state.media, state.custom]);
  const promos = useMemo(() => PROMOS.filter((p) => !(state.hidePromos || []).includes(p.id)).concat(state.promos || []), [state.hidePromos, state.promos]);
  const me = useMemo(() => state.users.find((u) => u.id === state.me) || null, [state.users, state.me]);

  const logout = useCallback(async () => {
    if (!window.confirm(t("a_logoutq"))) return;
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) { notify(error.message || "Imeshindikana kutoka."); return; }
    }
    update({ me: null, subscription: null });
    notify(t("a_bye"));
  }, [t, update, notify]);

  const value = useMemo(() => ({ state, update, t, notify, toast, videos, promos, me, logout }), [state, update, t, notify, toast, videos, promos, me, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
