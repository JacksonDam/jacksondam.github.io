# jacksondam.com

Repository for my personal website, developed with React + Vite and three.js.

The home page is a 3D island map inspired by the Gran Turismo 7 world map. Each building is a
section of the site (the café is About, the circuit is Awards, and so on); selecting one flies the
camera there and opens its page. Pages are hash-routed (`#/experience`), so links are shareable.

- `src/world/`: the three.js scene. The island, river, trees, buildings and lighting are all
  generated in code (`layout.js` holds the island shape and where each place sits).
- `src/components/`: the GT-style interface (top bar, menu, map pins, pages).
- `src/data/content.js`: all of the site's text, links and lists.
- `src/audio/engine.js`: sound (off until the visitor turns it on in the top bar). UI sounds are
  synthesised in Web Audio, modelled on measurements of GT7's menu sounds; the map music is
  `public/audio/lounge.mp3`, an original 100 BPM lounge loop rendered by `tools/music/lounge.py`
  (MIDI written in code, played through the GeneralUser GS SoundFont with FluidSynth).

```sh
npm install
npm run dev      # local dev server
npm run deploy   # build and publish to the gh-pages branch
```
