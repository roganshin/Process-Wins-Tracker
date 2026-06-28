# 오늘의 점수판 (process-wins-tracker)

무기력 극복용 일일 트래커. **결과(합격·점수)가 아니라, 내가 통제 가능한 "과정 승리"만 기록**해서
끊긴 "노력→보상" 회로를 복구하는 게 이 앱의 유일한 목적이다.

- 단일 파일: `index.html` (HTML+CSS+vanilla JS 한 파일, 빌드·번들 없음)
- 외부 의존성: Google Fonts CDN(Noto Sans KR, Fraunces)뿐. npm/패키지 없음.
- 사용 환경: 모바일 우선(최대폭 480px). PC 브라우저에서도 동작.

## 절대 깨지 말아야 할 규칙 (설계 의도)

1. **결과 추적 기능을 추가하지 마라.** 합격 여부, 시험 점수, 목표 달성률 등
   "내가 통제 못 하는 결과"를 입력/표시하는 UI는 이 앱의 철학과 정반대다.
   추적은 오직 통제 가능한 *행동*(과정 승리)만.
2. **`window.storage` 분기를 삭제하지 마라.** (아래 스토리지 항목 참고)
3. **반응성 휴식 버튼은 "고치는" 기능이 아니라 "알아채는" 기능**이다.
   사용자를 다그치거나 횟수로 죄책감 주는 문구로 바꾸지 말 것.
4. 게임화(배지·레벨·연속 끊기면 경고 등)로 압박을 키우지 말 것. 톤은 차분하게.

## 스토리지 (가장 주의)

두 환경에서 모두 동작하도록 이중화돼 있다. **이 구조를 유지할 것.**

- `CLAUDE.ai 아티팩트`로 열리면 → `window.storage`(클라우드, 비동기 API) 사용.
- 그 외(로컬 파일·일반 브라우저·Claude Code) → `window.storage`가 없으므로 `localStorage`로 자동 폴백.
- 감지: `const CLOUD = window.storage && typeof window.storage.get==='function'`
- 따라서 로컬에서 `window.storage`가 `undefined`인 건 **버그가 아니라 정상**이다. 지우지 말 것.
- 모든 읽기/쓰기는 `sget(key)` / `sset(key,val)` 추상화를 거친다. 직접 storage를 호출하지 말고 이 둘을 써라.

### 데이터 모델 (키 스키마)
- `config` → `{ wins: [{id, label}] }` — 과정 승리 항목 정의(편집 가능)
- `index` → `string[]` — 1승 이상 한 날짜(`YYYY-MM-DD`) 목록. 연속일·총기록일 계산용.
- `day:YYYY-MM-DD` → `{ checks:{winId:bool}, times:{winId:ISO}, rest:number, note:string }`
  - `note`는 "내일의 첫 행동": 오늘 저장하면 *다음 날* 레코드에 기록돼 다음 날 상단에 뜬다.

## 시간 연동
- 우상단 라이브 시계는 30초마다 갱신(`tick()`).
- 자정이 지나 날짜 키가 바뀌면 자동으로 새 날 레코드 로드 후 리렌더.
- 항목 체크 시 완료 시각을 `times`에 ISO로 저장 → "✓ 오후 9:32 완료"로 표시.

## 디자인 토큰 (CSS `:root`)
- 콘셉트: 저녁 점검 의식(dusk). 다크 인디고 배경 + 허니골드(승리) 액센트 + 틸(휴식, 승리와 다른 감정).
- 색: `--bg:#1b1e2b` / `--card:#252a3b` / `--gold:#e8b257` / `--teal:#67a6ab`
- 폰트: 본문 Noto Sans KR, 숫자·헤드라인 Fraunces(serif). 큰 점수가 시각적 주인공.
- 접근성: `prefers-reduced-motion` 존중, 탭 영역 충분히 크게. 유지할 것.

## 실행·테스트
- 그냥 브라우저로 `index.html` 열면 됨(서버 불필요).
- 로컬 테스트 시 데이터는 그 브라우저 `localStorage`에 쌓인다. 초기화하려면 해당 도메인 localStorage를 비우면 됨.

## 코딩 컨벤션
- 의존성 추가 금지. 단일 HTML 파일·vanilla JS 유지(요청 없으면 React/번들러로 바꾸지 말 것).
- 한국어 UI 텍스트는 반말·간결체 유지(사용자 톤).

## 다음 작업 후보 (참고용, 지시 아님)
- 월간 캘린더 뷰.
- 홈 화면 앱(PWA) — Phase 0~3 완료됨. GitHub Pages로 배포 후 Lighthouse 확인.
