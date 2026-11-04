import { useEffect, useState } from 'react';
import Icon from './Icon';
import { NEWS, PROJECTS, SECTIONS, TIMES } from '../data/content';

export function MapPins({ register, hovered, onHover, onOpen, flat }) {
  return (
    <div className={`pins${flat ? ' flat' : ''}`} role="navigation" aria-label="Places on the map">
      {SECTIONS.map((s, i) => {
        const inner = (
          <>
            <span className="pin-box">
              <Icon name={s.icon} size={30} />
            </span>
            <span className="pin-label">
              {s.title}
              <small>{s.blurb}</small>
            </span>
          </>
        );
        const common = {
          className: `pin${hovered === s.key ? ' hot' : ''}`,
          style: { '--i': i },
          onPointerEnter: () => onHover(s.key),
          onPointerLeave: () => onHover(null),
          onFocus: () => onHover(s.key),
          onBlur: () => onHover(null),
        };
        return (
          <div
            key={s.key}
            className={`pin-anchor${hovered === s.key ? ' raised' : ''}`}
            data-prefer={s.side === 'left' ? 'l' : 'r'}
            ref={(el) => register(s.key, el)}
          >
            {s.href ? (
              <a {...common} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.title}: ${s.blurb}`}>
                {inner}
              </a>
            ) : (
              <button {...common} type="button" onClick={() => onOpen(s.key)} aria-label={`${s.title}: ${s.blurb}`}>
                {inner}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Banners({ onOpen }) {
  const latest = PROJECTS[PROJECTS.length - 1];
  return (
    <div className="banners">
      <button type="button" className="banner banner-wide" onClick={() => onOpen('projects')}>
        <img src={latest.banner || latest.thumbnail} alt="" />
        <span className="banner-shade" />
        <span className="banner-text">
          <span className="banner-kicker">Latest project</span>
          <span className="banner-title">{latest.title}</span>
        </span>
      </button>
      <div className="banner-col">
        <button type="button" className="banner banner-cv" onClick={() => onOpen('cv')}>
          <span className="banner-cv-top">View my</span>
          <span className="banner-cv-big">CV</span>
        </button>
        <span className="banner-cap">View or download</span>
      </div>
    </div>
  );
}

export function NewsTicker({ onOpen }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % NEWS.length), 6500);
    return () => clearInterval(t);
  }, [paused]);
  const item = NEWS[i];
  return (
    <div
      className="news"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <span className="news-icon" aria-hidden="true">
        <Icon name="info" size={22} />
      </span>
      <button type="button" key={i} className="news-item" onClick={() => onOpen(item.key)}>
        <span className="news-text">{item.text}</span>
        <span className="news-tag">{item.tag}</span>
      </button>
    </div>
  );
}

export function TimeButton({ tod, onTod }) {
  const idx = TIMES.findIndex((t) => t.key === tod);
  const cur = TIMES[idx] || TIMES[0];
  const next = TIMES[(idx + 1) % TIMES.length];
  return (
    <button
      type="button"
      className="tod-btn"
      data-sfx="none"
      onClick={() => onTod(next.key)}
      aria-label={`Time of day: ${cur.label}. Switch to ${next.label}`}
    >
      <Icon name={cur.icon} size={20} />
      <span className="tod-text">
        <span className="tod-label">Time of day</span>
        <span className="tod-value">{cur.label}</span>
      </span>
    </button>
  );
}

export function Dock({ hovered, onHover, onOpen }) {
  return (
    <nav className="dock" aria-label="Places">
      {SECTIONS.map((s) => {
        const inner = (
          <>
            <span className="dock-icon" aria-hidden="true">
              <Icon name={s.icon} size={22} />
            </span>
            <span className="dock-text">
              <span className="dock-title">{s.title}</span>
              <span className="dock-sub">{s.blurb}</span>
            </span>
          </>
        );
        const common = {
          className: `dock-item${hovered === s.key ? ' hot' : ''}`,
          onFocus: () => onHover(s.key),
          onBlur: () => onHover(null),
        };
        return s.href ? (
          <a key={s.key} {...common} href={s.href} target="_blank" rel="noopener noreferrer">
            {inner}
          </a>
        ) : (
          <button key={s.key} {...common} type="button" onClick={() => onOpen(s.key)}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
