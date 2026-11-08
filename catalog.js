/* Katalogi ya Youflix.
   - PROMOS: mabango ya hero (picha tu, hayachezi video).
   - VIDEOS: video za msingi. Video nyingi huongezwa kupitia Admin Panel (kufuli kwenye footer).
   Kutoka Admin > Data > "Pakua catalog.js" unaweza kutengeneza faili hili jipya kwa watumiaji wote.
   Video: { id, title, type: "movie" | "series", genre, year, dur, src (.mp4 au YouTube), poster, desc } */
const B = import.meta.env.BASE_URL;

export const PROMOS = [
  { id: "p0", img: `${B}img/vazi.jpg`, alt: "Vazi la Stara — 28 Dec. on Youflix" },
  { id: "p1", img: `${B}img/ayesha.jpg`, alt: "Ayesha Juice Point — Mango Juice" },
];

export const VIDEOS = [];
