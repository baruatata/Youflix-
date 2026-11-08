// Aikoni za SVG (hakuna maktaba ya nje — nyepesi). Rangi inafuata `currentColor`.
const P = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  back: <path d="M15 6l-6 6 6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  down: <path d="M6 9l6 6 6-6" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />,
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  movies: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>,
  series: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 3l4 4 4-4" /></>,
  kids: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
  mylist: <path d="M6 3h12v18l-6-4-6 4z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  drama: <><path d="M4 4h16v8a8 8 0 0 1-16 0z" /><path d="M8.5 10h.01M15.5 10h.01M9 15.5s1.2 1.5 3 1.5 3-1.5 3-1.5" /></>,
  story: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></>,
  comedy: <><circle cx="12" cy="12" r="9" /><path d="M8 13.5c1 2.5 7 2.5 8 0z" /><path d="M9 9h.01M15 9h.01" /></>,
};

export default function Icon({ name, size, style }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"
      style={size ? { width: size, height: size, ...style } : style}>
      {P[name]}
    </svg>
  );
}
