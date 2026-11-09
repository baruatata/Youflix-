/* Katalogi ya Youflix.
   - PROMOS: mabango ya hero (picha tu, hayachezi video).
   - VIDEOS: video za msingi. Video nyingi huongezwa kupitia Admin Panel (kufuli kwenye footer).
   Kutoka Admin > Data > "Pakua catalog.js" unaweza kutengeneza faili hili jipya kwa watumiaji wote.
   Video: { id, title, type: "movie" | "series", genre, year, dur, src (.mp4 au YouTube), poster, desc } */

// Leta picha kama assets za Vite ili zijumuishwe ndani ya build ya production.
// Hii huepusha browser kutafuta picha kwenye URL za root zisizokuwepo baada ya deployment.
import vaziBanner from "./vazi.jpg";
import ayeshaBanner from "./ayesha.jpg";

export const PROMOS = [
  { id: "p0", img: vaziBanner, alt: "Vazi la Stara — 28 Dec. on Youflix" },
  { id: "p1", img: ayeshaBanner, alt: "Ayesha Juice Point — Mango Juice" },
];

export const VIDEOS = [];
