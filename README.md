# ASKIWORLD

브라우저 전체 화면에서 캐릭터를 움직여 마을의 건물로 들어가는 카툰형 페이지 포털입니다. 디자인 설명 패널이나 콘셉트 보드는 표시하지 않고 플레이 가능한 마을만 제공합니다.

## 조작

- 데스크톱: `WASD`, 방향키 또는 마을 화면 클릭
- 모바일: 48px 이상의 방향 패드 또는 마을 화면 터치
- camera가 캐릭터를 따라가며 마을을 viewport 전체에 표시합니다.
- Agent Office 건물을 누르면 캐릭터가 문 앞으로 자동 이동합니다.
- 문 앞에서 `E`, `Enter` 또는 화면의 입장 버튼을 누르면 Agent Office로 이동합니다.

## 현재 연결

- Agent Office: `https://subagent-aski.vercel.app/`
- Studio / Library / Windmill: 준비 중

## 실행

```bash
npm install
npm start
npm run check
```

`/healthz`에서 서버 상태를 확인할 수 있습니다.

## 테스트

```bash
npx playwright install chromium
npm test
```

Playwright 검증 범위:

- 모바일·데스크톱에서 마을이 viewport 전체를 채우는지
- 콘셉트 설명 DOM이 존재하지 않는지
- 가로·세로 overflow가 없는지
- 모바일 touch target이 48px 이상인지
- 캐릭터 이동과 Agent Office 입장이 동작하는지
- console/page 오류가 없는지
