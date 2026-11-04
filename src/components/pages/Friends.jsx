import Icon from '../Icon';
import { FRIENDS } from '../../data/content';

export function Friends() {
  return (
    <ul className="grid-4">
      {FRIENDS.map((f) => (
        <li key={f.url}>
          <a className="card link-tile" href={f.url} target="_blank" rel="noopener noreferrer">
            <span className="link-tile-name">{f.name}</span>
            <span className="link-tile-sub">{new URL(f.url).hostname}</span>
            <Icon name="external" size={18} className="link-tile-ext" />
          </a>
        </li>
      ))}
    </ul>
  );
}
