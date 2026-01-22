import React, { useState, useEffect } from 'react';
import { TEACHER_INFO, NEIS_CONFIG } from '../constants';

interface MealData {
  menu: string;
  cal: string;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  code: number;
  pm10: number;
  pm25: number;
  uv: number;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

const DEFAULT_LOCATION: LocationData = {
  name: '인천 부평구',
  lat: 37.5070,
  lon: 126.7219
};

const IntroTab: React.FC = () => {
  // Meal State
  const [todayMeal, setTodayMeal] = useState<MealData | null>(null);
  const [mealLoading, setMealLoading] = useState(false);

  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather States
  const [location, setLocation] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('my_weather_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch (e) {
      return DEFAULT_LOCATION;
    }
  });
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Weather Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  useEffect(() => {
    fetchMealInfo();
    // Clock interval
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather(location.lat, location.lon);
  }, [location]);

  // 1. Fetch Meal Info
  const fetchMealInfo = async () => {
    setMealLoading(true);
    try {
      const today = new Date();
      const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_CONFIG.KEY}&Type=json&pIndex=1&pSize=5&ATPT_OFCDC_SC_CODE=${NEIS_CONFIG.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${NEIS_CONFIG.SD_SCHUL_CODE}&MLSV_YMD=${ymd}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.mealServiceDietInfo) {
        const row = data.mealServiceDietInfo[1].row;
        const lunch = row.find((r: any) => r.MMEAL_SC_CODE === "2") || row[0];

        if (lunch) {
          const cleanMenu = lunch.DDISH_NM.replace(/\([^)]*\)/g, '').replace(/<br\/>/g, '\n');
          setTodayMeal({
            menu: cleanMenu,
            cal: lunch.CAL_INFO
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch meal info", e);
    } finally {
      setMealLoading(false);
    }
  };

  // 2. Weather Logic
  const fetchWeather = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const [weatherRes, airRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&hourly=uv_index&timezone=auto&forecast_days=1`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5`)
      ]);

      const weatherData = await weatherRes.json();
      const airData = await airRes.json();
      
      const currentHour = new Date().getHours();
      const uv = weatherData.hourly?.uv_index?.[currentHour] ?? 0;
      const pm10 = airData.current?.pm10 ?? 0;
      const pm25 = airData.current?.pm2_5 ?? 0;

      setWeather({
        temp: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        code: weatherData.current.weather_code,
        uv,
        pm10,
        pm25
      });
    } catch (e) {
      console.error("Failed to fetch weather", e);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingApi(true);
    try {
      // Use Open-Meteo Geocoding API
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=ko&format=json`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error("Geocoding failed", e);
      setSearchResults([]);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    const newLoc: LocationData = {
      name: result.name,
      lat: result.latitude,
      lon: result.longitude
    };
    setLocation(newLoc);
    localStorage.setItem('my_weather_location', JSON.stringify(newLoc));
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'; 
    if (code <= 3) return '⛅'; 
    if (code <= 48) return '🌫️'; 
    if (code <= 55) return '🌧️'; 
    if (code <= 67) return '☔'; 
    if (code <= 77) return '❄️'; 
    if (code <= 82) return '🌦️'; 
    if (code <= 99) return '⚡'; 
    return '🌈';
  };

  const getDustColor = (val: number, type: 'pm10' | 'pm25') => {
    if (type === 'pm10') {
      if (val <= 30) return 'text-blue-500';
      if (val <= 80) return 'text-green-500';
      if (val <= 150) return 'text-orange-500';
      return 'text-red-500';
    } else {
      if (val <= 15) return 'text-blue-500';
      if (val <= 35) return 'text-green-500';
      if (val <= 75) return 'text-orange-500';
      return 'text-red-500';
    }
  };

  return (
    <div className="h-full flex flex-col p-4 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex gap-6 items-center border border-indigo-50 flex-shrink-0">
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-4xl shadow-inner border-4 border-indigo-200">
          👩🏻‍🏫
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-2xl font-black text-indigo-900">{TEACHER_INFO.name}</h2>
            <p className="text-lg text-gray-600 font-bold">{TEACHER_INFO.school}</p>
          </div>
          <div className="flex items-center text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit mb-2">
            📧 {TEACHER_INFO.email}
          </div>
          <p className="text-gray-700 text-sm font-medium leading-snug">
            {TEACHER_INFO.intro[0]}
          </p>
        </div>
        
        <a 
          href="https://middle-school-info-class-633415808239.us-west1.run.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex flex-col items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-3 rounded-xl transition-all border border-indigo-100 shadow-sm hover:shadow-md active:scale-95 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🔗</span>
          <span className="text-xs font-bold whitespace-nowrap">수업 링크</span>
        </a>
      </div>

      {/* Main Grid Content (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Specs */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-t-4 border-purple-500 flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center bg-white pb-2 border-b border-purple-100">
            <span className="mr-2">🏆</span> Y쌤을 소개합니다
          </h3>
          <ul className="space-y-2 text-sm mb-4">
            {TEACHER_INFO.specs.map((spec, idx) => (
              <li key={idx} className="text-gray-700 bg-purple-50 p-2 rounded font-medium">{spec}</li>
            ))}
          </ul>
           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex-1 flex flex-col justify-center shadow-inner">
              <strong className="block text-indigo-900 mb-3 border-b-2 border-indigo-200 pb-2 text-lg font-bold">교육 철학</strong>
              <div className="flex flex-col gap-2">
                {TEACHER_INFO.intro.slice(1).map((line, idx) => (
                   <p key={idx} className="text-gray-700 leading-snug text-sm font-medium flex items-start">
                      <span className="mr-2 text-indigo-600">•</span>
                      <span className="break-keep">{line.includes(':') ? line.split(':')[1].trim() : line}</span>
                   </p>
                ))}
              </div>
           </div>
        </div>

        {/* Curriculum */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-t-4 border-blue-500 flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center bg-white pb-2 border-b border-blue-100">
            <span className="mr-2">📚</span> 수업 안내
          </h3>
          <div className="space-y-2 text-sm flex-1 overflow-y-auto">
            {TEACHER_INFO.curriculum.map((item, idx) => (
              <div key={idx} className="bg-blue-50 p-2 rounded">
                <div className="font-black text-blue-600 mb-1">{item.title}</div>
                <div className="text-gray-700 font-medium leading-tight">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-t-4 border-red-500 flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center bg-white pb-2 border-b border-red-100">
            <span className="mr-2">⚠️</span> 이용규칙 & 수업자세
          </h3>
          <div className="space-y-3 flex-1 text-sm overflow-y-auto">
            {TEACHER_INFO.rules.map((rule, idx) => (
              <div key={idx} className="bg-red-50 p-2 rounded">
                <span className="font-bold text-red-700 mr-2">{rule.title}</span>
                <span className="text-gray-700 text-xs">{rule.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Meals, Clock, Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        
        {/* 1. Today's Meal */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-t-4 border-green-500 flex flex-col min-h-[220px]">
           <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center bg-white pb-2 border-b border-green-100">
             <span className="mr-2">🍱</span> 오늘의 급식 (중식)
           </h3>
           <div className="flex-1 flex flex-col items-center justify-center text-center bg-green-50/50 rounded-xl p-4">
             {mealLoading ? (
               <div className="text-green-600 animate-pulse">급식 정보를 불러오는 중...</div>
             ) : todayMeal ? (
               <>
                 <div className="font-bold text-gray-800 mb-2 whitespace-pre-wrap leading-relaxed">{todayMeal.menu}</div>
                 <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">{todayMeal.cal}</div>
               </>
             ) : (
               <div className="text-gray-400">오늘은 급식 정보가 없어요 😴</div>
             )}
           </div>
        </div>

        {/* 2. Real-time Clock */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px] group">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-400"></div>
           <div className="absolute -right-8 -top-8 text-[150px] opacity-5 text-orange-200 select-none pointer-events-none font-black">
              TIME
           </div>

           <div className="text-center z-10 flex flex-col items-center gap-2">
             <div className="text-sm md:text-base font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2 border border-orange-100">
               {currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
             </div>
             <div className="text-5xl md:text-7xl font-black text-gray-800 tracking-tighter tabular-nums leading-none drop-shadow-sm">
               {currentTime.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })}
               <span className="text-2xl md:text-3xl text-gray-400 font-medium ml-1">
                 {currentTime.toLocaleTimeString('ko-KR', { hour12: false, second: '2-digit' }).slice(-2)}
               </span>
             </div>
             <div className="text-xs text-gray-400 mt-2 font-medium">
                오늘도 활기찬 하루 되세요! ✨
             </div>
           </div>
        </div>

        {/* 3. Weather Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-t-4 border-sky-500 flex flex-col relative overflow-hidden min-h-[220px]">
          <div className="flex justify-between items-center border-b border-sky-100 pb-2 mb-3 bg-white">
             <h3 className="text-lg font-bold text-sky-800 flex items-center gap-2">
               <span>🌤️</span> 
               <span>날씨</span>
             </h3>
             <button 
               onClick={() => setIsSearching(!isSearching)}
               className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 px-2 py-1 rounded transition-colors"
             >
               {isSearching ? '닫기' : '지역변경'}
             </button>
          </div>
          
          {isSearching ? (
             <div className="flex-1 flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     className="flex-1 border border-sky-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                     placeholder="도시 이름 (예: 부평)"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                   />
                   <button 
                     onClick={handleSearchLocation}
                     disabled={isSearchingApi}
                     className="bg-sky-500 text-white px-3 py-1 rounded text-sm hover:bg-sky-600 disabled:bg-gray-300"
                   >
                     {isSearchingApi ? '...' : '검색'}
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-sky-50/50 rounded p-1 border border-sky-100 custom-scrollbar">
                   {searchResults.length === 0 ? (
                      <div className="text-gray-400 text-xs text-center py-4">검색 결과가 없습니다.</div>
                   ) : (
                      <ul className="space-y-1">
                        {searchResults.map((res: any) => (
                           <li 
                             key={res.id} 
                             onClick={() => handleSelectLocation(res)}
                             className="text-sm bg-white p-2 rounded cursor-pointer hover:bg-sky-100 border border-transparent hover:border-sky-200 transition-colors"
                           >
                              <div className="font-bold text-gray-800">{res.name}</div>
                              <div className="text-xs text-gray-500">{res.admin1} {res.country}</div>
                           </li>
                        ))}
                      </ul>
                   )}
                </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-sky-50/50 rounded-xl p-4">
               {weatherLoading ? (
                 <div className="text-sky-600 animate-pulse">날씨를 불러오는 중...</div>
               ) : weather ? (
                 <div className="text-center w-full">
                    <div className="mb-2">
                       <span className="text-xs font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full">📍 {location.name}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-5xl">{getWeatherIcon(weather.code)}</span>
                      <span className="text-4xl font-black text-gray-800">{Math.round(weather.temp)}°</span>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-2 shadow-sm w-full grid grid-cols-2 gap-y-1 gap-x-2 text-xs font-bold text-gray-600">
                       <div className="flex justify-between items-center">
                         <span>🌡️ 체감</span>
                         <span className="text-gray-800">{Math.round(weather.feelsLike)}°</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span>☀️ 자외선</span>
                         <span className={weather.uv >= 6 ? 'text-red-500' : 'text-gray-800'}>{weather.uv}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span>😷 미세</span>
                         <span className={getDustColor(weather.pm10, 'pm10')}>{weather.pm10}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span>😷 초미세</span>
                         <span className={getDustColor(weather.pm25, 'pm25')}>{weather.pm25}</span>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="text-gray-400 text-sm">날씨 정보가 없습니다.</div>
               )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default IntroTab;