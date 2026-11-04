#!/usr/bin/env python3
"""The map music: an original lounge / jazz-fusion loop in A major at 100 BPM, written to sit where
Gran Turismo 7's menu music sits (mid tempo, major key with 6/9/maj7 colours and a borrowed bVI/bVII,
round finger bass, a soft kit with a ride-bell accent every two bars, Rhodes, vibes and jazz guitar).

Composed here as MIDI, played by the GeneralUser GS SoundFont through FluidSynth (one dry stem per
part), mixed here, and written as a seamless 32-bar loop: the reverb tail is wrapped onto the start
and the first second is repeated at the end, so any loop window of LOOP seconds starting in the first
second is seamless (this hides MP3 encoder delay).

usage: lounge.py [path/to/GeneralUser-GS.sf2]  -> public/audio/lounge.mp3
needs: fluidsynth, ffmpeg, python3 with numpy, scipy and mido
"""
import os
import subprocess
import sys
import tempfile

import mido
import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'public', 'audio', 'lounge.mp3')
SF2 = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/workplace/badminton/trailer2/sf/GeneralUser-GS.sf2')

SR = 48000
BPM = 100
BEAT = 60 / BPM
BARS = 32
LOOP = BARS * 4 * BEAT  # 76.8 s
TPB = 480
rng = np.random.default_rng(7)

# ---------- harmony ----------
V = {  # rootless voicings for the Rhodes (MIDI notes)
    'Amaj9': [64, 68, 71, 73], 'Amaj9b': [61, 64, 68, 71], 'F#m11': [64, 69, 71, 73], 'Dmaj9': [64, 66, 69, 73],
    'E9sus4': [62, 66, 69, 71], 'C#m7': [61, 64, 68, 71], 'F#7b9': [58, 61, 64, 67], 'Bm9': [62, 66, 69, 73],
    'E13sus4': [62, 66, 69, 73], 'E13': [62, 66, 68, 73], 'Fmaj9': [57, 60, 64, 67], 'E7sus4': [62, 64, 69, 71],
    'E7#9': [56, 62, 67], 'G6/9': [59, 62, 64, 69], 'Em9': [62, 66, 67, 71], 'Bm11': [62, 64, 69, 73],
}
ROOT_OF = {'A': 45, 'F#': 42, 'D': 38, 'E': 40, 'C#': 37, 'B': 35, 'F': 41, 'G': 43}


def root(ch):
    return ROOT_OF[ch[:2] if len(ch) > 1 and ch[1] == '#' else ch[0]]


# One or two chords per bar.
CHART = [
    # A
    ['Amaj9'], ['F#m11'], ['Dmaj9'], ['E9sus4'], ['Amaj9'], ['C#m7', 'F#7b9'], ['Bm9'], ['E13sus4', 'E13'],
    # A'
    ['Amaj9'], ['F#m11'], ['Dmaj9'], ['E9sus4'], ['Fmaj9'], ['E7sus4', 'E7#9'], ['Amaj9'], ['Amaj9'],
    # B
    ['Dmaj9'], ['C#m7'], ['Bm9'], ['Amaj9'], ['Dmaj9'], ['C#m7', 'F#7b9'], ['Bm11'], ['E13sus4', 'E13'],
    # C (vamp with the borrowed bVII and bVI)
    ['Amaj9b'], ['G6/9'], ['Amaj9b'], ['G6/9'], ['Fmaj9'], ['Em9'], ['Dmaj9'], ['E9sus4'],
]

