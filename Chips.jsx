const L = [
  ["all", "Video zote"],
  ["drama", "Tamthilia"],
  ["movie", "Filamu"],
  ["mawaidha", "Mawaidha"],
  ["comedy", "Vichekesho"],
  ["documentary", "Documentary"],
];

export default function Chips({ filt, setFilt }) {
  return (
    <div className="chips">
      {L.map(([key, label]) => (
        <button key={key} className={"chip" + (filt === key ? " on" : "")}
          onClick={() => setFilt(key)}>{label}</button>
      ))}
    </div>
  );
}
