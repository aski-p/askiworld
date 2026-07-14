# ASKIWORLD

페이지들이 마을의 건물로 존재하는 카툰 월드형 포털입니다. 현재 첫 번째 포털인 **Agent Office**가 열려 있습니다.

## 현재 구현

- 카툰 렌더링 풍의 `WORLD 01 · 시작의 마을`
- Agent Office 건물 클릭 및 키보드 접근 지원
- 캐릭터 이동 → 문 열림 → 카메라 줌 → 실제 페이지 이동 연출
- 실제 이동 없이 확인할 수 있는 연출 미리보기
- Studio, Library, Windmill을 향후 포털 자리로 표시
- 데스크톱·모바일 반응형 뷰
- `prefers-reduced-motion` 접근성 대응
- Railway용 Docker 배포와 `/healthz` 헬스 체크

## 연결된 첫 번째 페이지

- Agent Office: `https://agent-office.askipgh.chatgpt.site/`

## 로컬 실행

Node.js 20 이상에서 별도 패키지 설치 없이 실행됩니다.

```bash
npm start
```

기본 주소는 `http://localhost:8080`이며, `PORT` 환경 변수를 따릅니다.

## 검사

```bash
npm run check
```

## 다음 포털 추가 방법

1. `index.html`의 잠긴 건물 SVG 그룹에 고유 ID와 `data-portal-id`를 부여합니다.
2. 해당 건물의 문 요소에 고유 ID를 부여합니다.
3. `app.js`의 포털 설정을 다중 포털 구조로 확장하고 URL·캐릭터 이동 경로·카메라 초점을 연결합니다.
4. 정보 카드의 제목, 설명, URL을 선택된 건물에 맞게 갱신합니다.

이 저장소는 기존 Deadlock 통계/Tomcat 소스를 제거하고 ASKIWORLD 포털 전용 정적 애플리케이션으로 재구성되었습니다.