# ---------- melodies: (bar, 16th step, note, length in steps) ----------
VIBES = [
    (0, 2, 76, 2), (0, 4, 78, 2), (0, 6, 80, 5), (0, 12, 76, 2), (0, 14, 73, 2),
    (1, 0, 76, 6), (1, 8, 73, 2), (1, 10, 71, 2), (1, 12, 73, 4),
    (2, 2, 69, 2), (2, 4, 73, 2), (2, 6, 76, 6), (2, 12, 78, 2), (2, 14, 76, 2),
    (3, 0, 74, 7), (3, 10, 71, 2), (3, 12, 74, 2), (3, 14, 76, 2),
    (4, 0, 80, 6), (4, 6, 78, 2), (4, 8, 76, 4), (4, 12, 73, 4),
    (5, 0, 76, 3), (5, 4, 71, 2), (5, 6, 68, 2), (5, 8, 70, 3), (5, 12, 73, 2), (5, 14, 74, 2),
    (6, 0, 73, 7), (6, 8, 74, 2), (6, 10, 76, 2), (6, 12, 78, 4),
    (7, 0, 73, 5), (7, 6, 71, 2), (7, 8, 68, 8),
    (8, 2, 76, 2), (8, 4, 78, 2), (8, 6, 80, 3), (8, 9, 81, 1), (8, 10, 80, 2), (8, 12, 76, 2), (8, 14, 73, 2),
    (9, 0, 76, 6), (9, 8, 78, 2), (9, 10, 76, 2), (9, 12, 73, 4),
    (10, 2, 69, 2), (10, 4, 73, 2), (10, 6, 76, 4), (10, 10, 78, 2), (10, 12, 81, 4),
    (11, 0, 80, 4), (11, 4, 78, 2), (11, 6, 76, 2), (11, 8, 74, 6), (11, 14, 76, 2),
    (12, 0, 76, 4), (12, 4, 72, 2), (12, 6, 69, 2), (12, 8, 67, 4), (12, 12, 69, 4),
    (13, 0, 71, 6), (13, 8, 68, 2), (13, 10, 67, 2), (13, 12, 68, 4),
    (14, 0, 69, 4), (14, 4, 71, 2), (14, 6, 73, 2), (14, 8, 76, 8),
    (15, 8, 81, 2), (15, 10, 80, 2), (15, 12, 78, 2), (15, 14, 76, 2),
    # C: long tones under the Rhodes solo
    (24, 0, 88, 12), (26, 0, 85, 12), (28, 0, 84, 12), (30, 0, 81, 14),
]

GUITAR = [  # B section, played an octave down
    (16, 0, 78, 3), (16, 3, 76, 1), (16, 4, 73, 2), (16, 6, 76, 4), (16, 10, 73, 2), (16, 12, 69, 4),
    (17, 0, 71, 3), (17, 3, 73, 1), (17, 4, 76, 4), (17, 8, 80, 4), (17, 12, 76, 4),
    (18, 0, 74, 3), (18, 3, 76, 1), (18, 4, 78, 2), (18, 6, 74, 2), (18, 8, 73, 8),
    (19, 0, 71, 2), (19, 2, 73, 2), (19, 4, 76, 2), (19, 6, 80, 2), (19, 8, 81, 6), (19, 14, 80, 2),
    (20, 0, 78, 3), (20, 3, 76, 1), (20, 4, 73, 2), (20, 6, 76, 4), (20, 10, 78, 2), (20, 12, 81, 4),
    (21, 0, 80, 4), (21, 4, 76, 2), (21, 6, 73, 2), (21, 8, 82, 3), (21, 12, 79, 2), (21, 14, 78, 2),
    (22, 0, 78, 6), (22, 6, 76, 2), (22, 8, 74, 2), (22, 10, 73, 2), (22, 12, 71, 4),
    (23, 0, 73, 4), (23, 4, 71, 2), (23, 6, 69, 2), (23, 8, 68, 6), (23, 14, 64, 2),
]

RHODES_SOLO = [  # C section, right hand over the comping
    (24, 2, 76, 1), (24, 3, 78, 1), (24, 4, 80, 2), (24, 6, 81, 2), (24, 8, 80, 1), (24, 9, 78, 1), (24, 10, 76, 2), (24, 12, 73, 4),
    (25, 0, 74, 2), (25, 2, 76, 2), (25, 4, 79, 3), (25, 8, 78, 2), (25, 10, 76, 2), (25, 12, 74, 4),
    (26, 0, 73, 2), (26, 2, 76, 2), (26, 4, 80, 2), (26, 6, 83, 4), (26, 10, 81, 2), (26, 12, 80, 2), (26, 14, 78, 2),
    (27, 0, 76, 4), (27, 4, 74, 2), (27, 6, 71, 2), (27, 8, 74, 4), (27, 12, 76, 4),
    (28, 0, 72, 2), (28, 2, 74, 2), (28, 4, 76, 4), (28, 8, 79, 2), (28, 10, 76, 2), (28, 12, 72, 4),
    (29, 0, 74, 2), (29, 2, 71, 2), (29, 4, 67, 4), (29, 8, 71, 2), (29, 10, 74, 2), (29, 12, 78, 4),
    (30, 0, 76, 6), (30, 6, 73, 2), (30, 8, 69, 4), (30, 12, 73, 4),
    (31, 0, 74, 4), (31, 4, 76, 2), (31, 6, 78, 2), (31, 8, 80, 4), (31, 12, 78, 2), (31, 14, 76, 2),
]

