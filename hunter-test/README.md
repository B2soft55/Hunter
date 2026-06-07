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
