import React, { useState, useEffect } from 'react';
import { NEIS_CONFIG } from '../constants';

interface ScheduleEvent {
  AA_YMD: string;         // 학사일자 (YYYYMMDD)
  EVENT_NM: string;       // 행사명
  EVENT_CNTNT: string;    // 행사내용
  SBTR_DD_SC_NM: string;  // 수업공제일명
}

const SchoolScheduleTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<number, ScheduleEvent[]>>({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEventCount, setTotalEventCount] = useState(0);

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    // API 키 확인
    if (!NEIS_CONFIG.KEY || NEIS_CONFIG.KEY === "sample key") {
      setError("API 인증키가 설정되지 않았습니다.");
      return;
    }

    setLoading(true);
    setError(null);
    setEvents({});
    setTotalEventCount(0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // 해당 월의 1일과 마지막 날 계산
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    // API 요청 파라미터 구성 (YYYYMMDD 형식)
    const fromYmd = `${year}${String(month).padStart(2, '0')}01`;
    const toYmd = `${year}${String(month).padStart(2, '0')}${String(lastDayOfMonth).padStart(2, '0')}`;

    // API URL 구성 (JSON 요청)
    const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${NEIS_CONFIG.KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${NEIS_CONFIG.ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${NEIS_CONFIG.SD_SCHUL_CODE}&AA_FROM_YMD=${fromYmd}&AA_TO_YMD=${toYmd}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // 성공 응답 구조: { SchoolSchedule: [ { head: [...] }, { row: [...] } ] }
      if (data.SchoolSchedule) {
        const rowData = data.SchoolSchedule.find((item: any) => item.row);
        
        if (rowData && rowData.row) {
           const row = rowData.row as ScheduleEvent[];
           const newEvents: Record<number, ScheduleEvent[]> = {};
           let count = 0;
           
           // 중복 방지를 위한 Set
           const uniqueCheck = new Set<string>();

           row.forEach(item => {
             const day = parseInt(item.AA_YMD.slice(6, 8), 10);
             const eventName = item.EVENT_NM.trim();
             const uniqueKey = `${day}-${eventName}`; // 날짜와 행사명으로 중복 체크

             if (!newEvents[day]) {
               newEvents[day] = [];
             }

             if (!uniqueCheck.has(uniqueKey)) {
                 uniqueCheck.add(uniqueKey);
                 newEvents[day].push(item);
                 count++;
             }
           });
           
           setEvents(newEvents);
           setTotalEventCount(count);
        }
      } else if (data.RESULT) {
        // INFO-200은 데이터 없음(정상), 그 외는 에러
        if (data.RESULT.CODE === 'INFO-200') {
           setTotalEventCount(0);
           // 데이터가 없는 경우도 정상이므로 에러 메시지는 띄우지 않음
        } else {
           console.warn("API Error Result:", data.RESULT);
           setError(`데이터를 불러올 수 없습니다 (${data.RESULT.MESSAGE})`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      setError("학사일정을 불러오는 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    
    // 지난 달 빈칸
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[120px] bg-gray-50 border border-gray-100"></div>);
    }

    // 이번 달 날짜
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = events[d] || [];
      const positionIndex = firstDayOfMonth + d - 1;
      const isSunday = positionIndex % 7 === 0;
      const isSaturday = positionIndex % 7 === 6;
      
      const dateObj = new Date(year, month, d);
      const isToday = new Date().toDateString() === dateObj.toDateString();

      days.push(
        <div key={d} className={`min-h-[100px] md:min-h-[120px] border border-gray-100 p-1 md:p-2 flex flex-col relative transition-colors hover:bg-indigo-50 ${isToday ? 'bg-indigo-50 ring-2 ring-indigo-300 ring-inset' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-1">
             <span className={`text-sm font-bold ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'} ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1 shadow-sm' : ''}`}>
               {d}
             </span>
          </div>
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {dayEvents.map((event, idx) => (
              <div 
                key={idx} 
                title={event.EVENT_CNTNT || event.SBTR_DD_SC_NM || event.EVENT_NM} // 툴팁으로 상세 내용 표시
                className={`text-xs rounded px-1.5 py-1 leading-tight font-medium break-keep shadow-sm border cursor-help
                  ${event.SBTR_DD_SC_NM === '휴업일' || event.EVENT_NM.includes('방학') 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}
              >
                {event.EVENT_NM}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="h-full flex flex-col p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 gap-4">
        <h2 className="text-xl md:text-2xl font-black text-indigo-900 flex items-center gap-2">
          📅 학사 일정
        </h2>
        
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full shadow-inner">
           <button 
             onClick={() => changeMonth(-1)}
             className="w-10 h-10 rounded-full bg-white hover:bg-indigo-100 flex items-center justify-center text-gray-600 transition-colors shadow-sm text-lg font-bold"
           >
             ◀
           </button>
           <span className="text-xl md:text-2xl font-bold text-gray-800 tabular-nums min-w-[140px] text-center">
             {currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}
           </span>
           <button 
             onClick={() => changeMonth(1)}
             className="w-10 h-10 rounded-full bg-white hover:bg-indigo-100 flex items-center justify-center text-gray-600 transition-colors shadow-sm text-lg font-bold"
           >
             ▶
           </button>
        </div>
        
        <button 
          onClick={goToToday}
          className="hidden md:block px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-bold text-sm transition-colors"
        >
          오늘로 이동
        </button>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekDays.map((day, idx) => (
            <div key={day} className={`text-center py-2 md:py-3 font-bold text-sm md:text-base ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Loading / Error / Grid */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50/50">
           {loading && (
             <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <div className="text-indigo-600 font-bold text-sm">일정을 불러오는 중...</div>
               </div>
             </div>
           )}
           
           {error && !loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-4 bg-white/90">
               <div className="text-red-500 font-bold text-lg mb-2">⚠️ {error}</div>
               {error.includes("API 인증키") && (
                 <p className="text-sm text-gray-500 max-w-md">
                   코드의 <code>constants.ts</code> 파일에서 <code>NEIS_CONFIG</code>의 <code>KEY</code>를 확인해주세요.
                 </p>
               )}
             </div>
           )}

           <div className="grid grid-cols-7 border-collapse min-h-full">
             {renderCalendar()}
           </div>
        </div>

        {/* Status Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs md:text-sm text-gray-500 flex justify-between items-center">
            <span>
              {totalEventCount === 0 && !loading && !error ? '📅 이번 달은 등록된 학사일정이 없습니다.' : `총 ${totalEventCount}개의 일정이 있습니다.`}
            </span>
            <span className="hidden md:inline text-gray-400">행사명을 마우스로 가리키면 상세 내용이 보입니다.</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolScheduleTab;