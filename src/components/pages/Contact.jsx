import Icon from '../Icon';
import { LINKS } from '../../data/content';

export function Contact({ onOpen }) {
  return (
    <div className="contact">
      <div className="contact-intro">
        <h2>Get in touch</h2>
        <p>Let's chat!</p>
        <button type="button" className="btn-dark" onClick={() => onOpen('cv')}>
          <Icon name="doc" size={17} />
          View my CV
        </button>
      </div>
      <ul className="grid-2 contact-links">
        {['linkedin', 'github', 'medium', 'email'].map((k) => {
          const l = LINKS[k];
          return (
            <li key={k}>
              <a
                className="card link-tile big"
                href={l.href}
                target={k === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
              >
                <span className="link-tile-icon">
                  <Icon name={k === 'email' ? 'mail' : k} size={28} />
                </span>
                <span className="link-tile-name">{l.label}</span>
                <span className="link-tile-sub">{l.handle}</span>
                <Icon name={k === 'email' ? 'chevron' : 'external'} size={18} className="link-tile-ext" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
