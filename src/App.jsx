import { useCallback, useEffect, useRef, useState } from 'react';
import { World } from './world/World';
import TopBar from './components/TopBar';
import MenuDrawer from './components/MenuDrawer';
import Page from './components/Page';
import { Banners, Dock, MapPins, NewsTicker, TimeButton } from './components/MapUI';
import { SECTIONS } from './data/content';
import { audio } from './audio/engine';

const PAGE_KEYS = SECTIONS.filter((s) => !s.href).map((s) => s.key);
const TOD_KEY = 'jd-time-of-day';

function readRoute() {
  const k = window.location.hash.replace(/^#\/?/, '');
  return PAGE_KEYS.includes(k) ? k : null;
}
function readTod() {
  try {
    const v = localStorage.getItem(TOD_KEY);
    return ['day', 'sunset', 'night'].includes(v) ? v : 'day';
  } catch {
    return 'day';
  }
}
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const pinEls = useRef(new Map());
  const pageRef = useRef({ key: null, open: false });
  const fromMapRef = useRef(false);

  const [route, setRoute] = useState(readRoute);
  const [pageKey, setPageKey] = useState(null);
  const [pageOpen, setPageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tod, setTod] = useState(readTod);
  const [phase, setPhase] = useState('intro');
  const [flat, setFlat] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    pageRef.current = { key: pageKey, open: pageOpen };
  }, [pageKey, pageOpen]);

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const open = useCallback((key) => {
    setMenuOpen(false);
    if (!PAGE_KEYS.includes(key) || readRoute() === key) return;
    if (readRoute()) {
      // Page to page: replace, so Back still returns to the map.
      window.location.replace(`#/${key}`);
    } else {
      fromMapRef.current = true;
      window.location.hash = `#/${key}`;
    }
  }, []);

  const home = useCallback(() => {
    setMenuOpen(false);
    if (!readRoute()) return;
    if (fromMapRef.current) {
      fromMapRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setRoute(null);
    }
  }, []);

  const register = useCallback((key, el) => {
    if (el) pinEls.current.set(key, el);
    else pinEls.current.delete(key);
    worldRef.current?.setPin(key, el);
  }, []);

  // Build the world once the intro has painted (construction blocks briefly). While its shaders
  // compile, time a few animation frames to learn the display's refresh rate (60, 120, 144 Hz...),
  // then render the first frames behind the intro so the reveal starts smoothly.
  useEffect(() => {
    let world = null;
    let cancelled = false;
    let raf = 0;
    const started = performance.now();
    const frames = (n) =>
      new Promise((resolve) => {
        const stamps = [];
        const tick = (t) => {
          if (cancelled) return;
          stamps.push(t);
          if (stamps.length < n) raf = requestAnimationFrame(tick);
          else resolve(stamps);
        };
        raf = requestAnimationFrame(tick);
      });
    const refreshRate = (stamps) => {
      const gaps = stamps
        .slice(4)
        .map((s, i) => s - stamps[i + 3])
        .sort((a, b) => a - b);
      return Math.min(1000 / 30, Math.max(1000 / 360, gaps[gaps.length >> 1]));
    };
    const build = async () => {
      try {
        world = new World(canvasRef.current, {
          onHover: (key) => {
            setHovered(key);
            if (key) audio.play('hover');
          },
          onSelect: (key) => {
            audio.play('select');
            open(key);
          },
          reducedMotion: prefersReducedMotion(),
        });
      } catch (err) {
        console.warn('3D map unavailable, showing the list view.', err);
        setFlat(true);
        setPhase('ready');
        return;
      }
      worldRef.current = world;
      for (const [k, el] of pinEls.current) world.setPin(k, el);
      world.setTimeOfDay(readTod(), false);
      const initial = readRoute();
      if (initial) world.snapFocus(initial);
      const [stamps] = await Promise.all([frames(24), world.ready]);
      if (cancelled) return;
      world.start(refreshRate(stamps));
      await frames(3);
      if (cancelled) return;
      const delay = Math.max(0, 900 - (performance.now() - started));
      setTimeout(() => {
        if (cancelled) return;
        if (!initial) world.playIntro();
        setPhase('ready');
      }, delay);
    };
    raf = requestAnimationFrame(build);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      world?.dispose();
      worldRef.current = null;
    };
  }, [open]);

  // Page choreography: fly to the place, then open its page; close, then fly back.
  useEffect(() => {
    if (phase !== 'ready') return undefined;
    const world = worldRef.current;
    let alive = true;
    (async () => {
      const cur = pageRef.current;
      if (route) {
        if (cur.key && cur.open) {
          setPageKey(route);
          world?.snapFocus(route);
          return;
        }
        world?.setPaused(false);
        if (world && world.focusKey !== route) await world.focus(route);
        if (!alive) return;
        setPageKey(route);
        requestAnimationFrame(() => alive && setPageOpen(true));
      } else if (cur.key) {
        setPageOpen(false);
        world?.setPaused(false);
        await wait(260);
        if (!alive) return;
        setPageKey(null);
        world?.unfocus();
      }
    })();
    return () => {
      alive = false;
    };
  }, [route, phase]);

  // Stop rendering the map while a page covers it.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return undefined;
    if (!pageOpen) {
      world.setPaused(false);
      return undefined;
    }
    const t = setTimeout(() => world.setPaused(true), 450);
    return () => clearTimeout(t);
  }, [pageOpen]);

  useEffect(() => {
    worldRef.current?.setHighlight(hovered);
  }, [hovered]);

  // ---- Sound cues ----
  const cueRef = useRef({ page: false, menu: false, tod });
  useEffect(() => {
    if (pageOpen === cueRef.current.page) return;
    cueRef.current.page = pageOpen;
    audio.play(pageOpen ? 'swishIn' : 'swishOut');
    audio.duck(pageOpen);
  }, [pageOpen]);
  useEffect(() => {
    if (menuOpen === cueRef.current.menu) return;
    cueRef.current.menu = menuOpen;
    // Closing because a place was chosen: the select chime already covers it.
    if (!menuOpen && audio.recent(150)) return;
    audio.play(menuOpen ? 'menuOpen' : 'menuClose');
  }, [menuOpen]);
  useEffect(() => {
    if (tod === cueRef.current.tod) return;
    cueRef.current.tod = tod;
    audio.play('tod', { tod });
  }, [tod]);

  // Hover pips and select chimes for every button and link, like a console cursor.
  useEffect(() => {
    let lastEl = null;
    let keyboard = false;
    const target = (e) => e.target.closest?.('a[href], button');
    const usable = (el) => el && !el.disabled && el.dataset.sfx !== 'none';
    const onDown = () => {
      keyboard = false;
      audio.unlock();
    };
    const onKey = (e) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) keyboard = true;
      audio.unlock();
    };
    const onOver = (e) => {
      if (e.pointerType !== 'mouse') return;
      const el = target(e);
      if (el === lastEl) return;
      lastEl = el;
      if (usable(el)) audio.play('hover');
    };
    const onFocus = (e) => {
      if (!keyboard) return;
      const el = target(e);
      if (usable(el)) audio.play('hover');
    };
    const onClick = (e) => {
      // Mobile Safari may not count pointerdown as a gesture that can start audio, but it counts a click.
      audio.unlock();
      const el = target(e);
      if (!el || el.disabled) return;
      const kind = el.dataset.sfx || 'select';
      if (kind !== 'none') audio.play(kind);
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('focusin', onFocus);
    // Capture phase, so the chime starts before React handles the click (and closes the menu).
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  // After the first reveal, the map UI comes back quickly when a page closes.
  useEffect(() => {
    if (phase !== 'ready') return undefined;
    const t = setTimeout(() => setSettled(true), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    document.documentElement.dataset.tod = tod;
    worldRef.current?.setTimeOfDay(tod);
    try {
      localStorage.setItem(TOD_KEY, tod);
    } catch {
      /* storage unavailable */
    }
  }, [tod]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else if (readRoute()) {
        audio.play('back');
        home();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, home]);

  const section = SECTIONS.find((s) => s.key === route);
  const classes = [
    'app',
    `phase-${phase}`,
    settled ? 'settled' : '',
    route ? 'has-page' : '',
    flat ? 'flat' : '',
    menuOpen ? 'menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="map-layer">
        <canvas ref={canvasRef} className="map-canvas" aria-label="3D map of the island. Each place opens a page." />
        <div className="vignette" aria-hidden="true" />
        <MapPins register={register} hovered={hovered} onHover={setHovered} onOpen={open} flat={flat} />
      </div>

      <div className="map-hud">
        <Banners onOpen={open} />
        <NewsTicker onOpen={open} />
        <TimeButton tod={tod} onTod={setTod} />
        <Dock hovered={hovered} onHover={setHovered} onOpen={open} />
      </div>

      <Page pageKey={pageKey} open={pageOpen} onClose={home} onOpen={open} />

      <TopBar
        location={section ? section.title : 'World Map'}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((v) => !v)}
        onOpen={open}
      />
      <MenuDrawer
        open={menuOpen}
        route={route}
        tod={tod}
        onClose={() => setMenuOpen(false)}
        onOpen={open}
        onHome={home}
        onTod={setTod}
      />

      <div className={`intro${phase === 'ready' ? ' out' : ''}`} aria-hidden="true">
        <div className="intro-mark">
          Jackson <b>Dam</b>
        </div>
      </div>
    </div>
  );
}
