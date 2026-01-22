import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onBack: () => void;
}

// --- Constants & Solutions ---

// Standard 3x3 Magic Square (Lo Shu)
// 8 1 6
// 3 5 7
// 4 9 2
const SOLUTION_3X3 = [
  8, 1, 6,
  3, 5, 7,
  4, 9, 2
];

// Standard 4x4 Magic Square (Albrecht Dürer)
// 16 3 2 13
// 5 10 11 8
// 9 6 7 12
// 4 15 14 1
const SOLUTION_4X4 = [
  16, 3, 2, 13,
  5, 10, 11, 8,
  9, 6, 7, 12,
  4, 15, 14, 1
];

const MagicSquareTab: React.FC<Props> = ({ onBack }) => {
  // 3 or 4
  const [gridSize, setGridSize] = useState(3);
  
  // Grid Data
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [fixedCells, setFixedCells] = useState<boolean[]>([]); // Tracks cells that are pre-filled
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  
  // Game State
  const [showManual, setShowManual] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Constants based on size
  const magicConstant = gridSize === 3 ? 15 : 34;
  const maxNumber = gridSize * gridSize;

  // Initialize
  useEffect(() => {
    // We defer game start until manual is closed or initial load
    if (!showManual) {
      startNewPuzzle();
    }
  }, [gridSize]); // Only re-run if size changes

  const transformSolution = (base: number[], size: number) => {
    let current = [...base];

    // Helper to get index
    const idx = (r: number, c: number) => r * size + c;

    // Random Transformations
    const operations = Math.floor(Math.random() * 10) + 1; // 1 to 10 random ops
    
    for (let op = 0; op < operations; op++) {
      const type = Math.random();
      const next = new Array(base.length);

      if (type < 0.33) {
        // Reflect Horizontal
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            next[idx(r, size - 1 - c)] = current[idx(r, c)];
          }
        }
      } else if (type < 0.66) {
        // Reflect Vertical
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            next[idx(size - 1 - r, c)] = current[idx(r, c)];
          }
        }
      } else {
        // Transpose (Swap rows/cols)
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            next[idx(c, r)] = current[idx(r, c)];
          }
        }
      }
      current = next;
    }
    return current;
  };

  const startNewPuzzle = () => {
    const baseSolution = gridSize === 3 ? SOLUTION_3X3 : SOLUTION_4X4;
    const puzzleSolution = transformSolution(baseSolution, gridSize);

    // Determine how many hints to show
    const hintCount = gridSize === 3 ? 3 : 6; 
    
    // Pick random indices
    const indices = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const newFixed = new Array(gridSize * gridSize).fill(false);
    const newGrid = new Array(gridSize * gridSize).fill(null);

    // Fill hints
    for (let k = 0; k < hintCount; k++) {
      const cellIdx = indices[k];
      newGrid[cellIdx] = puzzleSolution[cellIdx];
      newFixed[cellIdx] = true;
    }

    setGrid(newGrid);
    setFixedCells(newFixed);
    setIsSuccess(false);
    setSelectedCell(null);
    setErrorMsg('');
  };

  const resetGame = () => {
    // Just clear non-fixed cells
    const newGrid = grid.map((val, idx) => fixedCells[idx] ? val : null);
    setGrid(newGrid);
    setIsSuccess(false);
    setSelectedCell(null);
    setErrorMsg('');
  };

  const handleStartGame = () => {
    setShowManual(false);
    startNewPuzzle();
  };

  // Helper to calculate sums
  const getRowSum = (rowIdx: number) => {
    let sum = 0;
    for (let i = 0; i < gridSize; i++) {
      sum += (grid[rowIdx * gridSize + i] || 0);
    }
    return sum;
  };

  const getColSum = (colIdx: number) => {
    let sum = 0;
    for (let i = 0; i < gridSize; i++) {
      sum += (grid[i * gridSize + colIdx] || 0);
    }
    return sum;
  };

  const getDiagSums = () => {
    let d1 = 0;
    let d2 = 0;
    for (let i = 0; i < gridSize; i++) {
      d1 += (grid[i * gridSize + i] || 0); // Top-left to bottom-right
      d2 += (grid[i * gridSize + (gridSize - 1 - i)] || 0); // Top-right to bottom-left
    }
    return [d1, d2];
  };

  const checkWinCondition = useCallback(() => {
    // 1. Check if full
    if (grid.includes(null)) return;

    // 2. Check all sums
    let win = true;
    for (let i = 0; i < gridSize; i++) {
      if (getRowSum(i) !== magicConstant) win = false;
      if (getColSum(i) !== magicConstant) win = false;
    }
    const [d1, d2] = getDiagSums();
    if (d1 !== magicConstant || d2 !== magicConstant) win = false;

    if (win) {
      setIsSuccess(true);
      setErrorMsg('');
    }
  }, [grid, gridSize, magicConstant]);

  useEffect(() => {
    if (!showManual && !isSuccess) {
      checkWinCondition();
    }
  }, [grid, checkWinCondition, showManual, isSuccess]);

  const handleNumberClick = (num: number) => {
    if (selectedCell === null || isSuccess) {
      if (!isSuccess) setErrorMsg('숫자를 넣을 칸을 먼저 선택해주세요.');
      return;
    }

    // Cannot modify fixed cells (should act guarded by selection logic, but double check)
    if (fixedCells[selectedCell]) return;

    // Check duplicate
    const existingIdx = grid.indexOf(num);
    
    if (existingIdx !== -1) {
       // If same cell, ignore
       if (existingIdx === selectedCell) return;

       // If the number is in a FIXED cell, cannot move it
       if (fixedCells[existingIdx]) {
         setErrorMsg('이 숫자는 고정된 보안 키입니다.');
         return;
       }
       
       // Swap / Move logic
       const newGrid = [...grid];
       newGrid[existingIdx] = null; // Remove from old pos
       newGrid[selectedCell] = num; // Add to new
       setGrid(newGrid);
       setErrorMsg('');
    } else {
       // Place new
       const newGrid = [...grid];
       newGrid[selectedCell] = num;
       setGrid(newGrid);
       setErrorMsg('');
    }
  };

  const handleCellClick = (idx: number) => {
    if (isSuccess) return;
    
    if (fixedCells[idx]) {
      // Maybe visually indicate it's locked?
      setErrorMsg('고정된 슬롯은 수정할 수 없습니다.');
      return;
    }

    setSelectedCell(idx);
    setErrorMsg('');
  };

  const SumBadge: React.FC<{sum: number}> = ({ sum }) => {
    let colorClass = 'bg-gray-100 text-gray-400';
    if (sum === magicConstant) colorClass = 'bg-green-100 text-green-700 ring-2 ring-green-400 font-black';
    else if (sum > magicConstant) colorClass = 'bg-red-50 text-red-500 font-bold';
    else if (sum > 0) colorClass = 'bg-gray-100 text-gray-600 font-bold';

    return (
      <div className={`w-10 h-8 md:w-12 md:h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-300 ${colorClass}`}>
        {sum}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
       
       {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={onBack}
          className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full font-bold shadow-md backdrop-blur-sm transition-all"
        >
          🔙 나가기
        </button>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative border-4 border-indigo-100 flex flex-col md:flex-row h-[700px] md:h-[600px]">
        
        {/* Left: Game Board */}
        <div className="flex-1 p-6 flex flex-col items-center relative border-r border-gray-100">
           
           {/* Grid Selector */}
           <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-full">
             <button 
               onClick={() => { setGridSize(3); setIsSuccess(false); setSelectedCell(null); setErrorMsg(''); }}
               disabled={showManual}
               className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gridSize === 3 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
             >
               3x3 (합 15)
             </button>
             <button 
               onClick={() => { setGridSize(4); setIsSuccess(false); setSelectedCell(null); setErrorMsg(''); }}
               disabled={showManual}
               className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gridSize === 4 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
             >
               4x4 (합 34)
             </button>
           </div>

           <div className="relative p-6 bg-indigo-50/50 rounded-3xl">
              {/* Row Sums (Right) */}
              <div 
                 className="absolute right-[-3rem] top-6 flex flex-col justify-between h-[calc(100%-3rem)] py-2"
                 style={{ gap: gridSize === 3 ? '3.5rem' : '2rem' }} // Adjust gap manually based on size roughly
              >
                 {Array.from({ length: gridSize }).map((_, r) => (
                   <div key={`r-${r}`} className="flex items-center h-full max-h-[60px]">
                     <SumBadge sum={getRowSum(r)} />
                   </div>
                 ))}
              </div>
              
              {/* Grid */}
              <div 
                className={`grid gap-3 mb-2`}
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  width: gridSize === 3 ? '260px' : '300px'
                }}
              >
                 {grid.map((num, idx) => {
                   const isFixed = fixedCells[idx];
                   return (
                     <div 
                       key={idx}
                       onClick={() => handleCellClick(idx)}
                       className={`aspect-square rounded-2xl flex items-center justify-center text-3xl font-black transition-all duration-200 shadow-sm border-2
                         ${selectedCell === idx ? 'border-indigo-500 bg-white ring-4 ring-indigo-200 z-10 scale-105' : ''}
                         ${isFixed ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300' : 'bg-white cursor-pointer hover:bg-indigo-50 border-white'}
                         ${isSuccess ? 'text-green-600 border-green-200 bg-green-50' : ''}
                       `}
                     >
                       {num}
                       {isFixed && <span className="absolute text-[8px] top-1 right-2 text-gray-400">🔒</span>}
                     </div>
                   );
                 })}
              </div>

              {/* Col Sums (Bottom) */}
              <div className="flex justify-between px-1 mt-4">
                 {Array.from({ length: gridSize }).map((_, c) => (
                   <div key={`c-${c}`} className="flex justify-center w-full">
                     <SumBadge sum={getColSum(c)} />
                   </div>
                 ))}
              </div>
           </div>

           {/* Diag Sums */}
           <div className="w-full flex justify-between px-12 mt-6 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-2">
                 <span>↘ 대각선</span>
                 <SumBadge sum={getDiagSums()[0]} />
              </div>
              <div className="flex items-center gap-2">
                 <span>↙ 대각선</span>
                 <SumBadge sum={getDiagSums()[1]} />
              </div>
           </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-[320px] bg-white p-6 flex flex-col items-center justify-center z-10 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)]">
           
           {isSuccess ? (
             <div className="text-center animate-in zoom-in duration-500">
               <div className="text-7xl mb-6 animate-bounce">🔐</div>
               <h3 className="text-3xl font-black text-indigo-900 mb-2">보안 설정 완료!</h3>
               <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-8">
                 System Integrity Verified ✨
               </p>
               <button 
                 onClick={startNewPuzzle} 
                 className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
               >
                 새로운 미션
               </button>
             </div>
           ) : (
             <>
               <div className="mb-6 text-center w-full">
                  <div className={`text-sm font-bold mb-2 transition-colors ${selectedCell !== null ? 'text-indigo-600' : 'text-gray-400'}`}>
                     {selectedCell !== null ? '입력할 보안 코드를 선택하세요' : '빈 슬롯을 먼저 선택하세요'}
                  </div>
                  <div className="h-6 text-red-500 text-xs font-bold bg-red-50 rounded px-2 py-1 inline-block min-w-[200px]">
                    {errorMsg || (selectedCell === null ? "Tip: 검증 합계가 " + magicConstant + "이 되어야 합니다." : "1 ~ " + maxNumber + " 코드를 입력하세요.")}
                  </div>
               </div>

               {/* Keypad */}
               <div 
                 className="grid gap-2 w-full max-w-[280px]"
                 style={{ gridTemplateColumns: `repeat(${gridSize === 3 ? 3 : 4}, 1fr)` }}
               >
                  {Array.from({ length: maxNumber }).map((_, i) => {
                    const num = i + 1;
                    const isUsed = grid.includes(num);
                    const isUsedFixed = isUsed && grid.indexOf(num) !== -1 && fixedCells[grid.indexOf(num)];

                    return (
                      <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        disabled={selectedCell === null}
                        className={`aspect-square rounded-xl font-bold text-lg shadow-sm transition-all duration-200 border-b-4
                          ${isUsedFixed
                             ? 'bg-gray-200 text-gray-400 border-transparent shadow-none cursor-not-allowed'
                             : isUsed 
                               ? 'bg-indigo-50 text-indigo-300 border-indigo-100 shadow-inner' 
                               : 'bg-white border-indigo-100 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 active:scale-90 active:border-t-4 active:border-b-0'}
                          ${selectedCell === null ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {num}
                      </button>
                    );
                  })}
               </div>
               
               <div className="flex gap-4 mt-8">
                  <button 
                    onClick={resetGame}
                    className="text-gray-400 font-bold text-sm hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-red-50"
                  >
                    <span>↺</span> 초기화
                  </button>
                  <button 
                    onClick={startNewPuzzle}
                    className="text-indigo-400 font-bold text-sm hover:text-indigo-600 flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-indigo-50"
                  >
                    <span>✨</span> 새 미션
                  </button>
               </div>
             </>
           )}
        </div>

        {/* Manual Overlay */}
        {showManual && (
           <div className="absolute inset-0 bg-white/95 z-40 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
              <div className="bg-indigo-50 p-6 rounded-full mb-6 text-6xl shadow-inner border border-indigo-100">🔐</div>
              <h2 className="text-4xl font-black text-gray-800 mb-8">암호 보안 매트릭스</h2>
              
              <div className="bg-white border-2 border-indigo-100 rounded-3xl p-8 shadow-xl max-w-md text-left space-y-6 mb-10 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                 <div className="flex items-start gap-4">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-md">1</span>
                    <div>
                      <strong className="block text-gray-800 mb-1">보안 코드 입력</strong>
                      <p className="text-gray-600 text-sm">1부터 {maxNumber}까지의 숫자를 <strong>중복 없이</strong> 사용하여 빈 보안 슬롯을 채우세요.</p>
                      <p className="text-xs text-indigo-500 mt-1">* 회색은 고정된 보안 키입니다.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-md">2</span>
                    <div>
                      <strong className="block text-gray-800 mb-1">무결성 검증 ({magicConstant})</strong>
                      <p className="text-gray-600 text-sm">가로, 세로, 대각선 방향의 합이 모두 <strong>{magicConstant}</strong>가 되어야 시스템이 보호됩니다.</p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleStartGame}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 rounded-full font-black text-xl shadow-lg hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>도전하기</span>
                  <span>🚀</span>
                </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default MagicSquareTab;