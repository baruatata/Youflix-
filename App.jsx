import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Footer from "./components/Footer";
import Player from "./components/Player";
import Auth from "./components/Auth";
import Admin from "./components/Admin";
import Toast from "./components/Toast";
import { Grid } from "./components/VideoCard";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { useStore } from "./lib/store";

const ROUTES = ["home", "movies", "series", "mylist", "settings"];
const readRoute = () => {
  const r = (location.hash || "#home").slice(1);
  return ROUTES.includes(r) ? r : "home";
};
function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const f = () => setRoute(readRoute());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return route;
}

export default function App() {
  const { state, t, videos, me, logout } = useStore();
  const route = useRoute();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filt, setFilt] = useState("all");
  const [playingId, setPlayingId] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Ukurasa ukibadilika: funga utafutaji na rudi juu
  useEffect(() => { setSearchOpen(false); setQuery(""); window.scrollTo(0, 0); }, [route]);

  // Mandhari na Hifadhi Data
  useEffect(() => {
    document.body.classList.toggle("light", !!state.light);
    document.body.classList.toggle("saver", !!state.saver);
  }, [state.light, state.saver]);

  const playing = playingId ? videos.find((v) => v.id === playingId) : null;
  const overlay = !!playing || authOpen || adminOpen;
  useEffect(() => { document.body.style.overflow = overlay ? "hidden" : ""; }, [overlay]);

  // Escape: funga kilicho juu kwanza
  useEffect(() => {
    const f = (e) => {
      if (e.key !== "Escape") return;
      if (drawer) setDrawer(false);
      else if (adminOpen) setAdminOpen(false);
      else if (authOpen) setAuthOpen(false);
      else if (playingId) setPlayingId(null);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [drawer, adminOpen, authOpen, playingId]);

  const goCategory = useCallback((k) => {
    setFilt(k); setDrawer(false);
    if (location.hash !== "#home") location.hash = "#home"; else window.scrollTo(0, 0);
  }, []);
  const doSearch = useCallback((q) => { setDrawer(false); setSearchOpen(true); setQuery(q); }, []);
  const account = () => (me ? logout() : setAuthOpen(true));
  const open = (id) => setPlayingId(id);

  const q = query.trim().toLowerCase();
  let page;
  if (searchOpen && q) {
    const r = videos.filter((v) => ((v.title || "") + " " + (v.genre || "") + " " + (v.desc || "")).toLowerCase().includes(q));
    page = (<><h2 className="sec">{t("results")}: {q}</h2><Grid items={r} emptyMsg={t("none")} onOpen={open} /></>);
  } else if (route === "movies") {
    page = (<><h2 className="sec">{t("nav_movies")}</h2><Grid items={videos.filter((v) => v.type === "movie")} emptyMsg={t("nomovies")} onOpen={open} /></>);
  } else if (route === "series") {
    page = (<><h2 className="sec">{t("nav_series")}</h2><Grid items={videos.filter((v) => v.type === "series")} emptyMsg={t("noseries")} onOpen={open} /></>);
  } else if (route === "mylist") {
    page = (<><h2 className="sec">{t("nav_mylist")}</h2><Grid items={state.list.map((id) => videos.find((v) => v.id === id)).filter(Boolean)} emptyMsg={t("emptylist")} onOpen={open} /></>);
  } else if (route === "settings") {
    page = <Settings onLogin={() => setAuthOpen(true)} />;
  } else {
    page = <Home filt={filt} setFilt={setFilt} onOpen={open} />;
  }

  return (
    <>
      <Header onMenu={() => setDrawer(true)} onAccount={account}
        onSearch={() => { if (searchOpen) { setSearchOpen(false); setQuery(""); } else setSearchOpen(true); }}
        searchOpen={searchOpen} query={query} setQuery={setQuery} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} route={route} filt={filt}
        onCategory={goCategory} onSearch={doSearch} onLogin={() => setAuthOpen(true)} />
      <main id="app" tabIndex={-1}>{page}</main>
      <Footer onAdmin={() => setAdminOpen(true)} />
      {playing && <Player key={playing.id} video={playing} onClose={() => setPlayingId(null)} />}
      {authOpen && <Auth onClose={() => setAuthOpen(false)} />}
      {adminOpen && <Admin onClose={() => setAdminOpen(false)} />}
      <Toast />
    </>
  );
}