# Rising bell arpeggios at section ends, like the chimes that ripple through the GT map music.
GLOCK = [(7, 8 + i, n, 2) for i, n in enumerate([69, 73, 76, 80, 81, 85, 88, 92])] + \
        [(23, 8 + i, n, 2) for i, n in enumerate([64, 68, 71, 73, 76, 80, 83, 85])]
# Sparse two-note bell accents every four bars (chord tones), like the chimes over the GT map bed.
BELLS = {1: (81, 85), 5: (82, 85), 9: (81, 88), 13: (79, 84), 17: (80, 85), 21: (82, 88), 25: (79, 83), 29: (79, 86)}
GLOCK += [(bar, 8 + i * 2, n, 6) for bar, pair in BELLS.items() for i, n in enumerate(pair)]


class Part:
    def __init__(self, name, program, channel=0, bank=0):
        self.name, self.program, self.channel, self.bank = name, program, channel, bank
        self.notes = []  # (beat, length beats, note, velocity)

    def add(self, beat, length, note, vel):
        self.notes.append((beat, length, int(note), int(max(1, min(127, vel)))))

    def write(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        tr = mido.MidiTrack()
        mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM)))
        ch = self.channel
        tr.append(mido.Message('control_change', channel=ch, control=0, value=self.bank))
        tr.append(mido.Message('program_change', channel=ch, program=self.program))
        tr.append(mido.Message('control_change', channel=ch, control=7, value=110))
        ev = []
        for b, ln, note, vel in self.notes:
            ev.append((max(0, int(round(b * TPB))), 1, note, vel))
            ev.append((max(1, int(round((b + ln) * TPB))), 0, note, 0))
        ev.sort(key=lambda e: (e[0], e[1]))
        now = 0
        for tick, on, note, vel in ev:
            tr.append(mido.Message('note_on' if on else 'note_off', channel=ch, note=note, velocity=vel, time=tick - now))
            now = tick
        tr.append(mido.MetaMessage('end_of_track', time=TPB * 16))
        mid.save(path)


def at(bar, step, swing=0.035):
    """Beat position of a 16th step, with a light swing on the off 16ths and a little human drift."""
    b = bar * 4 + step / 4
    if step % 2 == 1:
        b += swing
    return b + rng.normal(0, 0.006)


