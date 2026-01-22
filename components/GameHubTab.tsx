import React, { useState } from 'react';
import TetrisGameTab from './TetrisGameTab';
import VaccineRunTab from './VaccineRunTab';
import TicTacToeTab from './TicTacToeTab';
import MagicSquareTab from './MagicSquareTab';
import HanoiGameTab from './HanoiGameTab';
import BreakoutGameTab from './BreakoutGameTab';

type GameType = 'MENU' | 'TETRIS' | 'VACCINE_RUN' | 'TIC_TAC_TOE' | 'MAGIC_SQUARE' | 'HANOI' | 'BREAKOUT';

const GameHubTab: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('MENU');

  const renderMenu = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 overflow-y-auto relative">
      {/* Background Decor Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s'}}></div>

      <h2 className="text-4xl font-black text-violet-900 mb-2 animate-bounce mt-8 md:mt-0 drop-shadow-sm z-10">🎮 Y쌤의 오락실</h2>
      <p className="text-violet-600 mb-8 font-medium z-10">두뇌 회전과 순발력을 위한 미니게임 모음</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full pb-8 z-10">
        
        {/* Tetris Card - Neon Indigo */}
        <button 
          onClick={() => setCurrentGame('TETRIS')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-indigo-500 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🧩</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">데이터 스택</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">데이터를 차곡차곡 쌓아 한 줄을 완성하고,<br/>시스템 점수를 획득하세요!</p>
        </button>

        {/* Vaccine Run Card - Neon Pink/Rose */}
        <button 
          onClick={() => setCurrentGame('VACCINE_RUN')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-rose-500 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(244,63,94,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🏃‍♂️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">백신 런</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">보안 로봇이 되어<br/>악성 바이러스를 피하세요!</p>
        </button>

        {/* Breakout Card - Neon Cyan */}
        <button 
          onClick={() => setCurrentGame('BREAKOUT')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-cyan-400 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(34,211,238,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🧱</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">보안 가디언즈</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">방화벽 패들로 바이러스를 막고<br/>시스템을 지켜내세요!</p>
        </button>

        {/* Tic-Tac-Toe Card - Neon Orange */}
        <button 
          onClick={() => setCurrentGame('TIC_TAC_TOE')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-orange-400 shadow-[0_10px_30px_-10px_rgba(251,146,60,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(251,146,60,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">⭕❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">틱택토</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">AI와 펼치는 전략 대결!<br/>빈틈을 노려 승리하세요.</p>
        </button>

        {/* Magic Square Card - Neon Emerald */}
        <button 
          onClick={() => setCurrentGame('MAGIC_SQUARE')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-emerald-400 shadow-[0_10px_30px_-10px_rgba(52,211,153,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(52,211,153,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🔐</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">암호 보안 매트릭스</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">가로, 세로, 대각선의 합을 맞춰<br/>데이터의 무결성을 증명하고 시스템을 수호하세요!</p>
        </button>

        {/* Hanoi Firewall Card - Neon Blue */}
        <button 
          onClick={() => setCurrentGame('HANOI')}
          className="relative group flex flex-col items-center p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 
            bg-white/80 backdrop-blur-md border border-white/60
            border-b-4 border-blue-500 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)]"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🛡️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">하노이의 방화벽</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">데이터 순서를 지키며<br/>안전하게 서버를 이전하세요!</p>
        </button>

      </div>
    </div>
  );

  return (
    <div className="h-full relative">
      {currentGame !== 'MENU' && (
        <button 
          onClick={() => setCurrentGame('MENU')}
          className="hidden md:block absolute top-4 left-4 z-50 bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full font-bold shadow-md backdrop-blur-sm border border-gray-200 transition-all active:scale-95"
        >
          🔙 게임 목록
        </button>
      )}

      {currentGame === 'MENU' && renderMenu()}
      {currentGame === 'TETRIS' && <TetrisGameTab onBack={() => setCurrentGame('MENU')} />}
      {currentGame === 'VACCINE_RUN' && <VaccineRunTab onBack={() => setCurrentGame('MENU')} />}
      {currentGame === 'TIC_TAC_TOE' && <TicTacToeTab onBack={() => setCurrentGame('MENU')} />}
      {currentGame === 'MAGIC_SQUARE' && <MagicSquareTab onBack={() => setCurrentGame('MENU')} />}
      {currentGame === 'HANOI' && <HanoiGameTab onBack={() => setCurrentGame('MENU')} />}
      {currentGame === 'BREAKOUT' && <BreakoutGameTab onBack={() => setCurrentGame('MENU')} />}
    </div>
  );
};

export default GameHubTab;