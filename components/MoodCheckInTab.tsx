import React, { useState } from 'react';
import { Mood, StudentMood } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS } from '../constants';

interface Props {
  students: StudentMood[];
  onUpdateMood: (id: number, mood: Mood) => void;
}

const MoodCheckInTab: React.FC<Props> = ({ students, onUpdateMood }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleCellClick = (id: number) => {
    setSelectedId(id);
  };

  const handleMoodSelect = (mood: Mood) => {
    if (selectedId !== null) {
      onUpdateMood(selectedId, mood);
      setSelectedId(null);
    }
  };

  // Helper to determine cell background color
  const getCellColor = (id: number) => {
    if (id === 0) return 'bg-white border-4 border-yellow-400'; // Teacher
    // Colors matching row distribution in 9-column grid (1-9, 10-18, 19-26)
    if (id >= 1 && id <= 9) return 'bg-red-50 border-2 border-red-200';
    if (id >= 10 && id <= 18) return 'bg-green-50 border-2 border-green-200';
    return 'bg-blue-50 border-2 border-blue-200';
  };

  return (
    <div className="h-full flex flex-col p-2 max-w-7xl mx-auto overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
        {/* Grid Container: grid-cols-9 ensures 1-9, 10-18, 19-27 layout on wider screens */}
        <div className="grid grid-cols-5 md:grid-cols-9 gap-2 w-full px-2">
           
           {/* Teacher Cell (ID 0) - Spans full width of the grid */}
           <div 
             onClick={() => handleCellClick(0)}
             className={`col-span-5 md:col-span-9 h-16 md:h-20 rounded-xl flex flex-row items-center justify-center gap-4 cursor-pointer shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 ${getCellColor(0)}`}
           >
             <span className="text-base md:text-lg font-bold text-gray-400">선생님</span>
             <span className="text-4xl md:text-5xl">{students.find(s => s.id === 0)?.mood ? MOOD_EMOJIS[students.find(s => s.id === 0)!.mood!] : '😊'}</span>
           </div>

           {/* Students */}
           {students.filter(s => s.id !== 0).map((student) => (
             <div
               key={student.id}
               onClick={() => handleCellClick(student.id)}
               className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 ${getCellColor(student.id)}`}
             >
               <span className="text-[10px] md:text-xs font-bold text-gray-500 mb-0.5">{student.id}번</span>
               <span className="text-3xl md:text-4xl">
                 {student.mood ? MOOD_EMOJIS[student.mood] : <span className="opacity-20 text-2xl">😶</span>}
               </span>
             </div>
           ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-4 flex-wrap bg-white/60 p-2 rounded-xl flex-shrink-0 backdrop-blur-sm">
        {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-xl">{emoji}</span>
            <span className="text-xs font-medium text-gray-700">{MOOD_LABELS[key] || key}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedId(null)}>
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
              {selectedId === 0 ? '선생님' : `${selectedId}번 학생`}, 기분이 어때요?
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => handleMoodSelect(key as Mood)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-200 group"
                >
                  <span className="text-5xl md:text-6xl mb-2 group-hover:scale-110 transition-transform">{emoji}</span>
                  <span className="font-medium text-gray-500 group-hover:text-indigo-600 text-sm mt-1">{MOOD_LABELS[key] || key}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setSelectedId(null)}
              className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCheckInTab;