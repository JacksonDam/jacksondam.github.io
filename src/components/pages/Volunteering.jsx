import { VOLUNTEERING } from '../../data/content';

export function Volunteering() {
  return (
    <ul className="grid-2">
      {VOLUNTEERING.map((v) => (
        <li key={v.title} className="card prose">
          <span className="kicker">{v.when}</span>
          <h2 className="entry-title">{v.title}</h2>
          <p>{v.text}</p>
        </li>
      ))}
    </ul>
  );
}