def compose():
    P = {
        'rhodes': Part('rhodes', 4),
        'bass': Part('bass', 33, channel=1),
        'vibes': Part('vibes', 11, channel=2),
        'guitar': Part('guitar', 26, channel=3),
        'pad': Part('pad', 89, channel=4),
        'glock': Part('glock', 9, channel=5),
        'kit': Part('kit', 32, channel=9),  # channel 10 is the drum bank in FluidSynth; 32 = Jazz kit
    }
    hum = lambda v, s=6: v + rng.normal(0, s)

    # Rhodes comping: syncopated stabs, pushes into the next bar now and then.
    comp_one = [[(0, 3, 1.0), (6, 2, 0.78), (10, 5, 0.9)], [(0, 6, 1.0), (7, 1, 0.55), (10, 2, 0.8), (14, 2, 0.7)],
                [(0, 4, 1.0), (4, 2, 0.6), (8, 3, 0.85), (12, 2, 0.7)]]
    comp_two = [(0, 6, 1.0), (6, 1, 0.55), (8, 6, 0.95), (14, 2, 0.6)]
    for bar, chords in enumerate(CHART):
        sec = bar // 8
        base = 64 if sec != 3 else 56
        if len(chords) == 1:
            pat = comp_one[(bar + sec) % 3]
            for step, ln, acc in pat:
                for n in V[chords[0]]:
                    P['rhodes'].add(at(bar, step) + rng.uniform(0, 0.012), ln / 4 * 0.95, n, hum(base * acc))
        else:
            for step, ln, acc in comp_two:
                ch = chords[0] if step < 8 else chords[1]
                for n in V[ch]:
                    P['rhodes'].add(at(bar, step) + rng.uniform(0, 0.012), ln / 4 * 0.95, n, hum(base * acc))

    # Bass: root, fifth, octave and a chromatic approach into the next bar.
    for bar, chords in enumerate(CHART):
        nxt = root(CHART[(bar + 1) % BARS][0])
        r1 = root(chords[0])
        if len(chords) == 2:
            r2 = root(chords[1])
            line = [(0, 3, r1, 96), (6, 2, r1 + 7, 72), (8, 3, r2, 92), (12, 2, r2 + 7, 70), (14, 2, nxt + 1, 74)]
        else:
            v = bar % 4
            if v == 0:
                line = [(0, 4, r1, 98), (6, 2, r1 + 7, 74), (8, 2, r1 + 12, 80), (10, 2, r1 + 7, 70), (14, 2, nxt - 1, 76)]
            elif v == 1:
                line = [(0, 3, r1, 96), (3, 1, r1, 60), (6, 3, r1 + 7, 76), (10, 2, r1 + 5, 70), (12, 2, r1 + 7, 72), (14, 2, nxt + 1, 74)]
            elif v == 2:
                line = [(0, 5, r1, 98), (6, 2, r1 + 12, 78), (8, 2, r1 + 10, 72), (10, 2, r1 + 7, 74), (14, 2, nxt - 1, 76)]
            else:
                line = [(0, 3, r1, 96), (4, 2, r1 + 7, 70), (7, 1, r1 + 12, 66), (8, 4, r1 + 7, 76), (12, 2, r1 + 2, 70), (14, 2, nxt + 2, 72)]
        for step, ln, n, vel in line:
            P['bass'].add(at(bar, step), ln / 4 * 0.92, n, hum(vel, 4))

    for bar, step, n, ln in VIBES:
        P['vibes'].add(at(bar, step), ln / 4, n, hum(84 if bar < 16 else 58))
    for bar, step, n, ln in GUITAR:
        P['guitar'].add(at(bar, step), ln / 4 * 0.95, n - 12, hum(92))
    for bar, step, n, ln in RHODES_SOLO:
        P['rhodes'].add(at(bar, step), ln / 4 * 0.9, n, hum(68))
    for bar, step, n, ln in GLOCK:
        P['glock'].add(at(bar, step, 0), ln / 4, n, hum(52 + (n - 64)))

    # Pad: a soft bed under everything, a little fuller in B and C.
    for bar, chords in enumerate(CHART):
        for i, ch in enumerate(chords):
            beat = bar * 4 + i * 2
            ln = 4 if len(chords) == 1 else 2
            for n in V[ch]:
                P['pad'].add(beat, ln, n - 12, 40 if bar < 16 else 48)

    # Kit (GM: 36 kick, 37 side stick, 42 closed hat, 44 pedal hat, 46 open hat, 51 ride, 53 bell, 49 crash, 70 shaker).
    K = P['kit']
    for bar in range(BARS):
        sec = bar // 8
        kick = [(0, 100), (6, 62), (10, 86)] + ([(14, 58)] if sec == 2 and bar % 2 else [])
        for s, v in kick:
            K.add(at(bar, s), 0.2, 36, hum(v, 5))
        for s, v in [(4, 82), (12, 78)]:
            K.add(at(bar, s), 0.2, 37, hum(v, 5))
        if sec == 3:
            for s in (0, 4, 8, 12):
                K.add(at(bar, s), 0.4, 51, hum(62 if s % 8 == 0 else 52))
            K.add(at(bar, 10), 0.2, 51, hum(40))
            for s in (4, 12):
                K.add(at(bar, s), 0.2, 44, hum(58))
        else:
            for s in range(0, 16, 2):
                K.add(at(bar, s), 0.15, 42, hum(68 if s % 4 == 0 else 48))
            for s in (3, 7, 11, 15):
                K.add(at(bar, s), 0.1, 42, hum(26, 4))
            if bar % 4 == 3:
                K.add(at(bar, 14), 0.4, 46, hum(56))
        if sec == 2:
            for s in range(16):
                K.add(at(bar, s), 0.1, 70, hum(40 if s % 4 == 2 else 26, 4))
        if bar % 2 == 0:
            K.add(at(bar, 0), 0.6, 53, hum(58))  # the two-bar accent
        if bar in (0, 16, 24):
            K.add(at(bar, 0), 2.0, 49, hum(64))
        if bar in (7, 15, 23):
            for s, n in zip((12, 13, 14, 15), (50, 48, 47, 45)):
                K.add(at(bar, s), 0.2, n, hum(70 + s * 2))
        if bar == 31:
            for s in range(8, 16):
                K.add(at(bar, s), 0.1, 38, hum(30 + (s - 8) * 7, 3))
    return P


# ---------- mixing ----------
def rbj(kind, f, q=0.707, gain_db=0.0):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q)
    c = np.cos(w)
    if kind == 'hp':
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'lp':
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'peak':
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    elif kind == 'highshelf':
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
        a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    else:
        raise ValueError(kind)
    return np.array(b) / a[0], np.array(a) / a[0]


