import { useSyncExternalStore } from 'react';
import { audio } from './engine';

const subscribe = (fn) => audio.subscribe(fn);
const read = () => audio.prefs;

export function useSoundPrefs() {
  return useSyncExternalStore(subscribe, read);
}
