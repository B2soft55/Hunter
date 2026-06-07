# 헌터관리국 각성자 조회 시스템

현대 헌터물 세계관을 기반으로 한 모바일 우선 정적 심리테스트입니다. 순수 HTML/CSS/JavaScript만 사용하며 입력과 답변은 메모리에만 보관합니다.

## 로컬 실행

ES module이나 빌드 도구를 사용하지 않으므로 `hunter-test/index.html`을 직접 열 수 있습니다. 로컬 서버로 확인하려면 저장소 루트에서 다음을 실행합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/hunter-test/`에 접속합니다.

## GitHub Pages 배포

1. GitHub 저장소의 **Settings → Pages**로 이동합니다.
2. **Deploy from a branch**를 선택하고 배포 브랜치와 `/ (root)`를 지정합니다.
3. 배포 주소 뒤에 `/hunter-test/`를 붙여 접속합니다.

프로젝트를 저장소 루트에서 바로 표시하려면 `hunter-test/` 안의 파일과 폴더를 저장소 루트로 이동한 뒤 Pages를 배포합니다.

## 데이터 수정

- 질문과 선택지 점수: `data/questions.js`
- 능력 조합과 설명: `data/abilities.js`
- 주 스탯별 부서: `data/departments.js`
- 등급 기준과 히든 결과: `data/ranks.js`
- 결과 계산 및 직급·위험도 규칙: `script.js`

## 이미지 교체

`assets/` 아래의 placeholder 파일명과 동일한 WebP 이미지를 추가하면 자동 적용됩니다. 파일이 없어도 텍스트 fallback과 배경색이 표시됩니다.

- 시작/질문/결과 배경: `assets/bg/`
- 능력/부서/등급 아이콘: `assets/icons/`
- 추후 UI 스프라이트: `assets/sprites/ui_sprites.webp`

필요하면 데이터 파일의 상대 경로를 바꿔 다른 파일명을 사용할 수 있습니다.

## 모바일·PC 화면 분리

- 모바일 접속은 기기 User-Agent, 터치 중심 포인터 또는 767px 이하 화면을 기준으로 감지하며, 세로형 9:16 보안 단말 UI를 표시합니다.
- 모바일 화면은 `viewport-fit=cover`와 safe-area 여백을 적용해 노치가 있는 기기에서도 주요 UI가 가려지지 않습니다.
- PC 접속은 768px 이상에서 넓은 커맨드 콘솔 UI로 전환되며, 시작 화면·질문 화면·결과 화면을 각각 2열 레이아웃으로 표시합니다.
- 분리 기준과 기기 모드 설정은 `script.js`의 `setDeviceMode`, 각 모드의 레이아웃은 `style.css`의 PC 미디어 쿼리에서 수정할 수 있습니다.

## 등급 산정 방식

능력 등급은 선택지 점수의 단순 합계가 아니라, 15개 상황에서 비슷한 가치관을 얼마나 일관되게 선택했는지를 기준으로 산정합니다. 여러 성향이 평균적으로 고르게 나타나는 일반적인 응답은 낮은 등급에 머물며, 특정 가치관 조합을 반복해서 선택할수록 높은 등급과 히든 결과에 가까워집니다. 등급은 선악이나 인격의 우열을 뜻하지 않고 마력 파장의 선명도를 의미합니다.
