// Hangul composition constants
const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;
const CHO_BASE = 588;
const JUNG_BASE = 28;

// Initial consonants (Chosung)
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Medial vowels (Jungsung)
const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// Final consonants (Jongsung) - Index 0 is empty (no batchim)
// const JONGSUNG = [
//   '', 'ㄱ', 'ㄲ', 'GS', 'ㄴ', 'NJ', 'NH', 'ㄷ', 'ㄹ', 'LG', 'LM', 'LB', 'LS', 'LT', 'LP', 'LH', 'ㅁ', 'ㅂ', 'BS', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
// ];

/**
 * Decomposes a Hangul character into its constituent Jamo.
 * Returns an array of Jamo characters (e.g. '강' -> ['ㄱ', 'ㅏ', 'ㅇ'])
 * Only returns Cho and Jung for the purpose of keyboard highlighting as per request ("First consonant + First vowel").
 */
export const decomposeHangul = (char: string): string[] => {
  const code = char.charCodeAt(0);

  // Check if it's a valid Hangul syllable
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const offset = code - HANGUL_START;
    const choIndex = Math.floor(offset / CHO_BASE);
    const jungIndex = Math.floor((offset % CHO_BASE) / JUNG_BASE);
    
    // We only need Chosung and Jungsung for the visual hint as requested
    return [CHOSUNG[choIndex], JUNGSUNG[jungIndex]];
  }
  
  // Return the char itself if it's a standalone Jamo or other character
  return [char];
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
