import { useEffect, useRef } from 'react';
import Icon from './Icon';
import avatarImg from '../assets/avatar.webp';
import { LINKS, SECTIONS, TIMES } from '../data/content';
import { audio } from '../audio/engine';
import { useSoundPrefs } from '../audio/useSound';

function OnOff({ label, icon, value, onChange, disabled }) {
  return (
    <div className={`dr-toggle${disabled ? ' dim' : ''}`} role="group" aria-label={label}>
      <span className="dr-toggle-label">
        <Icon name={icon} size={20} />
        {label}
      </span>
      <div className="seg seg-2">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            data-sfx="none"
            className={value === v ? 'on' : ''}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            {v ? 'On' : 'Off'}
          </button>
        ))}
      </div>
    </div>
  );
}

function Item({ icon, label, sub, onClick, href, disabled, current, sfx }) {
  const body = (
    <>
      <span className="dr-icon">{typeof icon === 'string' ? <Icon name={icon} size={26} /> : icon}</span>
      <span className="dr-text">
        <span className="dr-label">{label}</span>
        {sub && <span className="dr-sub">{sub}</span>}
      </span>
      {href && <Icon name="external" size={16} className="dr-ext" />}
    </>
  );
  if (href) {
    return (
      <a className="dr-item" href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={`dr-item${current ? ' current' : ''}`}
      data-sfx={sfx}
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
    >
      {body}
    </button>
  );
}

export default function MenuDrawer({ open, route, tod, onClose, onOpen, onHome, onTod }) {
  const closeRef = useRef(null);
  const prefs = useSoundPrefs();
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <>
      <div className={`scrim${open ? ' show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside id="jd-menu" className={`drawer${open ? ' open' : ''}`} aria-label="Menu" inert={!open}>
        <div className="dr-head">
          <span className="dr-title">
            JD <span>Menu</span>
          </span>
          <button ref={closeRef} type="button" className="dr-close" data-sfx="none" onClick={onClose}>
            Close
            <span className="dr-key">
              <Icon name="menu" size={16} />
            </span>
          </button>
        </div>

        <nav className="dr-body">
          <Item
            icon={<img className="dr-avatar" src={avatarImg} alt="" />}
            label="My Page"
            sub="About me"
            onClick={() => onOpen('about')}
            current={route === 'about'}
          />
          <Item icon="doc" label="View my CV" sub="View or download" onClick={() => onOpen('cv')} current={route === 'cv'} />
          <div className="dr-options" role="group" aria-label="Time of day">
            <span className="dr-options-label">
              <Icon name="sun" size={22} />
              Time of day
            </span>
            <div className="seg">
              {TIMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  data-sfx="none"
                  className={tod === t.key ? 'on' : ''}
                  aria-pressed={tod === t.key}
                  onClick={() => onTod(t.key)}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dr-options dr-sound" role="group" aria-label="Sound">
            <OnOff label="Sound" icon={prefs.sound ? 'sound' : 'soundOff'} value={prefs.sound} onChange={(v) => audio.set({ sound: v })} />
            <OnOff label="Music" icon="music" value={prefs.music} disabled={!prefs.sound} onChange={(v) => audio.set({ music: v })} />
            <OnOff label="Effects" icon="sound" value={prefs.effects} disabled={!prefs.sound} onChange={(v) => audio.set({ effects: v })} />
          </div>

          <hr />
          <p className="dr-heading">Places</p>
          <div className="dr-places">
            {SECTIONS.filter((s) => s.key !== 'cv').map((s) => (
              <button
                key={s.key}
                type="button"
                className={`dr-place${route === s.key ? ' current' : ''}`}
                onClick={() => onOpen(s.key)}
                aria-current={route === s.key ? 'page' : undefined}
              >
                <Icon name={s.icon} size={20} />
                {s.title}
              </button>
            ))}
          </div>

          <hr />
          <Item icon="github" label="GitHub" sub={LINKS.github.handle} href={LINKS.github.href} />
          <Item icon="medium" label="Medium" sub="Blog posts" href={LINKS.medium.href} />
          <Item icon="linkedin" label="LinkedIn" sub={LINKS.linkedin.handle} href={LINKS.linkedin.href} />
          <Item icon="mail" label="Email" sub={LINKS.email.handle} href={LINKS.email.href} />

          <hr />
          <Item icon="map" label="Return to the Map" onClick={onHome} disabled={!route} sfx="back" />
        </nav>
        <p className="dr-foot">© Copyright Jackson Dam, {new Date().getFullYear()}</p>
      </aside>
    </>
  );
}
