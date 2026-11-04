import { AWARDS } from '../../data/content';

const tier = (place) => (place === '1st' ? 'gold' : place === '2nd' ? 'silver' : place === 'Paper' || place === 'Prize' ? 'prize' : 'plain');

export function Awards() {
  return (
    <ol className="results">
      {AWARDS.map((a) => (
        <li key={a.text} className="result">
          <span className={`result-pos ${tier(a.place)}`}>{a.place}</span>
          <div className="result-body">
            <p>{a.text}</p>
            {a.detail && (
              <a className="result-detail" href={a.href} target="_blank" rel="noopener noreferrer">
                {a.detail}
              </a>
            )}
          </div>
          <span className="outline-label">{a.date}</span>
        </li>
      ))}
    </ol>
  );
}
