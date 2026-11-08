import Hero from "./Hero.jsx";
import Chips from "./Chips.jsx";
import { Rail } from "./VideoCard.jsx";
import { useStore } from "./store.jsx";
import { canonicalGenre, filterVideos } from "./utils.js";

export default function Home({ filt, setFilt, onOpen }) {
  const { t, videos } = useStore();
  const visibleVideos = filterVideos(videos, filt);
  const groups = ["Tamthilia", "Filamu", "Mawaidha", "Vichekesho"];

  return (
    <>
      <Hero />
      <Chips filt={filt} setFilt={setFilt} />
      {!visibleVideos.length && <p className="empty">{t(videos.length ? "nogroup" : "nocat")}</p>}
      {groups.map((group) => (
        <Rail key={group} title={group}
          items={visibleVideos.filter((video) => canonicalGenre(video.genre) === group)}
          onOpen={onOpen} />
      ))}
    </>
  );
}
