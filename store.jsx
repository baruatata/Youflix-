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

  // Akaunti na kifurushi hutambuliwa kwa Supabase Auth ID, si user_metadata
  // inayoweza kukosekana au kutofautiana kati ya njia za kuingia.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    let syncSequence = 0;
    const syncUser = async (user) => {
      const sequence = ++syncSequence;
      if (!alive) return;
      if (!user) {
        setState((s) => ({ ...s, users: [], me: null, subscription: null }));
        return;
      }
      const u = {
        id: user.id,
        name: user.user_metadata?.full_name || "Mteja",
        contact: user.user_metadata?.phone || user.phone || "",
      };
      setState((s) => ({ ...s, users: [...(s.users || []).filter((x) => x.id !== u.id), u], me: u.id }));

      const now = new Date().toISOString();
      const { data, error } = await supabase.from("subscriptions")
        .select("id,plan,starts_at,ends_at,status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .lte("starts_at", now)
        .gt("ends_at", now)
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive || sequence !== syncSequence) return;
      if (error) {
        console.error("Youflix subscription load failed:", error);
        setState((s) => ({ ...s, subscription: null }));
        return;
      }
      setState((s) => ({ ...s, subscription: data || null }));
    };
    supabase.auth.getSession().then(({ data }) => syncUser(data?.session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user || null);
    });
    return () => { alive = false; syncSequence++; subscription.unsubscribe(); };
  }, []);

  // Pakua video zote zilizochapishwa kutoka jedwali la media.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    // Katalogi ya umma ina metadata tu; video_url inabaki imefungwa kwenye media RLS.
    supabase.from("published_media_catalog")
      .select("id,title,category,release_year,duration,genre,description,poster_url,featured,published")
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

  // Hero hupakiwa moja kwa moja kutoka Supabase, bila kutegemea cache ya simu.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    let requestId = 0;
    let retryTimer;
    const loadBanners = async () => {
      const currentRequest = ++requestId;
      let result = await supabase.from("hero_banners")
        .select("id,title,subtitle,image_url,is_active,sort_order,storage_path")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      // Ikiwa schema ya storage_path haipo kwenye mazingira fulani, endelea kutumia image_url.
      if (result.error) {
        console.warn("Youflix hero extended query failed; retrying compatible query:", result.error);
        result = await supabase.from("hero_banners")
          .select("id,title,subtitle,image_url,is_active,sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
      }
      if (!alive || currentRequest !== requestId) return;
      if (result.error || !Array.isArray(result.data)) {
        console.error("Youflix hero banners load failed:", result.error);
        retryTimer = setTimeout(loadBanners, 8000);
        return;
      }
      const remote = result.data.map((b) => {
        const storageUrl = b.storage_path
          ? supabase.storage.from("hero-banners").getPublicUrl(b.storage_path).data?.publicUrl
          : "";
        // Tumia URL ya faili asili moja kwa moja ili kuepuka hitilafu za image-transform.
        // Picha hazibadilishwi; ukubwa wa kuonyeshwa unadhibitiwa na Hero kwenye ukurasa.
        return {
          id: b.id,
          img: storageUrl || b.image_url || "",
          fallbackImg: b.image_url || storageUrl || "",
          alt: b.title || b.subtitle || "Youflix",
          remote: true,
          storage_path: b.storage_path || null,
        };
      }).filter((b) => !!b.img);
      setState((s) => ({ ...s, promos: remote }));
      if (!remote.length) retryTimer = setTimeout(loadBanners, 8000);
    };
    loadBanners();
    const onOnline = () => loadBanners();
    const onVisible = () => { if (!document.hidden) loadBanners(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      requestId++;
      clearTimeout(retryTimer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
  const promos = useMemo(() => (state.promos || []).concat(PROMOS.filter((p) => !(state.hidePromos || []).includes(p.id))), [state.hidePromos, state.promos]);
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
