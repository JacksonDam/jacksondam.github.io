import { SKILLS } from '../../data/content';
import { LOGO_COLOURS } from '../../data/skillLogos';
import SkillLogo from '../SkillLogo';

// A bento of every skill on the CV. Tile sizes come from the data; the grid packs them densely.
export function Skills() {
  return (
    <ul className="bento">
      {SKILLS.map((s) =>
        s.services ? (
          <li key={s.name} className="card tile tile-aws">
            <span className="tile-kicker">Amazon Web Services</span>
            <span className="tile-name">{s.name}</span>
            <ul className="tile-services">
              {s.services.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </li>
        ) : (
          <li
            key={s.name}
            className={`card tile${s.size ? ` tile-${s.size}` : ''}`}
            style={{ '--c': LOGO_COLOURS[s.logo][0], '--cn': LOGO_COLOURS[s.logo][1] }}
          >
            <SkillLogo logo={s.logo} className="tile-logo" />
            <span className="tile-name">{s.name}</span>
          </li>
        ),
      )}
    </ul>
  );
}
