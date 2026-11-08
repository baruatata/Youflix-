# Youflix

**Tazama • Stream • Furahia** — jukwaa jepesi la video na burudani kwa Kiswahili. Imejengwa kwa **React + Vite**, offline-first, na inafanya kazi vizuri kwenye simu za hali ya chini.

## Kuanza

Unahitaji Node.js 18 au zaidi.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # inatengeneza folda ya dist/
npm run preview    # jaribu toleo la dist/ (hapa service worker inafanya kazi)
```

## Kuweka kwenye GitHub

```bash
git init
git add .
git commit -m "Youflix: React + Vite"
git branch -M main
git remote add origin https://github.com/lumbwadigital25-prog/Youflix.git
git push -u origin main
```

Kama repo ina kazi ya zamani, tengeneza tawi jipya (`git checkout -b react-rebuild`) kisha ufungue Pull Request.

## Kuweka mtandaoni (Vercel / Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Hakuna mpangilio wa ziada unaohitajika (app inatumia hash-routing: `#home`, `#movies`...).
- Ukiiweka kwenye folda ndogo (mf. GitHub Pages `/Youflix/`), weka `base: "/Youflix/"` kwenye `vite.config.js`. Pia badilisha njia za `/sw.js` na `/img/...` kwenye `public/sw.js` na `public/manifest.json`.

## Muundo

```
public/                 faili zinazotumwa kama zilivyo
  img/                  nembo na mabango ya hero
  manifest.json         PWA (sakinisha kama app)
  sw.js                 service worker (offline)
src/
  main.jsx              mwanzo, splash ya sekunde 3, usajili wa service worker
  App.jsx               kurasa (hash-routing), menyu, utafutaji, player
  styles.css            muonekano wote (fonti Ubuntu Bold)
  data/catalog.js       mabango ya hero na video za msingi
  lib/
    store.jsx           hali ya app + uhifadhi wa localStorage + tafsiri + toast
    i18n.js             tafsiri za Kiswahili na Kiingereza
    utils.js            vifaa vya msaada (namba ya simu, SHA-256, picha, n.k.)
  components/           Header, Drawer, Hero, Chips, VideoCard, Player, Footer, Auth, Admin, Toast, Icon
  pages/                Home, Settings
```

## Jinsi inavyofanya kazi

- **Offline-first:** Orodha Yangu, historia ya kutazama, akaunti na video za admin zinahifadhiwa kwenye `localStorage` (ufunguo `youflix.v1`, sawa na toleo la HTML). Ganda la app linahifadhiwa na service worker baada ya kufunguliwa mara ya kwanza mtandaoni. Video zenyewe zinahitaji mtandao.
- **Nyepesi:** hakuna maktaba za UI, aikoni ni SVG, video haipakiwi mpaka mtumiaji agusa Cheza, na kuna hali ya **Hifadhi Data** (bila picha na uhuishaji).
- **Hero:** mabango na matangazo tu (picha). Haichezi video. Ongeza kwenye `PROMOS` ndani ya `src/data/catalog.js` au kupitia Admin.
- **Chips na menyu:** Thamthilia, Hadithi, Filamu, Vichekesho. Zinachuja kwa kundi (`genre`) la video. Andika kundi hilo hilo ukiongeza video.

## Admin Panel

Gusa **kufuli** kwenye footer. Mara ya kwanza ingiza barua pepe ya admin na utengeneze nenosiri; baadaye utaingia kwa hizo. Barua pepe imehifadhiwa kama alama iliyosimbwa (SHA-256) ndani ya `src/components/Admin.jsx` (`ADMIN_EH`), si wazi. Admin anaweza:

- kuongeza, kuhariri na kufuta video (kiungo cha `.mp4` au YouTube, jalada kutoka kwenye simu au kiungo),
- kuongeza, kuficha au kufuta mabango ya hero,
- kupakua nakala (JSON), kuleta nakala, na kubadilisha nenosiri.

> **Muhimu:** hakuna seva, kwa hiyo mabadiliko ya admin yanabaki kwenye kifaa hicho tu, na ulinzi wa nenosiri ni wa kifaa (si ulinzi wa seva). Ili watumiaji wote waone maudhui, bonyeza **Pakua catalog.js** kwenye tab ya Data, ibadilishe `src/data/catalog.js`, kisha u-deploy upya. Kwa akaunti halisi, SMS na maudhui ya pamoja, hatua inayofuata ni kuunganisha seva (mf. Supabase).

## Muundo wa video

```js
{ id, title, type: "movie" | "series", genre, year, dur, src, poster, desc }
```
`src` inaweza kuwa kiungo cha `.mp4` au cha YouTube (`youtube.com/watch?v=...`, `youtu.be/...`).
