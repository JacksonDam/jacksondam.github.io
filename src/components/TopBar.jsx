import { useEffect, useState } from 'react';
import Icon from './Icon';
import avatarImg from '../assets/avatar.webp';
import { AWARDS, PROJECTS } from '../data/content';
import { audio } from '../audio/engine';
import { useSoundPrefs } from '../audio/useSound';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function ordinal(n) {
  const s = n % 100;
  if (s >= 11 && s <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, 60000 - d.getSeconds() * 1000 - d.getMilliseconds() + 20);
    };
    timer = setTimeout(tick, 60000 - now.getSeconds() * 1000 - now.getMilliseconds() + 20);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return now;
}

export default function TopBar({ location, menuOpen, onMenu, onOpen }) {
  const now = useClock();
  const { sound } = useSoundPrefs();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = `${MONTHS[now.getMonth()]} ${ordinal(now.getDate())}`;

  return (
    <header className="topbar">
      <button
        type="button"
        className="tb-menu"
        data-sfx="none"
        onClick={onMenu}
        aria-expanded={menuOpen}
        aria-controls="jd-menu"
      >
        <span className="tb-logo" aria-hidden="true">JD</span>
        <span className="tb-stack">
          <span className="tb-label">Menu</span>
          <span className="tb-value">{location}</span>
        </span>
      </button>

      <span className="tb-sep hide-md" />
      <button type="button" className="tb-slot hide-md" onClick={() => onOpen('awards')}>
        <span className="tb-coin" aria-hidden="true">
          <Icon name="trophy" size={20} />
        </span>
        <span className="tb-stack">
          <span className="tb-label">Awards</span>
          <span className="tb-value">{AWARDS.length} results</span>
        </span>
      </button>

      <span className="tb-sep hide-sm" />
      <button type="button" className="tb-car hide-sm" onClick={() => onOpen('about')}>
        <img src={avatarImg} alt="" width="40" height="40" />
        <span className="tb-name">Jackson Dam</span>
        <span className="tb-pp hide-lg">SDE, Amazon</span>
      </button>

      <span className="tb-fill" />

      <span className="tb-sep hide-lg" />
      <button type="button" className="tb-slot hide-lg" onClick={() => onOpen('projects')}>
        <span className="tb-stack">
          <span className="tb-label">Projects</span>
          <span className="tb-small">Sizzle reels</span>
        </span>
        <span className="tb-ring" aria-label={`${PROJECTS.length} projects`}>{PROJECTS.length}</span>
      </button>

      <span className="tb-sep hide-lg" />
      <div className="tb-slot static hide-lg">
        <span className="tb-stack">
          <span className="tb-label">Based in</span>
          <span className="tb-value">London, UK</span>
        </span>
        <Icon name="pin" size={26} className="tb-accent" />
      </div>

      <span className="tb-sep" />
      <button
        type="button"
        className={`tb-slot tb-sound${sound ? ' on' : ''}`}
        data-sfx="none"
        aria-pressed={sound}
        onClick={() => audio.set({ sound: !sound })}
      >
        <Icon name={sound ? 'sound' : 'soundOff'} size={24} className="tb-sound-icon" />
        <span className="tb-stack">
          <span className="tb-label">Sound</span>
          <span className="tb-value">{sound ? 'On' : 'Off'}</span>
        </span>
      </button>

      <span className="tb-sep" />
      <div className="tb-clock" aria-label={`Local time ${time}, ${date}`}>
        <span className="tb-time">{time}</span>
        <span className="tb-date">{date}</span>
      </div>
    </header>
  );
}
