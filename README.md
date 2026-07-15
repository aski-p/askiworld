# ASKIWORLD

브라우저 전체 화면에서 캐릭터를 움직여 마을의 건물로 들어가는 카툰형 페이지 포털입니다. 디자인 설명 패널이나 콘셉트 보드는 표시하지 않고 플레이 가능한 마을만 제공합니다.

## 조작

- 데스크톱: `WASD`, 방향키 또는 마을 화면 클릭
- 모바일: 48px 이상의 방향 패드 또는 마을 화면 터치
- camera가 캐릭터를 따라가며 마을을 viewport 전체에 표시합니다.
- Agent Office 건물을 누르면 캐릭터가 문 앞으로 자동 이동합니다.
- 문 앞에서 `E`, `Enter` 또는 화면의 입장 버튼을 누르면 Agent Office로 이동합니다.

## 배경 화질

- Real-ESRGAN AI super-resolution으로 복원한 표준·HD·UHD 배경을 제공합니다.
- 브라우저 `srcset`이 화면 폭과 pixel density에 맞춰 `1184px`, `2368px`, `4736px` 소스를 자동 선택합니다.
- 세 해상도는 같은 구도와 hotspot 좌표를 공유하며 불필요한 고해상도 중복 다운로드를 피합니다.

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
- 표준·HD·UHD 배경 source가 viewport에 맞게 선택되는지
- 선택된 고해상도 배경 로드 실패 시 게임이 비활성화되는지
- console/page 오류가 없는지
