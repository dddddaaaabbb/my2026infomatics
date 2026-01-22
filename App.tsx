import React, { useState, useEffect } from 'react';
import { Tab, StudentMood, Mood } from './types';
import IntroTab from './components/IntroTab';
import MoodCheckInTab from './components/MoodCheckInTab';
import MoodStatsTab from './components/MoodStatsTab';
import TimerTab from './components/TimerTab';
import RandomPickerTab from './components/RandomPickerTab';
import TypingPracticeTab from './components/TypingPracticeTab';
import GameHubTab from './components/GameHubTab';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.INTRO);
  const [currentClass, setCurrentClass] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Global Mood State: Storing map of ClassID -> StudentMood[]
  // In a real app, this would be in a Context or Redux/Zustand
  const [moodData, setMoodData] = useState<Record<number, StudentMood[]>>({
    1: generateInitialData(),
    2: generateInitialData(),
    3: generateInitialData(),
    4: generateInitialData(),
    5: generateInitialData(),
  });

  function generateInitialData() {
    const data: StudentMood[] = [];
    // Teacher (ID 0)
    data.push({ id: 0, mood: null });
    // Students (1-26)
    for (let i = 1; i <= 26; i++) {
      data.push({ id: i, mood: null });
    }
    return data;
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateMood = (id: number, mood: Mood) => {
    setMoodData(prev => ({
      ...prev,
      [currentClass]: prev[currentClass].map(s => s.id === id ? { ...s, mood } : s)
    }));
  };

  const formattedDate = currentTime.toLocaleDateString('ko-KR', { 
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
  });
  const formattedTime = currentTime.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', minute: '2-digit' 
  });

  const navItems = [
    { id: Tab.INTRO, label: 'Y쌤 소개' },
    { id: Tab.MOOD_CHECK, label: '감정 출석부' },
    { id: Tab.MOOD_STATS, label: '학급 온도계' },
    { id: Tab.TIMER, label: '타이머' },
    { id: Tab.PICKER, label: '발표 뽑기' },
    { id: Tab.TYPING, label: '타자 연습' },
    { id: Tab.GAME, label: '오락실' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-indigo-600 text-white shadow-md flex justify-between items-center px-6 py-3 flex-shrink-0 z-50">
        <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
          <span>🚀</span> 미래를 설계하는 Y쌤의 정보시간
        </h1>
        <div className="flex items-center gap-4 text-sm md:text-lg font-medium">
          <span className="opacity-90">{formattedDate}</span>
          <span className="bg-indigo-700 px-3 py-1 rounded-lg shadow-inner font-mono">{formattedTime}</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 px-4 py-4 text-center font-bold text-lg whitespace-nowrap transition-colors border-b-4 ${
                currentTab === item.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === Tab.INTRO && <IntroTab />}
        {currentTab === Tab.MOOD_CHECK && (
          <MoodCheckInTab 
            students={moodData[currentClass]} 
            onUpdateMood={handleUpdateMood}
          />
        )}
        {currentTab === Tab.MOOD_STATS && (
           <MoodStatsTab students={moodData[currentClass]} />
        )}
        {currentTab === Tab.TIMER && <TimerTab />}
        {currentTab === Tab.PICKER && <RandomPickerTab />}
        {currentTab === Tab.TYPING && <TypingPracticeTab />}
        {currentTab === Tab.GAME && <GameHubTab />}
      </main>
    </div>
  );
};

export default App;