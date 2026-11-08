import Hero from "./Hero.jsx";
import Chips from "./Chips.jsx";
import { Rail } from "./VideoCard.jsx";
import { useStore } from "./store.jsx";
import { filterVideos } from "./utils.js";

export default function Home({ filt, setFilt, onOpen }) {
  const { state, t, videos } = useStore();
  const v = filterVideos(videos, filt);
  const cont = v.filter((x) => { const p = state.progress[x.id]; return p && p.p > 2 && p.p < 95; });
  const genres = {};
  v.forEach((x) => { (genres[x.genre || "—"] = genres[x.genre || "—"] || []).push(x); });

  return (
    <>
      <Hero />
      <Chips filt={filt} setFilt={setFilt} />
      {!v.length && <p className="empty">{t(videos.length ? "nogroup" : "nocat")}</p>}
      <Rail title={t("cont")} items={cont} onOpen={onOpen} />
      <Rail title={t("c_movie")} items={v.filter((x) => x.type === "movie")} onOpen={onOpen} />
      <Rail title={t("c_series")} items={v.filter((x) => x.type === "series")} onOpen={onOpen} />
      {Object.keys(genres).map((g) => <Rail key={g} title={g} items={genres[g]} onOpen={onOpen} />)}
    </>
  );
}