def eq(x, *bands):
    for band in bands:
        b, a = rbj(*band)
        x = signal.lfilter(b, a, x, axis=0)
    return x.astype(np.float32)


def pan(x, p):
    a = (p + 1) * np.pi / 4
    m = x.mean(axis=1)
    return np.stack([m * np.cos(a), m * np.sin(a)], axis=1).astype(np.float32)


def reverb_ir(seconds=2.2, predelay=0.02, tone=5200):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)).astype(np.float32) * np.exp(-6.9 * t / seconds)[:, None]
    ir = eq(ir, ('lp', tone), ('hp', 180))
    ir = np.concatenate([np.zeros((int(predelay * SR), 2), np.float32), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0, keepdims=True))


def render(parts, work):
    stems = {}
    for name, p in parts.items():
        mid = os.path.join(work, name + '.mid')
        wav = os.path.join(work, name + '.wav')
        p.write(mid)
        subprocess.run(['fluidsynth', '-ni', '-q', '-R', '0', '-C', '0', '-g', '0.5', '-r', str(SR), '-F', wav, SF2, mid],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        _, x = wavfile.read(wav)
        x = x.astype(np.float32) / 32768.0
        if x.ndim == 1:
            x = np.stack([x, x], axis=1)
        stems[name] = x
    return stems


def main():
    if not os.path.exists(SF2):
        sys.exit(f'SoundFont not found: {SF2}')
    parts = compose()
    with tempfile.TemporaryDirectory() as work:
        stems = render(parts, work)
    total = int((LOOP + 4.0) * SR)
    fit = lambda x: np.concatenate([x, np.zeros((max(0, total - len(x)), 2), np.float32)])[:total]

    #           gain   pan    reverb send   eq
    mixplan = {
        'kit':    (1.05, None, 0.10, [('hp', 35), ('highshelf', 6000, 0.7, 2.0)]),
        'bass':   (0.80, 0.0,  0.03, [('hp', 32), ('peak', 110, 0.9, 1.5), ('lp', 3200)]),
        'rhodes': (0.70, -0.18, 0.24, [('hp', 140), ('peak', 320, 1.0, -3.0), ('highshelf', 3500, 0.7, 2.0)]),
        'vibes':  (0.48, 0.32, 0.36, [('hp', 250), ('highshelf', 4000, 0.7, 2.0)]),
        'guitar': (0.56, -0.34, 0.28, [('hp', 140), ('peak', 2400, 1.0, 1.5)]),
        'pad':    (0.42, None, 0.45, [('hp', 200), ('lp', 5000)]),
        'glock':  (0.42, 0.25, 0.55, [('hp', 500)]),
    }
    dry = np.zeros((total, 2), np.float32)
    send = np.zeros((total, 2), np.float32)
    for name, (g, p, rv, bands) in mixplan.items():
        x = fit(stems[name])
        x = eq(x, *bands) * g
        if p is not None:
            x = pan(x, p)
        dry += x
        send += x * rv
    wet = np.stack([signal.fftconvolve(send[:, c], reverb_ir()[:, c])[:total] for c in range(2)], axis=1).astype(np.float32)
    mix = dry + wet * 0.9
    # Master tone: less low-mid mud, a little air (GT's menu music sits brighter than raw GM sounds).
    mix = eq(mix, ('peak', 260, 0.8, -2.5), ('peak', 1400, 0.9, 2.5), ('highshelf', 3000, 0.7, -2.0))

    # Wrap everything after the loop point back onto the start, then repeat the first second.
    n = int(round(LOOP * SR))
    loop = mix[:n].copy()
    tail = mix[n:]
    loop[: len(tail)] += tail
    out = np.concatenate([loop, loop[:SR]])
    out /= np.abs(out).max() / 0.89

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with tempfile.TemporaryDirectory() as work:
        wav = os.path.join(work, 'lounge.wav')
        wavfile.write(wav, SR, (out * 32767).astype(np.int16))
        # A static gain to about -18 LUFS (loudnorm's dynamic mode would break the loop's periodicity).
        meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', wav, '-af', 'ebur128', '-f', 'null', '-'],
                              capture_output=True, text=True).stderr
        lufs = float(meas.rsplit('I:', 1)[1].split('LUFS')[0])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', f'volume={-18 - lufs:.2f}dB,alimiter=limit=0.89',
                        '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', OUT], check=True)
    print(f'{OUT}: loop {LOOP:.1f} s ({BARS} bars at {BPM} BPM), file {os.path.getsize(OUT) / 1e6:.2f} MB')


if __name__ == '__main__':
    main()
