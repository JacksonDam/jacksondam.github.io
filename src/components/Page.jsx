import { useEffect, useRef } from 'react';
import Icon from './Icon';
import { CV_URL, SECTIONS } from '../data/content';
import { About, Awards, Contact, Cv, Experience, Friends, Projects, Skills, Volunteering } from './pages';

const CONTENT = {
  about: About,
  experience: Experience,
  projects: Projects,
  awards: Awards,
  skills: Skills,
  volunteering: Volunteering,
  friends: Friends,
  contact: Contact,
  cv: Cv,
};

export default function Page({ pageKey, open, onClose, onOpen }) {
  const titleRef = useRef(null);
  const scrollRef = useRef(null);
  const section = SECTIONS.find((s) => s.key === pageKey);
  const Content = CONTENT[pageKey];

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo(0, 0);
      titleRef.current?.focus({ preventScroll: true });
    }
  }, [open, pageKey]);

  if (!section || !Content) return null;
  return (
    <main ref={scrollRef} className={`page${open ? ' open' : ''}`} aria-labelledby="page-title" data-key={pageKey}>
      <div className="page-inner" key={pageKey}>
        <header className="page-head">
          <span className="page-icon" aria-hidden="true">
            <Icon name={section.icon} size={26} />
          </span>
          <h1 id="page-title" ref={titleRef} tabIndex={-1} className="page-mark">
            {section.title}
          </h1>
          <div className="page-actions">
            {pageKey === 'cv' && (
              <a className="btn-dark" href={CV_URL} download="Jackson_Dam_CV.pdf">
                <Icon name="download" size={17} />
                Download PDF
              </a>
            )}
            <button type="button" className="pill-btn" data-sfx="back" onClick={onClose}>
              <Icon name="map" size={17} />
              <span>Return to the Map</span>
            </button>
          </div>
        </header>
        <Content onOpen={onOpen} />
        <footer className="page-foot">© Copyright Jackson Dam, {new Date().getFullYear()}</footer>
      </div>
    </main>
  );
}
