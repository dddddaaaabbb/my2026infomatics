export type Mood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'annoyed' | 'focused' | 'angry' | null;

export interface StudentMood {
  id: number; // 0 for teacher, 1-26 for students
  mood: Mood;
}

export interface ClassData {
  classId: number; // 1 to 5
  moods: StudentMood[];
}

export enum Tab {
  INTRO = 'INTRO',
  MOOD_CHECK = 'MOOD_CHECK',
  MOOD_STATS = 'MOOD_STATS',
  TIMER = 'TIMER',
  PICKER = 'PICKER',
  TYPING = 'TYPING',
  GAME = 'GAME',
}

export enum TypingMode {
  FINGER = 'FINGER',
  WORD = 'WORD',
  SENTENCE = 'SENTENCE',
}

export enum SentenceCategory {
  KOREAN = 'KOREAN', // Not explicitly requested but good fallback
  SOCIAL = 'SOCIAL',
  SCIENCE = 'SCIENCE',
  IT = 'IT',
}

export interface FallingItem {
  id: number;
  text: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  speed: number;
}