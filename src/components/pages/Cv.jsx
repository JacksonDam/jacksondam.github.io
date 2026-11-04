import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import { CV_URL } from '../../data/content';

// The CV drawn page by page with pdf.js (loaded only when this page opens), so it reads the
// same in every browser without leaving the site. Links in the PDF stay clickable.
export function Cv() {
  const holder = useRef(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let doc = null;
    (async () => {
      try {
        const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]);
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        doc = await pdfjs.getDocument(CV_URL).promise;
        const el = holder.current;
        if (cancelled || !el) return;
        const width = Math.min(el.clientWidth, 900);
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const scale = width / page.getViewport({ scale: 1 }).width;
          const vp = page.getViewport({ scale });
          const sheet = document.createElement('div');
          sheet.className = 'cv-sheet';
          sheet.style.aspectRatio = `${vp.width} / ${vp.height}`;
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(vp.width * dpr);
          canvas.height = Math.floor(vp.height * dpr);
          canvas.setAttribute('aria-hidden', 'true');
          sheet.appendChild(canvas);
          el.appendChild(sheet);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: page.getViewport({ scale: scale * dpr }) }).promise;
          for (const a of await page.getAnnotations()) {
            if (a.subtype !== 'Link' || !a.url) continue;
            const [x1, y1, x2, y2] = vp.convertToViewportRectangle(a.rect);
            const link = document.createElement('a');
            link.href = a.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'cv-link';
            link.setAttribute('aria-label', a.url);
            Object.assign(link.style, {
              left: `${(Math.min(x1, x2) / vp.width) * 100}%`,
              top: `${(Math.min(y1, y2) / vp.height) * 100}%`,
              width: `${(Math.abs(x2 - x1) / vp.width) * 100}%`,
              height: `${(Math.abs(y2 - y1) / vp.height) * 100}%`,
            });
            sheet.appendChild(link);
          }
          if (n === 1) setState('ready');
        }
      } catch (err) {
        console.warn('CV viewer failed', err);
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
      doc?.destroy();
    };
  }, []);

  return (
    <div className="cv">
      {state === 'loading' && <div className="cv-sheet cv-wait">Loading CV…</div>}
      {state === 'error' && (
        <div className="cv-sheet cv-wait">
          <p>The CV could not be shown here.</p>
          <a className="btn-dark" href={CV_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={15} />
            Open the PDF
          </a>
        </div>
      )}
      <div ref={holder} className="cv-pages" />
    </div>
  );
}
