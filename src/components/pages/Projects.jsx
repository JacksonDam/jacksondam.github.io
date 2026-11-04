import Icon from '../Icon';
import { PROJECTS } from '../../data/content';

export function Projects() {
  return (
    <ul className="grid-2">
      {PROJECTS.map((p) => (
        <li key={p.youtubeId} className="card project">
          <a
            className="project-media"
            href={`https://www.youtube.com/watch?v=${p.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch the ${p.title} sizzle reel on YouTube`}
          >
            <img src={p.thumbnail} alt="" loading="lazy" />
            <span className="project-play" aria-hidden="true">
              <Icon name="play" size={26} />
            </span>
          </a>
          <div className="project-body">
            <span className="kicker">{p.subtitle}</span>
            <h2 className="entry-title">{p.title}</h2>
            <p>{p.description}</p>
            <a
              className="btn-dark"
              href={`https://www.youtube.com/watch?v=${p.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch
              <Icon name="external" size={15} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
