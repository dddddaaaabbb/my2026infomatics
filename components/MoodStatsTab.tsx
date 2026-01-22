import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { StudentMood, Mood } from '../types';
import { MOOD_EMOJIS } from '../constants';

interface Props {
  students: StudentMood[];
}

const MoodStatsTab: React.FC<Props> = ({ students }) => {
  // Aggregate data
  const moodCounts: Record<string, number> = {};
  
  // Initialize with 0
  Object.keys(MOOD_EMOJIS).forEach(key => {
    moodCounts[key] = 0;
  });

  // Count
  let totalResponses = 0;
  students.forEach(s => {
    if (s.mood) {
      moodCounts[s.mood]++;
      totalResponses++;
    }
  });

  const data = Object.keys(MOOD_EMOJIS).map(key => ({
    name: key,
    emoji: MOOD_EMOJIS[key],
    count: moodCounts[key],
    fill: getMoodColor(key)
  }));

  // Filter out zero counts for Pie Chart to look cleaner
  const pieData = data.filter(d => d.count > 0);

  function getMoodColor(mood: string) {
    switch(mood) {
      case 'happy': return '#FCD34D'; // Yellow
      case 'excited': return '#F59E0B'; // Amber
      case 'neutral': return '#9CA3AF'; // Gray
      case 'focused': return '#3B82F6'; // Blue
      case 'tired': return '#8B5CF6'; // Purple
      case 'sad': return '#60A5FA'; // Light Blue
      case 'angry': return '#EF4444'; // Red
      case 'annoyed': return '#F97316'; // Orange
      case 'confused': return '#10B981'; // Green (Fallback)
      default: return '#E5E7EB';
    }
  }

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fontSize={24}>
          {MOOD_EMOJIS[payload.value]}
        </text>
      </g>
    );
  };

  return (
    <div className="h-full p-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-indigo-900 mb-2">우리 반 마음 날씨 🌦️</h2>
      <p className="text-gray-500 mb-8 text-lg">참여 인원: {totalResponses}명</p>

      <div className="flex w-full h-full gap-8 flex-col lg:flex-row">
        {/* Bar Chart */}
        <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 flex flex-col">
          <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">감정 분포 (막대)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={<CustomTick />} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 flex flex-col">
          <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">감정 비율 (원형)</h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodStatsTab;