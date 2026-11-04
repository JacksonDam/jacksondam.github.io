import { EXPERIENCE } from '../../data/content';
import amazon from '../../assets/logos/amazon.png';
import alexa from '../../assets/logos/alexa.svg';
import barclays from '../../assets/logos/barclays.svg';
import glasgow from '../../assets/logos/glasgow.png';
import decadecimal from '../../assets/logos/decadecimal.png';

const LOGOS = { amazon, alexa, barclays, glasgow, decadecimal };

export function Experience() {
  return (
    <ul className="grid-3">
      {EXPERIENCE.map((e) => (
        <li key={`${e.org}-${e.from}`} className="entry">
          <div className="entry-tile" data-org={e.org.split(' ')[0].toLowerCase()}>
            <img className={`entry-logo logo-${e.logo}`} src={LOGOS[e.logo]} alt={e.org} />
            <span className="entry-year">{e.year}</span>
          </div>
          <div className="entry-body">
            <span className="kicker">{e.where ? `${e.org}, ${e.where}` : e.org}</span>
            <h2 className="entry-title">{e.role}</h2>
            <span className="outline-label">{e.to ? `${e.from} – ${e.to}` : e.from}</span>
            <span className="entry-note">{e.note}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
