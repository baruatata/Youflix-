import { useStore } from "./store.jsx";

const L = [["drama", "c_drama"], ["story", "c_story"], ["movie", "c_movie"], ["comedy", "c_comedy"]];

// Chips nne zilizofungwa (hazitelezi). Bonyeza tena chip iliyochaguliwa kuonyesha zote.
export default function Chips({ filt, setFilt }) {
  const { t } = useStore();
  return (
    <>
      <h2 className="sec">{t("categories")}</h2>
      <div className="chips">
      {L.map(([k, label]) => (
        <button key={k} className={"chip" + (filt === k ? " on" : "")}
          onClick={() => setFilt(filt === k ? "all" : k)}>{t(label)}</button>
      ))}
      </div>
    </>
  );
}
