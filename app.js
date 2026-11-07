/* Youflix — JavaScript safi, hakuna maktaba. Inafanya kazi offline (localStorage + service worker). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var KEY = "youflix.v1";

  /* ---------- Lugha (Kiswahili / English) ---------- */
  var T = {
    sw: {
      menu: "Menyu", nav_home: "Nyumbani", nav_movies: "Filamu", nav_series: "Mfululizo", nav_mylist: "Orodha Yangu", nav_settings: "Mipangilio",
      search_ph: "Tafuta filamu, mfululizo...", login: "Ingia", share: "Shiriki", watch: "Tazama Sasa",
      c_all: "Zote", c_movie: "Filamu", c_series: "Mfululizo", c_kids: "Watoto",
      categories: "Makundi", c_drama: "Thamthilia", c_story: "Hadithi", c_comedy: "Vichekesho", foot_tag: "Burudani bila kikomo",
      nocat: "Bado hakuna video. Zitaongezwa hivi karibuni.", ad_title: "Admin Panel", ad_exit: "Toka",
      ad_gate_new: "Weka Nenosiri la Admin", ad_gate_new_sub: "Weka barua pepe ya admin na tengeneza nenosiri (angalau herufi 4). Utalitumia kila unapoingia.", ad_email: "Barua pepe", ad_wrong_login: "Barua pepe au nenosiri si sahihi",
      ad_gate: "Ingia Admin", ad_gate_sub: "Ingia kwa barua pepe ya admin na nenosiri lako.", ad_pass: "Nenosiri", ad_pass2: "Rudia nenosiri",
      ad_open: "Fungua", ad_save_pass: "Hifadhi nenosiri", ad_short: "Angalau herufi 4", ad_mismatch: "Manenosiri hayalingani", ad_wrong: "Nenosiri si sahihi",
      ad_tab_videos: "Video", ad_tab_banners: "Mabango", ad_tab_data: "Data", ad_edit_video: "Hariri Video", ad_f_year: "Mwaka", ad_f_dur: "Muda (mf. 120 dak)",
      ad_f_poster_file: "Au chagua picha kutoka kwenye simu", ad_poster_ok: "✓ Picha imechaguliwa", ad_cancel: "Ghairi", ad_edit: "Hariri",
      ad_no_videos: "Bado hakuna video. Ongeza ya kwanza hapo juu.", ad_title_req: "Andika kichwa", ad_updated: "Video imesasishwa",
      ad_banners: "Mabango ya Hero", ad_banners_sub: "Vifuniko vya video na matangazo. Hayachezi video.", ad_add_banner: "Ongeza Bango",
      ad_banner_alt: "Maelezo mafupi ya bango", ad_banner_file: "Chagua picha ya bango", ad_banner_url: "Au kiungo cha picha", ad_hide: "Ficha",
      ad_restore: "Rudisha mabango yaliyofichwa", ad_need_img: "Chagua picha au weka kiungo", ad_banner_saved: "Bango limeongezwa", ad_builtin: "(la msingi)",
      ad_no_banners: "Hakuna mabango. Hero haitaonekana.", ad_data_title: "Hamisha na Leta",
      ad_data_note: "Mabadiliko yanahifadhiwa kwenye kifaa hiki tu. Ili yaonekane kwa watumiaji wote, pakua data.js, ibadilishe kwenye mradi, kisha uipakie upya.",
      ad_export: "Pakua nakala (JSON)", ad_import: "Leta nakala (JSON)", ad_dl_datajs: "Pakua data.js (kuchapisha)", ad_import_ok: "Imeletwa", ad_import_bad: "Faili si sahihi",
      ad_wipe: "Futa video na mabango ya kifaa hiki", ad_wipe_q: "Futa video na mabango yote ya kifaa hiki?",
      ad_change_pass: "Badilisha Nenosiri la Admin", ad_old_pass: "Nenosiri la sasa", ad_new_pass: "Nenosiri jipya", ad_pass_changed: "Nenosiri limebadilishwa", foot_rights: "Haki zote zimehifadhiwa.",
      cont: "Endelea Kutazama", results: "Matokeo", none: "Hakuna kilichopatikana.",
      nomovies: "Hakuna filamu bado.", noseries: "Hakuna mfululizo bado.", nogroup: "Hakuna video katika kundi hili.",
      emptylist: "Orodha yako ni tupu. Gusa \"+ Orodha Yangu\" kwenye video.",
      add_list: "+ Orodha Yangu", in_list: "✓ Kwenye Orodha", k_movie: "Filamu", k_series: "Mfululizo", badge_series: "MFULULIZO",
      novideo: "Video bado haijaongezwa.", play: "Cheza", close: "Funga", videoerr: "Video haipatikani. Angalia mtandao.",
      set_title: "Mipangilio", saver: "Hifadhi Data (bila picha, bila uhuishaji)", light: "Mandhari Meupe",
      addvideo: "Ongeza Video", f_title: "Kichwa", f_src: "Kiungo cha video (.mp4 au YouTube)", f_poster: "Kiungo cha picha (hiari)",
      f_type: "Aina", f_genre: "Kundi (mf. Bongo, Drama)", f_desc: "Maelezo", f_save: "Hifadhi Video",
      myvideos: "Video Zangu", del: "Futa", nocustom: "Bado hujaongeza video.", clearhist: "Futa Historia ya Kutazama",
      saved: "Video imehifadhiwa", cleared: "Historia imefutwa", badlink: "Kiungo si sahihi", delq: "Futa video hii?",
      offline: "Uko offline — orodha yako bado inafanya kazi", online: "Mtandao umerudi", storefull: "Hifadhi imejaa",
      account: "Akaunti", a_login: "Ingia", a_signup: "Jisajili", a_name: "Jina", a_contact: "Simu au barua pepe",
      a_pass: "Nenosiri (angalau herufi 4)", a_noacc: "Huna akaunti? Jisajili", a_haveacc: "Una akaunti? Ingia",
      a_bad: "Taarifa si sahihi", a_exists: "Akaunti hii tayari ipo", a_welcome: "Karibu", a_bye: "Umetoka",
      a_logoutq: "Toka kwenye akaunti?", a_logout: "Toka", a_local: "Akaunti inahifadhiwa kwenye kifaa hiki tu.",
      a_guest: "Hujaingia",
      back_home: "Rudi Nyumbani", a_welcome_pill: "Karibu Youflix", a_tagline: "Filamu, mfululizo na burudani — ingia ili uanze kutazama.",
      feat1: "Filamu na mfululizo", feat4: "Tazama popote", a_wb: "Karibu Tena", a_wb_sub: "Ingia kwa namba yako ya simu ili uendelee kutazama",
      a_phone: "NAMBA YA SIMU", a_phone_help: "Namba yako inatumika kutambulisha akaunti kwenye kifaa hiki.",
      a_terms_pre: "Nakubali ", a_terms: "Masharti ya Huduma", a_and: " na ", a_privacy: "Sera ya Faragha", a_continue: "Endelea",
      a_secure: "Ingia salama · Data yako inalindwa kwenye kifaa chako",
      a_pass_title_login: "Weka Nenosiri", a_pass_sub_login: "Karibu tena! Weka nenosiri la akaunti yako",
      a_new_title: "Fungua Akaunti", a_new_sub: "Tengeneza nenosiri (angalau herufi 4)", a_pass_label: "NENOSIRI",
      a_name_title: "Jina Lako", a_name_sub: "Tuambie tukuitaje", a_name_label: "JINA", a_finish: "Maliza",
      a_change: "← Badilisha namba", a_show: "Onyesha", a_hide: "Ficha"
    },
    en: {
      menu: "Menu", nav_home: "Home", nav_movies: "Movies", nav_series: "Series", nav_mylist: "My List", nav_settings: "Settings",
      search_ph: "Search movies, series...", login: "Login", share: "Share", watch: "Watch Now",
      c_all: "All", c_movie: "Movies", c_series: "Web Series", c_kids: "Kids",
      categories: "Categories", c_drama: "Drama", c_story: "Stories", c_comedy: "Comedy", foot_tag: "Entertainment without limits",
      nocat: "No videos yet. They will be added soon.", ad_title: "Admin Panel", ad_exit: "Exit",
      ad_gate_new: "Set Admin Password", ad_gate_new_sub: "Enter the admin email and create a password (at least 4 characters). You will use it every time you sign in.", ad_email: "Email", ad_wrong_login: "Wrong email or password",
      ad_gate: "Admin Login", ad_gate_sub: "Sign in with the admin email and your password.", ad_pass: "Password", ad_pass2: "Repeat password",
      ad_open: "Open", ad_save_pass: "Save password", ad_short: "At least 4 characters", ad_mismatch: "Passwords do not match", ad_wrong: "Wrong password",
      ad_tab_videos: "Videos", ad_tab_banners: "Banners", ad_tab_data: "Data", ad_edit_video: "Edit Video", ad_f_year: "Year", ad_f_dur: "Duration (e.g. 120 min)",
      ad_f_poster_file: "Or choose a picture from your phone", ad_poster_ok: "✓ Picture selected", ad_cancel: "Cancel", ad_edit: "Edit",
      ad_no_videos: "No videos yet. Add the first one above.", ad_title_req: "Enter a title", ad_updated: "Video updated",
      ad_banners: "Hero Banners", ad_banners_sub: "Video covers and ads. They do not play video.", ad_add_banner: "Add Banner",
      ad_banner_alt: "Short banner description", ad_banner_file: "Choose banner picture", ad_banner_url: "Or picture link", ad_hide: "Hide",
      ad_restore: "Restore hidden banners", ad_need_img: "Choose a picture or enter a link", ad_banner_saved: "Banner added", ad_builtin: "(built-in)",
      ad_no_banners: "No banners. The hero will not show.", ad_data_title: "Export and Import",
      ad_data_note: "Changes are stored on this device only. To show them to all users, download data.js, replace it in the project, then upload it again.",
      ad_export: "Download backup (JSON)", ad_import: "Import backup (JSON)", ad_dl_datajs: "Download data.js (to publish)", ad_import_ok: "Imported", ad_import_bad: "Invalid file",
      ad_wipe: "Delete this device's videos and banners", ad_wipe_q: "Delete all videos and banners on this device?",
      ad_change_pass: "Change Admin Password", ad_old_pass: "Current password", ad_new_pass: "New password", ad_pass_changed: "Password changed", foot_rights: "All rights reserved.",
      cont: "Continue Watching", results: "Results", none: "Nothing found.",
      nomovies: "No movies yet.", noseries: "No series yet.", nogroup: "No videos in this group.",
      emptylist: "Your list is empty. Tap \"+ My List\" on a video.",
      add_list: "+ My List", in_list: "✓ In My List", k_movie: "Movie", k_series: "Series", badge_series: "SERIES",
      novideo: "No video added yet.", play: "Play", close: "Close", videoerr: "Video unavailable. Check your connection.",
      set_title: "Settings", saver: "Data Saver (no images, no animation)", light: "Light Theme",
      addvideo: "Add Video", f_title: "Title", f_src: "Video link (.mp4 or YouTube)", f_poster: "Poster link (optional)",
      f_type: "Type", f_genre: "Genre (e.g. Bongo, Drama)", f_desc: "Description", f_save: "Save Video",
      myvideos: "My Videos", del: "Delete", nocustom: "You haven't added any videos yet.", clearhist: "Clear Watch History",
      saved: "Video saved", cleared: "History cleared", badlink: "Invalid link", delq: "Delete this video?",
      offline: "You are offline — your list still works", online: "Back online", storefull: "Storage is full",
      account: "Account", a_login: "Login", a_signup: "Sign up", a_name: "Name", a_contact: "Phone or email",
      a_pass: "Password (at least 4 characters)", a_noacc: "No account? Sign up", a_haveacc: "Have an account? Login",
      a_bad: "Wrong details", a_exists: "This account already exists", a_welcome: "Welcome", a_bye: "Logged out",
      a_logoutq: "Log out of your account?", a_logout: "Logout", a_local: "Your account is stored on this device only.",
      a_guest: "Not logged in",
      back_home: "Back to home", a_welcome_pill: "Welcome to Youflix", a_tagline: "Movies, series and entertainment — sign in to start watching.",
      feat1: "Movies & series", feat4: "Watch anywhere", a_wb: "Welcome Back", a_wb_sub: "Sign in with your phone to continue watching",
      a_phone: "PHONE NUMBER", a_phone_help: "Your number identifies your account on this device.",
      a_terms_pre: "I agree to the ", a_terms: "Terms of Service", a_and: " and ", a_privacy: "Privacy Policy", a_continue: "Continue",
      a_secure: "Secure sign-in · Your data stays protected on your device",
      a_pass_title_login: "Enter Password", a_pass_sub_login: "Welcome back! Enter your account password",
      a_new_title: "Create Account", a_new_sub: "Create a password (at least 4 characters)", a_pass_label: "PASSWORD",
      a_name_title: "Your Name", a_name_sub: "Tell us what to call you", a_name_label: "NAME", a_finish: "Finish",
      a_change: "← Change number", a_show: "Show", a_hide: "Hide"
    }
  };

  /* ---------- Hifadhi (localStorage, salama) ---------- */
  var state = { list: [], custom: [], progress: {}, saver: false, light: false, lang: "sw", users: [], me: null, promos: [], hidePromos: [], admin: null };
  try { var s = JSON.parse(localStorage.getItem(KEY)); if (s) for (var k in s) state[k] = s[k]; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast(t("storefull")); } }
  function t(k) { return (T[state.lang] || T.sw)[k] || T.sw[k] || k; }
  function all() { return (window.YOUFLIX_VIDEOS || []).concat(state.custom); }
  function byId(id) { return all().filter(function (v) { return v.id === id; })[0]; }

  /* ---------- Vifaa ---------- */
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hue(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360; return h; }
  function bg(v) {
    if (v.poster && !state.saver) return "background-image:url('" + esc(v.poster) + "')";
    var h = hue(v.title);
    return "background-image:linear-gradient(160deg,hsl(" + h + ",60%,28%),hsl(" + ((h + 40) % 360) + ",70%,10%))";
  }
  function toast(m) { var el = $("#toast"); el.textContent = m; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 2200); }
  function ytId(u) { var m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; }
  function inList(id) { return state.list.indexOf(id) > -1; }

  /* ---------- Kadi ---------- */
  function card(v) {
    var pct = state.progress[v.id] && state.progress[v.id].p;
    return '<div class="card" data-id="' + esc(v.id) + '" role="button" tabindex="0">' +
      '<div class="poster" style="' + bg(v) + '">' + esc(v.title) + '</div>' +
      (v.type === "series" ? '<span class="badge">' + t("badge_series") + '</span>' : '') +
      (pct ? '<span class="tag">' + Math.round(pct) + '%</span>' : '') +
      '<small>' + esc(v.genre || "") + (v.year ? " • " + esc(v.year) : "") + '</small></div>';
  }
  function rail(title, items) {
    if (!items.length) return "";
    return '<h2 class="sec">' + esc(title) + '</h2><div class="rail">' + items.map(card).join("") + '</div>';
  }
  function grid(items, emptyMsg) {
    return items.length ? '<div class="grid">' + items.map(card).join("") + '</div>' : '<p class="empty">' + emptyMsg + '</p>';
  }

  /* ---------- Hero (picha zinazobadilika: matangazo + video zilizochaguliwa) ---------- */
  var heroTimer, heroIdx = 0;
  function heroHTML() { // mabango na matangazo tu — hayachezi video
    var P = allPromos();
    if (!P.length || state.saver) return ""; // Hifadhi Data: bila picha nzito
    return '<section class="hero" id="hero" aria-roledescription="carousel">' + P.map(function (p, i) {
      return '<div class="slide promo' + (i ? "" : " on") + '" role="img" aria-label="' + esc(p.alt || "") + '" style="background-image:url(\'' + esc(p.img) + '\')"></div>';
    }).join("") + (P.length > 1 ? '<div class="dots">' + P.map(function (_, i) { return '<b class="' + (i ? "" : "on") + '"></b>'; }).join("") + '</div>' : "") + '</section>';
  }
  function startHero() {
    clearInterval(heroTimer); heroIdx = 0;
    var h = $("#hero"); if (!h) return;
    var sl = h.querySelectorAll(".slide"), dt = h.querySelectorAll(".dots b");
    if (sl.length < 2) return;
    function go(n) {
      sl[heroIdx].classList.remove("on"); dt[heroIdx].classList.remove("on");
      heroIdx = (n + sl.length) % sl.length;
      sl[heroIdx].classList.add("on"); dt[heroIdx].classList.add("on");
    }
    var x0 = null; // telezesha kushoto/kulia kubadili picha
    h.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    h.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(heroIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    if (state.saver) return;
    heroTimer = setInterval(function () { if (!document.hidden) go(heroIdx + 1); }, 4500);
  }

  /* ---------- Kuchuja (chips) ---------- */
  var filt = "all";
  var RX = { drama: /thamthilia|drama/i, story: /hadithi|stor/i, comedy: /vichekesho|comedy/i, kids: /katuni|watoto|kids|cartoon/i };
  function filtered() {
    var v = all();
    if (filt === "movie") return v.filter(function (x) { return x.type === "movie"; });
    if (filt === "series") return v.filter(function (x) { return x.type === "series"; });
    if (RX[filt]) return v.filter(function (x) { return RX[filt].test(x.genre || ""); });
    return v;
  }
  function chips() { // bonyeza tena chip iliyochaguliwa kuonyesha zote
    var L = [["drama", "c_drama"], ["story", "c_story"], ["movie", "c_movie"], ["comedy", "c_comedy"]];
    return '<div class="chips">' + L.map(function (c) {
      return '<button class="chip' + (filt === c[0] ? " on" : "") + '" data-f="' + c[0] + '">' + t(c[1]) + '</button>';
    }).join("") + '</div>';
  }

  /* ---------- Akaunti (kwenye kifaa hiki tu) ---------- */
  function me() { return state.users.filter(function (u) { return u.id === state.me; })[0]; }
  function sha(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      });
    }
    var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return Promise.resolve("f" + h);
  }
  function updateTop() {
    var u = me();
    $("#btnLogin").textContent = u ? "👤 " + u.name.split(" ")[0] : t("login");
    renderDrawer();
  }
  /* ---------- Kuingia: ukurasa kamili wa hatua 3 (namba ya simu → nenosiri → jina) ---------- */
  var CHECK = '<svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ARROW = '<svg class="ico" viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var AU = { step: 1, phoneRaw: "", phone: "", exists: false, agree: false, pass: "" };

  function normPhone(raw) { // 0712 345 678 | 712345678 | +255712345678 → "255712345678"
    var d = String(raw).replace(/\D/g, "");
    if (d.indexOf("255") === 0 && d.length > 9) d = d.slice(3);
    if (d.charAt(0) === "0") d = d.slice(1);
    return d.length === 9 ? "255" + d : "";
  }
  function fmtPhone(c) {
    var m = /^255(\d{3})(\d{3})(\d{3})$/.exec(c || "");
    return m ? "+255 " + m[1] + " " + m[2] + " " + m[3] : esc(c);
  }
  function stepsHTML(n) {
    function c(k) { return n === k ? "on" : (n > k ? "done" : ""); }
    return '<div class="steps"><b class="' + c(1) + '">' + (n > 1 ? CHECK : "1") + '</b><i></i><b class="' + c(2) + '">' + (n > 2 ? CHECK : "2") + '</b><i></i><b class="' + c(3) + '">3</b></div>';
  }
  function renderAuth() {
    var s = AU.step, title, sub, body, btn;
    if (s === 1) {
      title = t("a_wb"); sub = t("a_wb_sub"); btn = t("a_continue");
      body = '<label class="ap-label" for="apPhone">' + t("a_phone") + '</label>' +
        '<div class="phone"><span class="cc"><i class="flag"></i><svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px;color:#a8a8ad"><path d="M6 9l6 6 6-6"/></svg></span>' +
        '<span class="pre">+255</span><input id="apPhone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="000 000 000" maxlength="14" value="' + esc(AU.phoneRaw) + '"></div>' +
        '<p class="help">' + t("a_phone_help") + '</p>' +
        '<label class="agree"><input type="checkbox" id="apAgree"' + (AU.agree ? " checked" : "") + '><span class="bx">' + CHECK + '</span>' +
        '<span>' + t("a_terms_pre") + '<em>' + t("a_terms") + '</em>' + t("a_and") + '<em>' + t("a_privacy") + '</em></span></label>';
    } else if (s === 2) {
      title = AU.exists ? t("a_pass_title_login") : t("a_new_title");
      sub = AU.exists ? t("a_pass_sub_login") : t("a_new_sub");
      btn = AU.exists ? t("login") : t("a_continue");
      body = '<button type="button" class="ap-link" id="apChange">' + t("a_change") + ' (' + fmtPhone(AU.phone) + ')</button>' +
        '<label class="ap-label" for="apPass">' + t("a_pass_label") + '</label>' +
        '<div class="fieldwrap"><input id="apPass" type="password" autocomplete="' + (AU.exists ? "current-password" : "new-password") + '" placeholder="••••" maxlength="60">' +
        '<button type="button" class="eye" id="apEye">' + t("a_show") + '</button></div><p class="help"></p>';
    } else {
      title = t("a_name_title"); sub = t("a_name_sub"); btn = t("a_finish");
      body = '<label class="ap-label" for="apName">' + t("a_name_label") + '</label>' +
        '<div class="fieldwrap"><input id="apName" type="text" autocomplete="name" maxlength="40"></div><p class="help"></p>';
    }
    $("#auth").innerHTML = '<form class="ap" id="authForm" novalidate>' +
      '<div class="ap-top"><button type="button" class="ap-back" id="apBack"><svg class="ico" viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' + t("back_home") + '</button>' +
      '<span class="brand" role="img" aria-label="Youflix"></span></div>' +
      '<span class="wpill"><svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>' + t("a_welcome_pill") + '</span>' +
      '<p class="ap-sub">' + t("a_tagline") + '</p>' +
      '<div class="ap-feats"><span>' + ico("movies") + t("feat1") + '</span><span>' + ico("kids") + t("c_kids") + '</span><span>' + ico("mylist") + t("nav_mylist") + '</span><span>' + ico("series") + t("feat4") + '</span></div>' +
      '<div class="ap-card">' + stepsHTML(s) + '<h2>' + title + '</h2><p class="sub">' + sub + '</p>' + body +
      '<button class="ap-btn" id="apBtn" disabled>' + btn + ' ' + ARROW + '</button></div>' +
      '<p class="ap-foot">' + t("a_secure") + '</p></form>';
    apSync();
  }
  function apValid() {
    if (AU.step === 1) return !!normPhone($("#apPhone").value) && $("#apAgree").checked;
    if (AU.step === 2) return $("#apPass").value.length >= (AU.exists ? 1 : 4);
    return $("#apName").value.trim().length >= 2;
  }
  function apSync() {
    var b = $("#apBtn"); if (!b) return;
    var ok = apValid(); b.disabled = !ok; b.classList.toggle("on", ok);
  }
  function openAuth() {
    AU = { step: 1, phoneRaw: "", phone: "", exists: false, agree: false, pass: "" };
    var box = $("#auth"); renderAuth();
    box.hidden = false; box.scrollTop = 0; document.body.style.overflow = "hidden";
    // makusudi hatuweki focus hapa: kibodi ikifunguka yenyewe simu zinazoom na ukurasa unaruka
  }
  function closeAuth() {
    $("#auth").hidden = true; $("#auth").innerHTML = "";
    if ($("#player").hidden) document.body.style.overflow = "";
  }
  function logout() { state.me = null; save(); updateTop(); toast(t("a_bye")); refresh(); }
  function loginAs(u) {
    state.me = u.id; save(); closeAuth(); updateTop();
    toast(t("a_welcome") + ", " + u.name.split(" ")[0]); refresh();
  }
  function submitAuth() {
    if (!apValid()) return;
    if (AU.step === 1) {
      AU.phone = normPhone($("#apPhone").value); AU.agree = true;
      AU.exists = state.users.some(function (u) { return u.contact === AU.phone; });
      AU.step = 2; renderAuth(); var p = $("#apPass"); if (p) p.focus();
      return;
    }
    if (AU.step === 2) {
      var pass = $("#apPass").value;
      if (AU.exists) {
        var user = state.users.filter(function (u) { return u.contact === AU.phone; })[0];
        sha(user.salt + pass).then(function (hash) {
          if (hash !== user.hash) { toast(t("a_bad")); var pp = $("#apPass"); if (pp) pp.value = ""; apSync(); return; }
          loginAs(user);
        });
      } else {
        AU.pass = pass; AU.step = 3; renderAuth(); var n = $("#apName"); if (n) n.focus();
      }
      return;
    }
    var name = $("#apName").value.trim(), salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sha(salt + AU.pass).then(function (hash) {
      var u = { id: "u" + Date.now(), name: name, contact: AU.phone, salt: salt, hash: hash };
      state.users.push(u); AU.pass = ""; loginAs(u);
    });
  }
  (function () {
    var box = $("#auth");
    function sync(e) {
      if (e.target.id === "apPhone") AU.phoneRaw = e.target.value;
      if (e.target.id === "apAgree") AU.agree = e.target.checked;
      apSync();
    }
    box.addEventListener("input", sync);
    box.addEventListener("change", sync);
    box.addEventListener("click", function (e) {
      if (e.target.closest("#apBack")) return closeAuth();
      if (e.target.closest("#apChange")) { AU.step = 1; return renderAuth(); }
      var eye = e.target.closest("#apEye");
      if (eye) { var p = $("#apPass"), show = p.type === "password"; p.type = show ? "text" : "password"; eye.textContent = t(show ? "a_hide" : "a_show"); }
    });
    box.addEventListener("submit", function (e) { e.preventDefault(); submitAuth(); });
  })();

  /* ---------- Admin Panel (kufuli kwenye footer) ---------- */
  var LOCK = '<svg class="ico" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var AD = { unlocked: false, tab: "videos", edit: null, poster: null, banner: null };
  var GENRES = ["Thamthilia", "Hadithi", "Vichekesho", "Matukio", "Bongo", "Muziki"];

  function allPromos() {
    var hid = state.hidePromos || [];
    return (window.YOUFLIX_PROMOS || []).filter(function (p) { return hid.indexOf(p.id) < 0; }).concat(state.promos || []);
  }
  function okImg(s) { return typeof s === "string" && /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/i.test(s); }
  function readImage(file, maxW, cb) { // punguza picha ili iwe nyepesi (JPEG)
    var r = new FileReader();
    r.onerror = function () { cb(null); };
    r.onload = function () {
      var im = new Image();
      im.onerror = function () { cb(null); };
      im.onload = function () {
        var w = Math.min(maxW, im.width), h = Math.round(im.height * w / im.width);
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(im, 0, 0, w, h);
        cb(c.toDataURL("image/jpeg", 0.72));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function download(name, text, mime) {
    var b = new Blob([text], { type: mime }), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
  }

  function openAdmin() {
    AD.tab = "videos"; AD.edit = null; AD.poster = null; AD.banner = null;
    $("#admin").hidden = false; $("#admin").scrollTop = 0; document.body.style.overflow = "hidden";
    if (AD.unlocked) renderAdmin(); else renderGate();
  }
  function closeAdmin() {
    $("#admin").hidden = true; $("#admin").innerHTML = ""; AD.unlocked = false;
    if ($("#player").hidden && $("#auth").hidden) document.body.style.overflow = "";
    refresh();
  }
  // Barua pepe ya admin haiko wazi kwenye msimbo — kuna alama yake iliyosimbwa (SHA-256) tu
  var ADMIN_EH = ["2c643d903efe35e90cbb70afe09bc31799bb96f0c7525e1f34802165910b51e4", "f1023948892"];
  function emailOk(em) { return sha(em.trim().toLowerCase()).then(function (h) { return ADMIN_EH.indexOf(h) > -1; }); }
  function renderGate() {
    var setup = !state.admin;
    $("#admin").innerHTML = '<form class="ad-gate" id="adGate" data-mode="' + (setup ? "new" : "login") + '" novalidate>' +
      '<button type="button" class="close" id="adClose" aria-label="' + t("close") + '">&#10005;</button>' +
      '<div class="ad-lock">' + LOCK + '</div><h2>' + t(setup ? "ad_gate_new" : "ad_gate") + '</h2>' +
      '<p class="sub">' + t(setup ? "ad_gate_new_sub" : "ad_gate_sub") + '</p>' +
      '<input type="email" id="adEmail" placeholder="' + t("ad_email") + '" autocomplete="username" inputmode="email" autocapitalize="off" spellcheck="false" maxlength="80">' +
      '<input type="password" id="adPass" placeholder="' + t("ad_pass") + '" autocomplete="' + (setup ? "new-password" : "current-password") + '" maxlength="60">' +
      (setup ? '<input type="password" id="adPass2" placeholder="' + t("ad_pass2") + '" autocomplete="new-password" maxlength="60">' : '') +
      '<button class="ap-btn on" type="submit">' + t(setup ? "ad_save_pass" : "ad_open") + '</button></form>';
  }
  function gateSubmit(form) {
    var em = $("#adEmail").value, p = $("#adPass").value, setup = form.dataset.mode === "new";
    if (!em.trim() || !p) return toast(t("ad_wrong_login"));
    if (setup) {
      if (p.length < 4) return toast(t("ad_short"));
      if (p !== $("#adPass2").value) return toast(t("ad_mismatch"));
    }
    emailOk(em).then(function (ok) {
      if (!ok) { toast(t("ad_wrong_login")); return; }
      if (setup) {
        var salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
        return sha(salt + p).then(function (h) { state.admin = { salt: salt, hash: h }; save(); AD.unlocked = true; renderAdmin(); });
      }
      return sha(state.admin.salt + p).then(function (h) {
        if (h !== state.admin.hash) { toast(t("ad_wrong_login")); $("#adPass").value = ""; return; }
        AD.unlocked = true; renderAdmin();
      });
    });
  }

  function renderAdmin(keep) {
    var box = $("#admin"), st = box.scrollTop;
    var tabs = [["videos", "ad_tab_videos"], ["banners", "ad_tab_banners"], ["data", "ad_tab_data"]];
    box.innerHTML = '<div class="ad"><div class="ad-top"><h1>' + LOCK + t("ad_title") + '</h1>' +
      '<button class="ap-back" id="adClose">' + t("ad_exit") + '</button></div>' +
      '<div class="ad-tabs">' + tabs.map(function (x) { return '<button class="chip' + (AD.tab === x[0] ? " on" : "") + '" data-atab="' + x[0] + '">' + t(x[1]) + '</button>'; }).join("") + '</div>' +
      (AD.tab === "videos" ? adVideos() : AD.tab === "banners" ? adBanners() : adData()) + '</div>';
    box.scrollTop = keep ? st : 0;
  }
  function adVideos() {
    var e = AD.edit ? (state.custom.filter(function (c) { return c.id === AD.edit; })[0] || {}) : {};
    var purl = e.poster && !/^data:/.test(e.poster) ? e.poster : "";
    var list = state.custom.slice().reverse().map(function (c) {
      return '<div class="ad-row"><span class="th" style="' + bg(c) + '"></span><span class="info"><b>' + esc(c.title) + '</b><small>' +
        esc([c.type === "series" ? t("k_series") : t("k_movie"), c.genre, c.year].filter(Boolean).join(" • ")) + '</small></span>' +
        '<button class="btn ghost" data-aedit="' + esc(c.id) + '">' + t("ad_edit") + '</button>' +
        '<button class="btn ghost" data-adel="' + esc(c.id) + '">' + t("del") + '</button></div>';
    }).join("");
    return '<h2 class="sec">' + t(e.id ? "ad_edit_video" : "addvideo") + '</h2>' +
      '<form class="form" id="adVideoForm">' +
      '<label>' + t("f_title") + '<input name="title" required maxlength="80" value="' + esc(e.title || "") + '"></label>' +
      '<label>' + t("f_src") + '<input name="src" type="url" placeholder="https://..." value="' + esc(e.src || "") + '"></label>' +
      '<label>' + t("f_type") + '<select name="type"><option value="movie"' + (e.type !== "series" ? " selected" : "") + '>' + t("k_movie") + '</option><option value="series"' + (e.type === "series" ? " selected" : "") + '>' + t("k_series") + '</option></select></label>' +
      '<label>' + t("f_genre") + '<input name="genre" list="adGenres" maxlength="30" value="' + esc(e.genre || "") + '"></label>' +
      '<datalist id="adGenres">' + GENRES.map(function (g) { return '<option value="' + g + '">'; }).join("") + '</datalist>' +
      '<label>' + t("ad_f_year") + '<input name="year" type="number" inputmode="numeric" min="1900" max="2100" value="' + esc(e.year || new Date().getFullYear()) + '"></label>' +
      '<label>' + t("ad_f_dur") + '<input name="dur" maxlength="20" value="' + esc(e.dur || "") + '"></label>' +
      '<label>' + t("f_desc") + '<input name="desc" maxlength="300" value="' + esc(e.desc || "") + '"></label>' +
      '<label>' + t("f_poster") + '<input name="posterUrl" type="url" placeholder="https://..." value="' + esc(purl) + '"></label>' +
      '<label>' + t("ad_f_poster_file") + '<input type="file" id="adPosterFile" accept="image/*"></label>' +
      '<p class="help" id="adPosterOk">' + (AD.poster ? t("ad_poster_ok") : "") + '</p>' +
      '<button class="btn" type="submit">' + t("f_save") + '</button>' +
      (e.id ? '<button class="btn ghost" type="button" id="adCancel">' + t("ad_cancel") + '</button>' : '') + '</form>' +
      '<h2 class="sec">' + t("myvideos") + ' (' + state.custom.length + ')</h2>' +
      (list || '<p class="empty">' + t("ad_no_videos") + '</p>');
  }
  function adSaveVideo(form) {
    var f = new FormData(form), o = {};
    f.forEach(function (v, k) { if (typeof v === "string") o[k] = v.trim(); });
    if (!o.title) return toast(t("ad_title_req"));
    if (o.src && !/^https?:\/\//i.test(o.src)) return toast(t("badlink"));
    var poster = AD.poster || (/^https?:\/\//i.test(o.posterUrl || "") ? o.posterUrl : "");
    var rec = { title: o.title, src: o.src || "", type: o.type === "series" ? "series" : "movie", genre: o.genre || "",
      year: parseInt(o.year, 10) || new Date().getFullYear(), dur: o.dur || "", desc: o.desc || "" };
    if (poster) rec.poster = poster;
    var i = AD.edit ? state.custom.map(function (c) { return c.id; }).indexOf(AD.edit) : -1;
    if (i > -1) { rec.id = AD.edit; state.custom[i] = rec; } else { rec.id = "c" + Date.now(); state.custom.push(rec); }
    save(); toast(t(i > -1 ? "ad_updated" : "saved"));
    AD.edit = null; AD.poster = null; renderAdmin();
  }
  function adBanners() {
    var hid = state.hidePromos || [], mine = (state.promos || []).map(function (p) { return p.id; });
    var rows = allPromos().map(function (p) {
      var custom = mine.indexOf(p.id) > -1;
      return '<div class="ad-row"><span class="th" style="background-image:url(\'' + esc(p.img) + '\')"></span><span class="info"><b>' + esc(p.alt || "—") + '</b>' +
        (custom ? "" : '<small>' + t("ad_builtin") + '</small>') + '</span>' +
        '<button class="btn ghost" data-pdel="' + esc(p.id) + '">' + t(custom ? "del" : "ad_hide") + '</button></div>';
    }).join("");
    return '<h2 class="sec">' + t("ad_banners") + '</h2><p class="help" style="padding:0 14px">' + t("ad_banners_sub") + '</p>' + (rows || '<p class="empty">' + t("ad_no_banners") + '</p>') +
      (hid.length ? '<div class="set"><button class="btn ghost" id="adRestore">' + t("ad_restore") + '</button></div>' : '') +
      '<h2 class="sec">' + t("ad_add_banner") + '</h2>' +
      '<form class="form" id="adBannerForm">' +
      '<label>' + t("ad_banner_alt") + '<input name="alt" maxlength="100"></label>' +
      '<label>' + t("ad_banner_file") + '<input type="file" id="adBannerFile" accept="image/*"></label>' +
      '<p class="help" id="adBannerOk">' + (AD.banner ? t("ad_poster_ok") : "") + '</p>' +
      '<label>' + t("ad_banner_url") + '<input name="url" type="url" placeholder="https://..."></label>' +
      '<button class="btn" type="submit">' + t("ad_add_banner") + '</button></form>';
  }
  function adAddBanner(form) {
    var f = new FormData(form), url = String(f.get("url") || "").trim(), alt = String(f.get("alt") || "").trim();
    var img = AD.banner || (/^https?:\/\//i.test(url) ? url : "");
    if (!img) return toast(t("ad_need_img"));
    (state.promos = state.promos || []).push({ id: "bp" + Date.now(), img: img, alt: alt });
    save(); AD.banner = null; toast(t("ad_banner_saved")); renderAdmin();
  }
  function adData() {
    return '<h2 class="sec">' + t("ad_data_title") + '</h2><p class="help" style="padding:0 14px 6px">' + t("ad_data_note") + '</p>' +
      '<div class="set">' +
      '<button class="btn" id="adDatajs">' + t("ad_dl_datajs") + '</button>' +
      '<button class="btn ghost" id="adExport">' + t("ad_export") + '</button>' +
      '<label>' + t("ad_import") + '<input type="file" id="adImportFile" accept="application/json,.json"></label>' +
      '<button class="btn ghost" id="adWipe">' + t("ad_wipe") + '</button></div>' +
      '<h2 class="sec">' + t("ad_change_pass") + '</h2>' +
      '<form class="form" id="adPassForm">' +
      '<label>' + t("ad_old_pass") + '<input name="old" type="password" autocomplete="current-password" maxlength="60"></label>' +
      '<label>' + t("ad_new_pass") + '<input name="nw" type="password" autocomplete="new-password" maxlength="60"></label>' +
      '<button class="btn" type="submit">' + t("ad_save_pass") + '</button></form>';
  }
  function adChangePass(form) {
    var f = new FormData(form), old = String(f.get("old") || ""), nw = String(f.get("nw") || "");
    if (nw.length < 4) return toast(t("ad_short"));
    sha(state.admin.salt + old).then(function (h) {
      if (h !== state.admin.hash) return toast(t("ad_wrong"));
      var salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
      return sha(salt + nw).then(function (h2) { state.admin = { salt: salt, hash: h2 }; save(); toast(t("ad_pass_changed")); form.reset(); });
    });
  }
  function adImport(file) {
    var r = new FileReader();
    r.onerror = function () { toast(t("ad_import_bad")); };
    r.onload = function () {
      var j; try { j = JSON.parse(r.result); } catch (x) { return toast(t("ad_import_bad")); }
      if (!j || typeof j !== "object" || !Array.isArray(j.videos)) return toast(t("ad_import_bad"));
      var n = 0;
      j.videos.forEach(function (v) {
        if (!v || typeof v.title !== "string" || !v.title.trim()) return;
        var rec = { id: /^c\d+$/.test(v.id) ? v.id : "c" + Date.now() + n, title: v.title.slice(0, 80), src: /^https?:\/\//i.test(v.src) ? v.src : "",
          type: v.type === "series" ? "series" : "movie", genre: String(v.genre || "").slice(0, 30), year: parseInt(v.year, 10) || new Date().getFullYear(),
          dur: String(v.dur || "").slice(0, 20), desc: String(v.desc || "").slice(0, 300) };
        if (okImg(v.poster)) rec.poster = v.poster;
        var i = state.custom.map(function (c) { return c.id; }).indexOf(rec.id);
        if (i > -1) state.custom[i] = rec; else state.custom.push(rec);
        n++;
      });
      (Array.isArray(j.promos) ? j.promos : []).forEach(function (p) {
        if (!p || !okImg(p.img)) return;
        var id = /^bp\d+$/.test(p.id) ? p.id : "bp" + Date.now() + n;
        state.promos = (state.promos || []).filter(function (x) { return x.id !== id; });
        state.promos.push({ id: id, img: p.img, alt: String(p.alt || "").slice(0, 100) }); n++;
      });
      save(); toast(t("ad_import_ok") + " (" + n + ")"); renderAdmin();
    };
    r.readAsText(file);
  }

  (function () {
    var box = $("#admin");
    box.addEventListener("click", function (e) {
      var el;
      if (e.target.closest("#adClose")) return closeAdmin();
      if ((el = e.target.closest("[data-atab]"))) { AD.tab = el.dataset.atab; AD.edit = null; AD.poster = null; AD.banner = null; return renderAdmin(); }
      if ((el = e.target.closest("[data-aedit]"))) {
        AD.edit = el.dataset.aedit;
        var c = state.custom.filter(function (x) { return x.id === AD.edit; })[0];
        AD.poster = c && /^data:/.test(c.poster || "") ? c.poster : null;
        return renderAdmin();
      }
      if (e.target.closest("#adCancel")) { AD.edit = null; AD.poster = null; return renderAdmin(); }
      if ((el = e.target.closest("[data-adel]"))) {
        if (!confirm(t("delq"))) return;
        state.custom = state.custom.filter(function (c) { return c.id !== el.dataset.adel; });
        state.list = state.list.filter(function (i) { return i !== el.dataset.adel; });
        if (AD.edit === el.dataset.adel) AD.edit = null;
        save(); return renderAdmin(true);
      }
      if ((el = e.target.closest("[data-pdel]"))) {
        var pid = el.dataset.pdel;
        if (!confirm(t("delq"))) return;
        if ((state.promos || []).some(function (p) { return p.id === pid; })) state.promos = state.promos.filter(function (p) { return p.id !== pid; });
        else (state.hidePromos = state.hidePromos || []).push(pid);
        save(); return renderAdmin(true);
      }
      if (e.target.closest("#adRestore")) { state.hidePromos = []; save(); return renderAdmin(true); }
      if (e.target.closest("#adExport")) return download("youflix-nakala.json", JSON.stringify({ v: 1, videos: state.custom, promos: state.promos || [] }), "application/json");
      if (e.target.closest("#adDatajs")) {
        return download("data.js", "/* Imetengenezwa na Admin Panel — " + new Date().toISOString().slice(0, 10) + " */\nwindow.YOUFLIX_PROMOS = " + JSON.stringify(allPromos(), null, 1) + ";\nwindow.YOUFLIX_VIDEOS = " + JSON.stringify(all(), null, 1) + ";\n", "text/javascript");
      }
      if (e.target.closest("#adWipe")) {
        if (!confirm(t("ad_wipe_q"))) return;
        state.custom = []; state.promos = []; state.hidePromos = []; state.list = []; save(); toast(t("cleared")); return renderAdmin();
      }
    });
    box.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (e.target.id === "adPosterFile" && file) readImage(file, 400, function (d) { AD.poster = d; $("#adPosterOk").textContent = d ? t("ad_poster_ok") : t("ad_import_bad"); });
      if (e.target.id === "adBannerFile" && file) readImage(file, 720, function (d) { AD.banner = d; $("#adBannerOk").textContent = d ? t("ad_poster_ok") : t("ad_import_bad"); });
      if (e.target.id === "adImportFile" && file) { adImport(file); e.target.value = ""; }
    });
    box.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = e.target.id;
      if (id === "adGate") return gateSubmit(e.target);
      if (id === "adVideoForm") return adSaveVideo(e.target);
      if (id === "adBannerForm") return adAddBanner(e.target);
      if (id === "adPassForm") return adChangePass(e.target);
    });
  })();

  /* ---------- Menyu ya kushoto (drawer) ---------- */
  var ICONS = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    movies: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    series: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
    kids: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    mylist: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    drama: '<path d="M4 4h16v8a8 8 0 0 1-16 0z"/><path d="M8.5 10h.01M15.5 10h.01M9 15.5s1.2 1.5 3 1.5 3-1.5 3-1.5"/>',
    story: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    comedy: '<circle cx="12" cy="12" r="9"/><path d="M8 13.5c1 2.5 7 2.5 8 0z"/><path d="M9 9h.01M15 9h.01"/>'
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24">' + ICONS[n] + '</svg>'; }
  function curTab() { var tb = (location.hash || "#home").slice(1); return views[tb] ? tb : "home"; }
  function renderDrawer() {
    var tb = curTab(), u = me();
    function item(key, href, label, on, extra) {
      return '<a href="' + href + '"' + (extra || "") + (on ? ' class="on"' : "") + '>' + ico(key) + '<span>' + label + '</span></a>';
    }
    function cat(key, label) { return item(key === "movie" ? "movies" : key, "#home", label, tb === "home" && filt === key, ' data-nav="' + key + '"'); }
    $("#drNav").innerHTML =
      item("home", "#home", t("nav_home"), tb === "home" && filt === "all", ' data-nav="all"') +
      '<div class="dr-sep"></div><p class="dr-h">' + t("categories") + '</p>' +
      cat("drama", t("c_drama")) + cat("story", t("c_story")) + cat("movie", t("c_movie")) + cat("comedy", t("c_comedy")) +
      '<div class="dr-sep"></div>' +
      item("settings", "#settings", t("nav_settings"), tb === "settings") +
      '<a href="#" id="drAcc">' + ico("user") + '<span>' + (u ? esc(u.name) + " · " + t("a_logout") : t("login")) + '</span></a>';
    document.querySelectorAll("#seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === state.lang); });
  }
  function openDrawer() { renderDrawer(); $("#drawer").classList.add("on"); $("#scrim").classList.add("on"); }
  function closeDrawer() { $("#drawer").classList.remove("on"); $("#scrim").classList.remove("on"); }
  function setLang(l) { if (l !== "sw" && l !== "en") return; state.lang = l; save(); applyLang(); fillPlayer(); refresh(); }

  /* ---------- Kurasa ---------- */
  var views = {
    home: function () {
      var v = filtered(), cont = v.filter(function (x) { var p = state.progress[x.id]; return p && p.p > 2 && p.p < 95; });
      var genres = {}; v.forEach(function (x) { (genres[x.genre || "—"] = genres[x.genre || "—"] || []).push(x); });
      return heroHTML() + chips() + (v.length ? "" : '<p class="empty">' + t(all().length ? "nogroup" : "nocat") + '</p>') +
        rail(t("cont"), cont) + rail(t("c_movie"), v.filter(function (x) { return x.type === "movie"; })) +
        rail(t("c_series"), v.filter(function (x) { return x.type === "series"; })) +
        Object.keys(genres).map(function (g) { return rail(g, genres[g]); }).join("");
    },
    movies: function () { return '<h2 class="sec">' + t("nav_movies") + '</h2>' + grid(all().filter(function (x) { return x.type === "movie"; }), t("nomovies")); },
    series: function () { return '<h2 class="sec">' + t("nav_series") + '</h2>' + grid(all().filter(function (x) { return x.type === "series"; }), t("noseries")); },
    mylist: function () { return '<h2 class="sec">' + t("nav_mylist") + '</h2>' + grid(state.list.map(byId).filter(Boolean), t("emptylist")); },
    settings: function () {
      var u = me();
      return '<h2 class="sec">' + t("account") + '</h2><div class="set"><div class="toggle"><span>' +
        (u ? esc(u.name) + ' <small style="color:var(--mut)">' + fmtPhone(u.contact) + '</small>' : t("a_guest")) + '</span>' +
        (u ? '<button class="btn ghost" id="btnLogout">' + t("a_logout") + '</button>' : '<button class="btn" id="setLogin">' + t("login") + '</button>') + '</div></div>' +
        '<h2 class="sec">' + t("set_title") + '</h2><div class="set">' +
        '<div class="toggle"><span>' + t("saver") + '</span><input type="checkbox" id="optSaver"' + (state.saver ? " checked" : "") + '></div>' +
        '<div class="toggle"><span>' + t("light") + '</span><input type="checkbox" id="optLight"' + (state.light ? " checked" : "") + '></div></div>' +
        '<div class="set"><button class="btn ghost" id="btnClear">' + t("clearhist") + '</button></div>';
    }
  };

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = t(el.dataset.t); });
    $("#q").placeholder = t("search_ph"); $("#dq").placeholder = t("search_ph");
    $("#btnMenu").setAttribute("aria-label", t("menu")); $("#drClose").setAttribute("aria-label", t("close"));
    $("#closePlayer").setAttribute("aria-label", t("close"));
    updateTop();
  }

  function render(keep) {
    var tab = (location.hash || "#home").slice(1);
    if (!views[tab]) tab = "home";
    $("#app").innerHTML = views[tab]();
    renderDrawer();
    document.body.classList.toggle("light", !!state.light);
    document.body.classList.toggle("saver", !!state.saver);
    if (tab === "home") startHero(); else clearInterval(heroTimer);
    if (keep !== true) window.scrollTo(0, 0);
  }
  function refresh() { // onyesha upya bila kuruka juu; heshimu utafutaji unaoendelea
    if (!$("#searchBar").hidden && $("#q").value.trim()) search($("#q").value); else render(true);
  }

  /* ---------- Utafutaji ---------- */
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return render();
    var r = all().filter(function (v) { return (v.title + " " + (v.genre || "") + " " + (v.desc || "")).toLowerCase().indexOf(q) > -1; });
    $("#app").innerHTML = '<h2 class="sec">' + t("results") + ': ' + esc(q) + '</h2>' + grid(r, t("none"));
    clearInterval(heroTimer);
  }

  /* ---------- Player ---------- */
  var cur = null, vid = null;
  function fillPlayer() {
    var v = cur; if (!v) return;
    $("#pMeta").textContent = [v.type === "series" ? t("k_series") : t("k_movie"), v.genre, v.year, v.dur].filter(Boolean).join(" • ");
    $("#pList").textContent = inList(v.id) ? t("in_list") : t("add_list");
  }
  function open(id) {
    var v = byId(id); if (!v) return; cur = v;
    $("#pTitle").textContent = v.title;
    $("#pDesc").textContent = v.desc || "";
    fillPlayer();
    var st = $("#stage"); st.innerHTML = "";
    if (!v.src) { st.innerHTML = '<p class="empty">' + t("novideo") + '</p>'; }
    else {
      var b = document.createElement("button"); b.className = "big"; b.setAttribute("aria-label", t("play")); b.innerHTML = "&#9654;";
      b.onclick = play; st.appendChild(b); // hakuna kupakia video mpaka mtumiaji agusa — inaokoa data
    }
    $("#player").hidden = false; document.body.style.overflow = "hidden";
  }
  function play() {
    var st = $("#stage"), v = cur, y = ytId(v.src); st.innerHTML = "";
    if (y) {
      st.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + y + '?autoplay=1&rel=0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
      vid = null; return;
    }
    vid = document.createElement("video");
    vid.controls = true; vid.playsInline = true; vid.preload = "none"; vid.src = v.src;
    var p = state.progress[v.id];
    vid.addEventListener("loadedmetadata", function () { if (p && p.t && p.p < 95) vid.currentTime = p.t; });
    vid.addEventListener("timeupdate", function () {
      if (!vid || !vid.duration) return;
      var now = Date.now(); if (now - (play.last || 0) < 3000) return; play.last = now;
      state.progress[v.id] = { t: vid.currentTime, p: vid.currentTime / vid.duration * 100 }; save();
    });
    vid.addEventListener("error", function () { toast(t("videoerr")); });
    st.appendChild(vid); vid.play().catch(function () {});
  }
  function closePlayer() {
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid = null; }
    $("#stage").innerHTML = ""; $("#player").hidden = true; document.body.style.overflow = ""; cur = null;
    refresh();
  }

  /* ---------- Matukio ---------- */
  document.addEventListener("click", function (e) {
    var id = e.target.id;
    if (e.target.closest("#btnMenu")) return openDrawer();
    if (e.target.closest("#drClose") || id === "scrim") return closeDrawer();
    var lg = e.target.closest("[data-lang]"); if (lg) return setLang(lg.dataset.lang);
    var dn = e.target.closest("#drNav a");
    if (dn) {
      closeDrawer();
      if (dn.id === "drAcc") { e.preventDefault(); if (me()) { if (confirm(t("a_logoutq"))) logout(); } else openAuth("login"); return; }
      if (dn.dataset.nav) { e.preventDefault(); filt = dn.dataset.nav; if (location.hash !== "#home") location.hash = "#home"; else render(); }
      return;
    }
    if (e.target.closest("#btnAdmin")) return openAdmin();
    if (id === "btnLogout") { if (confirm(t("a_logoutq"))) logout(); return; }
    if (id === "setLogin") return openAuth("login");
    if (id === "btnClear") { state.progress = {}; save(); toast(t("cleared")); return; }
    var ch = e.target.closest("[data-f]"); if (ch) { filt = (filt === ch.dataset.f) ? "all" : ch.dataset.f; return render(true); }
    var el = e.target.closest("[data-id]"); if (el) return open(el.dataset.id);
  });
  document.addEventListener("keydown", function (e) {
    var c = e.target.classList;
    if ((e.key === "Enter" || e.key === " ") && c && c.contains("card")) { e.preventDefault(); open(e.target.dataset.id); }
    if (e.key === "Escape") {
      if ($("#drawer").classList.contains("on")) closeDrawer();
      else if (!$("#admin").hidden) closeAdmin();
      else if (!$("#auth").hidden) closeAuth();
      else if (!$("#player").hidden) closePlayer();
    }
  });
  $("#closePlayer").onclick = closePlayer;
  $("#pList").onclick = function () {
    var i = state.list.indexOf(cur.id);
    if (i > -1) state.list.splice(i, 1); else state.list.push(cur.id);
    save(); fillPlayer();
  };
  $("#pShare").onclick = function () {
    if (navigator.share) navigator.share({ title: cur.title + " — Youflix", url: location.href.split("#")[0] }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(location.href.split("#")[0]).then(function () { toast("✓"); });
  };
  $("#btnSearch").onclick = function () {
    var b = $("#searchBar"); b.hidden = !b.hidden;
    if (!b.hidden) $("#q").focus(); else { $("#q").value = ""; render(); }
  };
  $("#btnLogin").onclick = function () {
    if (me()) { if (confirm(t("a_logoutq"))) logout(); } else openAuth("login");
  };
  var qT; $("#q").addEventListener("input", function (e) { clearTimeout(qT); qT = setTimeout(function () { search(e.target.value); }, 250); });
  document.addEventListener("change", function (e) {
    if (e.target.id === "optSaver") { state.saver = e.target.checked; save(); render(true); }
    if (e.target.id === "optLight") { state.light = e.target.checked; save(); render(true); }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "drSearch") {
      e.preventDefault(); var dv = $("#dq").value; closeDrawer(); $("#dq").blur();
      $("#searchBar").hidden = false; $("#q").value = dv; return search(dv);
    }
  });
  window.addEventListener("hashchange", function () { $("#searchBar").hidden = true; $("#q").value = ""; render(); });
  window.addEventListener("online", function () { toast(t("online")); });
  window.addEventListener("offline", function () { toast(t("offline")); });

  var fy = $("#footYear"); if (fy) fy.textContent = new Date().getFullYear();

  /* ---------- Anza ---------- */
  var sp = $("#splash"); if (sp) setTimeout(function () { sp.remove(); }, 3000); // splash: sekunde 3
  applyLang();
  render();
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
