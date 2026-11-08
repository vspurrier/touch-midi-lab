import type { ChordDefinition } from './hichord';

export const omnichordProfile = {
  id: 'omnichord',
  name: 'Omnichord-inspired',
  chordDefs: [
    ['I', 'Major', [0, 4, 7]], ['ii', 'Minor', [2, 5, 9]], ['iii', 'Minor', [4, 7, 11]],
    ['IV', 'Major', [5, 9, 12]], ['V', 'Major', [7, 11, 14]], ['vi', 'Minor', [9, 12, 16]],
    ['vii°', 'Diminished', [11, 14, 17]]
  ] as ChordDefinition[],
  strumNotes(chord: number[], position: number): number {
    const scale = [...chord, ...chord.map(note => note + 12), ...chord.map(note => note + 24), ...chord.map(note => note + 36)];
    return scale[Math.max(0, Math.min(scale.length - 1, Math.round(position * (scale.length - 1))))];
  }
};
