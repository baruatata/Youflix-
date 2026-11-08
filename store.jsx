import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { T } from "./i18n.js";
import { PROMOS, VIDEOS } from "./catalog.js";
import { supabase } from "./supabase.js";

// Ufunguo na umbo ni sawa na toleo la HTML, kwa hiyo data ya watumiaji wa zamani inaendelea kufanya kazi.
const KEY = "youflix.v1";
const DEFAULTS = {
  list: [], custom: [], progress: {}, saver: false, light: false, lang: "sw",
  users: [], me: null, promos: [], hidePromos: [], admin: null,
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s && typeof s === "object" ? { ...DEFAULTS, ...s } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  // Pakua Hero banners zinazotumika kutoka Supabase; hifadhi data ya zamani ya kifaa.
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.from("hero_banners")
      .select("id,title,subtitle,image_url,is_active,sort_order,storage_path")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!alive || error || !Array.isArray(data)) return;
        const remote = data.map((b) => ({
          id: b.id, img: b.image_url, alt: b.title || b.subtitle || "",
          remote: true, storage_path: b.storage_path || null,
        }));
        setState((s) => {
          const local = (s.promos || []).filter((p) => !p.remote);
          const oldRemote = (s.promos || []).filter((p) => p.remote);
          const merged = [...local, ...remote];
          return { ...s, promos: merged.length ? merged : oldRemote };
        });
      });
    return () => { alive = false; };
  }, []);
  const [toast, setToast] = useState("");
  const timer = useRef(0);
  const warned = useRef(false);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const t = useCallback((k) => (T[state.lang] && T[state.lang][k]) || T.sw[k] || k, [state.lang]);

  // Hifadhi kila mabadiliko (offline-first: hakuna mtandao unaohitajika)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      warned.current = false;
    } catch {
      if (!warned.current) { warned.current = true; notify(t("storefull")); }
    }
  }, [state, notify, t]);

  useEffect(() => { document.documentElement.lang = state.lang; }, [state.lang]);

  const update = useCallback(
    (patch) => setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) })),
    []
  );

  const videos = useMemo(() => VIDEOS.concat(state.custom), [state.custom]);
  const promos = useMemo(
    () => PROMOS.filter((p) => !(state.hidePromos || []).includes(p.id)).concat(state.promos || []),
    [state.hidePromos, state.promos]
  );
  const me = useMemo(() => state.users.find((u) => u.id === state.me) || null, [state.users, state.me]);

  const logout = useCallback(() => {
    if (!window.confirm(t("a_logoutq"))) return;
    update({ me: null });
    notify(t("a_bye"));
  }, [t, update, notify]);

  const value = useMemo(
    () => ({ state, update, t, notify, toast, videos, promos, me, logout }),
    [state, update, t, notify, toast, videos, promos, me, logout]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
