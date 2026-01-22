import React from 'react';
import { KEYBOARD_MAP } from '../constants';

interface Props {
  highlightChars: string[]; // Hangul Jamo characters to highlight
}

const VirtualKeyboard: React.FC<Props> = ({ highlightChars }) => {
  // Translate Hangul chars to QWERTY keys for ID matching
  const highlightedKeys = highlightChars.map(c => KEYBOARD_MAP[c] || c);

  // Helper to determine key style
  const getKeyColor = (qwerty: string, type: 'left' | 'right' | 'shift') => {
    if (type === 'shift') return 'bg-pink-100 border-pink-200';
    
    // Left Hand (Consonants)
    // Col 1: q, a, z -> Pink
    if (['q', 'a', 'z'].includes(qwerty)) return 'bg-pink-100 border-pink-200';
    // Col 2: w, s, x -> Orange
    if (['w', 's', 'x'].includes(qwerty)) return 'bg-orange-100 border-orange-200';
    // Col 3: e, d, c -> Yellow
    if (['e', 'd', 'c'].includes(qwerty)) return 'bg-yellow-100 border-yellow-200';
    // Col 4/5: r, t, f, g, v -> Green
    if (['r', 't', 'f', 'g', 'v'].includes(qwerty)) return 'bg-green-100 border-green-200';

    // Right Hand (Vowels)
    // Group 1: y, u, i, h, j, k, b, n -> Blue (Note: b is 'ㅠ' which is vowel in 2-set, handled by right hand usually visually or grouped with vowels)
    if (['y', 'u', 'i', 'h', 'j', 'k', 'b', 'n'].includes(qwerty)) return 'bg-blue-100 border-blue-200';
    // Group 2: o, p, l, m -> Purple (Note: m is 'ㅡ')
    if (['o', 'p', 'l', 'm'].includes(qwerty)) return 'bg-purple-100 border-purple-200';

    return 'bg-white border-gray-200';
  };

  const renderKey = (qwerty: string, hangul: string, shiftHangul?: string, width = 'w-12', type: 'left' | 'right' | 'shift' = 'left') => {
    const isHighlighted = highlightedKeys.includes(qwerty) || highlightedKeys.includes(qwerty.toUpperCase());
    const baseColor = getKeyColor(qwerty, type);
    
    // Override color if highlighted? 
    // Actually, usually we keep the color but add a ring/glow.
    
    return (
      <div 
        className={`${width} h-12 m-1 rounded-xl shadow-sm flex flex-col relative items-center justify-center border-b-4 transition-all duration-100 
          ${baseColor}
          ${isHighlighted ? 'ring-4 ring-indigo-400 transform scale-105 z-10' : ''}`}
      >
        {shiftHangul && (
          <span className="absolute top-1 left-2 text-[10px] text-gray-400 font-bold">{shiftHangul}</span>
        )}
        <span className="text-xl font-bold text-gray-800">{hangul}</span>
        {/* We can hide the english letter or make it very small if we want to match the image strictly. 
            The image has no english letters. Let's hide them for cleaner look. 
        */}
      </div>
    );
  };

  const renderShift = (width = 'w-24') => (
    <div className={`${width} h-12 m-1 rounded-xl bg-pink-100 border-pink-200 shadow-sm flex items-center justify-center border-b-4`}>
       <span className="font-bold text-gray-800">SHIFT</span>
    </div>
  );

  return (
    <div className="bg-slate-50 p-4 rounded-3xl inline-block shadow-inner border border-gray-200">
      {/* Row 1 */}
      <div className="flex justify-center mb-1 gap-1">
        {/* Left Hand */}
        {renderKey('q', 'ㅂ', 'ㅃ', 'w-12', 'left')}
        {renderKey('w', 'ㅈ', 'ㅉ', 'w-12', 'left')}
        {renderKey('e', 'ㄷ', 'ㄸ', 'w-12', 'left')}
        {renderKey('r', 'ㄱ', 'ㄲ', 'w-12', 'left')}
        {renderKey('t', 'ㅅ', 'ㅆ', 'w-12', 'left')}
        
        <div className="w-4"></div> {/* Gap */}

        {/* Right Hand */}
        {renderKey('y', 'ㅛ', undefined, 'w-12', 'right')}
        {renderKey('u', 'ㅕ', undefined, 'w-12', 'right')}
        {renderKey('i', 'ㅑ', undefined, 'w-12', 'right')}
        {renderKey('o', 'ㅐ', 'ㅒ', 'w-12', 'right')}
        {renderKey('p', 'ㅔ', 'ㅖ', 'w-12', 'right')}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center mb-1 gap-1">
         {/* Left Hand */}
        {renderKey('a', 'ㅁ', undefined, 'w-12', 'left')}
        {renderKey('s', 'ㄴ', undefined, 'w-12', 'left')}
        {renderKey('d', 'ㅇ', undefined, 'w-12', 'left')}
        {renderKey('f', 'ㄹ', undefined, 'w-12', 'left')}
        {renderKey('g', 'ㅎ', undefined, 'w-12', 'left')}

        <div className="w-4"></div> {/* Gap */}

        {/* Right Hand */}
        {renderKey('h', 'ㅗ', undefined, 'w-12', 'right')}
        {renderKey('j', 'ㅓ', undefined, 'w-12', 'right')}
        {renderKey('k', 'ㅏ', undefined, 'w-12', 'right')}
        {renderKey('l', 'ㅣ', undefined, 'w-12', 'right')}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1">
        {renderShift()}
        {renderKey('z', 'ㅋ', undefined, 'w-12', 'left')}
        {renderKey('x', 'ㅌ', undefined, 'w-12', 'left')}
        {renderKey('c', 'ㅊ', undefined, 'w-12', 'left')}
        {renderKey('v', 'ㅍ', undefined, 'w-12', 'left')}
        
        <div className="w-4"></div> {/* Gap */}
        
        {renderKey('b', 'ㅠ', undefined, 'w-12', 'right')}
        {renderKey('n', 'ㅜ', undefined, 'w-12', 'right')}
        {renderKey('m', 'ㅡ', undefined, 'w-12', 'right')}
        {renderShift()}
      </div>
      
    </div>
  );
};

export default VirtualKeyboard;