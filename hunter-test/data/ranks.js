// min은 원점수 합계가 아니라 script.js에서 계산한 가치관 일관도 점수입니다.
window.HMA_RANKS = [
  { name: "EX급", min: 36 },
  { name: "S급", min: 32 },
  { name: "A급", min: 28 },
  { name: "B급", min: 24 },
  { name: "C급", min: 20 },
  { name: "D급", min: 16 },
  { name: "E급", min: 12 },
  { name: "F급", min: 0 }
];

window.HMA_HIDDEN_RESULTS = [
  { name: "게이트 그 자체", test: (s, score) => score >= 36 && Object.values(s).every(v => v >= 8), department: "배치 불가", position: "관리 대상", risk: "측정 불가", note: "대상자는 인간형 마력 파장이 아니라 독립된 게이트의 좌표로 관측됩니다. 관측은 허용되나 직접 접촉과 호명은 금지됩니다." },
  { name: "심연군주", test: (s, score) => score >= 32 && s.MADNESS >= 15 && s.AMBITION >= 15, department: "격리관리소", position: "재난 지정 개체", risk: "국가 붕괴 위험", note: "심연 계통 존재들이 대상을 군주로 인식하고 있습니다. 격리는 예방 조치일 뿐 구속 수단으로 간주해서는 안 됩니다." },
  { name: "세계수의 축복", test: (s, score) => score >= 32 && s.FAITH >= 15 && s.EMPATHY >= 15, department: "사제 길드 최고성전", position: "대성자", risk: "보호 최우선", note: "대상자의 생명 파장은 주변 오염을 자발적으로 정화합니다. 전투 배치보다 국가 단위 보호를 우선하십시오." },
  { name: "회귀자", test: (s, score) => score >= 32 && s.INT >= 14 && s.SURVIVE >= 14, department: "정부관리국 시간재난과", position: "특수 관측 대상", risk: "시간선 변동", note: "대상자는 발생하지 않은 사건에 대한 회피 반응을 보입니다. 기억 조사 시 시간선 오염 방지 규정을 준수하십시오." },
  { name: "시스템 관리자", test: (s, score) => score >= 32 && s.INT >= 14 && s.LEAD >= 14, department: "헌터관리국 중앙통제실", position: "권한 외 존재", risk: "통제권 탈취 위험", note: "대상자가 접근한 단말의 권한 체계가 자동 재편됩니다. 본 문서를 열람한 시점부터 중앙통제실에 보고하십시오." }
];
