import { SentenceCategory, TypingMode } from './types';

// Emoji Map
export const MOOD_EMOJIS: Record<string, string> = {
  happy: '😄',
  neutral: '😐',
  sad: '😢',
  excited: '🤩',
  tired: '😴',
  annoyed: '😫',
  focused: '🤓',
  angry: '😡',
};

// Korean Labels for Moods
export const MOOD_LABELS: Record<string, string> = {
  happy: '행복',
  neutral: '평온',
  sad: '슬픔',
  excited: '신남',
  tired: '피곤',
  annoyed: '짜증',
  focused: '집중',
  angry: '화남',
};

// Teacher Data
export const TEACHER_INFO = {
  name: "Y쌤",
  school: "인천동수중학교",
  email: "nadia94@gclass.ice.go.kr",
  intro: [
    "인천동수중학교의 유일한 정보교사 양인숙입니다.",
    "창의성 존중: 학생 개인의 특성을 살린 프로젝트형 수업",
    "참여와 실습: 이론을 넘어 직접 만들고 해결하는 알고리즘 중심 학습",
    "함께하는 성장: 협업을 통해 문제 해결 능력을 기르는 스토리텔링 수업"
  ],
  specs: [
    "🎓 교원자격: 정보·컴퓨터 정교사 / 수학 정교사",
    "📜 국내자격증 : 정보처리기사1급 / KT AICE / 컴활1급 / 워드1급",
    "🌐 GLOBAL자격: Google Educator L1 & L2, MS AI-900 (Azure AI Fundamentals)"
  ],
  curriculum: [
    { title: "Algorithm", desc: "논리적 사고를 키우는 알고리즘과 프로그래밍" },
    { title: "Build", desc: "현실 문제 해결, 학생 주도형 프로젝트" },
    { title: "Coding", desc: "코드로 구현하는 창의적인 아이디어" },
    { title: "Data", desc: "세상을 읽는 눈, 데이터 분석 기초" },
    { title: "Ethics", desc: "디지털 시민의 소양, 정보·AI 윤리" }
  ],
  rules: [
    { title: "주변 정리", desc: "수업 시작 전과 후, 나의 학습 공간을 깨끗하게 정돈하기." },
    { title: "기기 관리", desc: "음식물 반입 금지, 수업 후 시스템 종료, 기기를 소중히 다루기" },
    { title: "개인정보 관리", desc: "지정된 교육 사이트 외 접속 자제, 개인정보 노출 주의, 로그아웃" },
    { title: "협력의 자세", desc: "친구가 어려워할 때 정답보다 해결 방법을 함께 고민하기." },
    { title: "정직한 자세", desc: "다른 사람의 코드를 복사하기보다 나의 논리로 한 줄씩 채우기." }
  ]
};

// Typing Data
export const FINGER_PRACTICE = {
  index: ['ㄱ', 'ㅅ', 'ㄹ', 'ㅎ', 'ㅍ', 'ㅛ', 'ㅕ', 'ㅗ', 'ㅓ', 'ㅠ', 'ㅜ'],
  middle: ['ㄷ', 'ㅇ', 'ㅊ', 'ㅑ', 'ㅏ', 'ㅡ'],
  ring: ['ㅈ', 'ㄴ', 'ㅌ', 'ㅐ', 'ㅣ'],
  pinky: ['ㅂ', 'ㅁ', 'ㅋ', 'ㅔ'],
  shift: ['ㅒ', 'ㅖ', 'ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ']
};

export const WORD_PRACTICE = [
  "학교", "컴퓨터", "정보", "선생님", "친구", "알고리즘", "데이터", "인공지능", 
  "키보드", "마우스", "모니터", "인터넷", "코딩", "프로그램", "앱", "웹사이트",
  "스마트폰", "태블릿", "와이파이", "클라우드", "서버", "보안", "해커", "백신",
  "사랑", "우정", "노력", "성장", "꿈", "미래", "희망", "용기"
];

export const SENTENCE_PRACTICE: Record<SentenceCategory, string[]> = {
  [SentenceCategory.KOREAN]: [
     "가는 말이 고와야 오는 말이 곱다.",
     "천 리 길도 한 걸음부터.",
     "세 살 버릇 여든까지 간다."
  ],
  [SentenceCategory.SOCIAL]: [
    "민주주의는 국민이 주인이 되는 정치 형태입니다.",
    "모든 사람은 태어날 때부터 자유롭고 존엄한 권리를 가집니다.",
    "경제 활동은 생산, 분배, 소비로 이루어집니다.",
    "다양성을 존중하는 것이 성숙한 사회의 첫걸음입니다."
  ],
  [SentenceCategory.SCIENCE]: [
    "모든 물질은 매우 작은 입자로 이루어져 있습니다.",
    "지구 계는 지권, 수권, 기권, 생물권, 외권으로 구성됩니다.",
    "식물은 광합성을 통해 빛 에너지를 화학 에너지로 바꿉니다.",
    "힘은 물체의 모양이나 운동 상태를 변화시키는 원인입니다."
  ],
  [SentenceCategory.IT]: [
    "알고리즘은 문제를 해결하기 위한 절차나 방법입니다.",
    "데이터는 현실 세계의 값이나 사실을 문자나 숫자로 표현한 것입니다.",
    "프로그래밍은 컴퓨터에게 일을 시키기 위해 명령어를 작성하는 과정입니다.",
    "디지털 시민성은 온라인 공간에서 책임감 있게 행동하는 태도입니다."
  ]
};

// Keyboard Layout Mapping (Simple mapping for highlighting)
// Maps Hangul Jamo to Keyboard Keys (Standard 2-Set)
export const KEYBOARD_MAP: Record<string, string> = {
  'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't', 'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
  'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g', 'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
  'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm',
  'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T', 'ㅒ': 'O', 'ㅖ': 'P'
};

// =========================================================================================
// 🔑 NEIS API 설정 (학사일정 및 급식 정보)
// =========================================================================================
export const NEIS_CONFIG = {
  // 👇 아래 따옴표 안에 발급받으신 인증키를 넣어주세요.
  KEY: "1dcf4e7bb96643cdaf709634a0c34274",
  
  // 학교 정보 (인천동수중학교)
  ATPT_OFCDC_SC_CODE: "E10", // 인천광역시교육청
  SD_SCHUL_CODE: "7331165"   // 인천동수중학교
};