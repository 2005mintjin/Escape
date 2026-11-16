# Escape 개발 규칙
- 신규 독립 프로젝트. 기존 체크아웃을 사용하고 요청 없이 worktree를 만들지 않는다.
- `src/core/game.js`: 렌더러 없는 게임 상태, 시간 진행, 재시작 및 전투 흐름.
- `src/systems/collision.js`: 3D 선분/AABB 판정. 감지와 총알에 공통 사용.
- `src/systems/detection.js`: 시야각, 거리, 신체 높이 및 엄폐.
- `src/rendering`: Three.js 월드, 카메라와 스프라이트 아틀라스. 프레임별 영역/기준점은 data/spriteFrames.json, PNG 로드/UV는 sprites.js, 동작 선택은 animation.js에서 담당. 임의의 균등 분할이나 웅크림 세로 압축을 추가하지 않는다. public/sprites 이미지 교체 시 행·열 및 바닥 앵커를 유지한다.
- `src/systems/movement.js`: 스태미나와 실제 달리기 속도. `src/core/input.js`: S 전용 앉기와 더블탭 입력.
- `src/rendering/environment.js`: 제공 이미지 기반 배경/소품/재질. 장식과 level01.js의 실제 엄폐 충돌을 구분한다.
- `src/levels/campaign.js`: 3개 작전의 벽·경비·조명·제어판·출구 데이터. `systems/stageObjects.js`: 조명 사격/제어판/낙하물/출구 조건. `rendering/stageView.js`: 외형과 광원 및 자원 해제. `systems/dash.js`: Q 대시/구르기 비용·쿨다운. 변경 시 campaign.test.js와 e2e/campaign.mjs로 일반 AI 상태의 전체 클리어를 검증한다.
- `src/levels`: 지형 데이터. `data`: AI/총기/게임 수치. `src/ui`: UI만 담당.
- 변경 관련 파일만 읽고 수정한다. 단일 HTML에 로직을 합치지 않는다. 불필요한 파일 재작성/ZIP 생성 금지.
- 로직 변경은 관련 `node --test --test-name-pattern=...` 우선 실행. 공유 충돌/게임 상태 변경은 `npm test` 전체 실행.
- 화면/입력 변경은 `npm run build`와 개발 서버 실행 후 `node e2e/smoke.mjs` 검증. Linux 기본 Chromium 경로는 /usr/bin/chromium; 다른 OS는 CHROMIUM_PATH 지정.
- 테스트의 실패/미실행은 명확하게 보고한다. 게임 규칙을 약화해 테스트를 통과시키지 않는다.
- `src/ui/touchControls.js`: 별도 고정 DOM의 모바일 입력. HUD innerHTML 안에 넣지 않는다. 포인터 캡처/취소와 멀티터치를 보존하고 변경 시 e2e/mobile.mjs를 실행한다.
- `src/ui/theme.css`: 검정/갈색/황동 UI 테마. 기본 배치 style.css와 분리한다. `src/audio/music.js`: 집/전투 전용 반복 BGM 및 브라우저 자동재생 대응. 변경 시 music.test.js와 e2e/theme-music.mjs 검증.
- `src/ui/pauseControl.js`: PC 일시정지 버튼은 고정 DOM으로 유지한다. HUD innerHTML에 넣지 않는다. PC 입력/버튼 변경 시 배포 preview에서 e2e/desktop.mjs를 실행한다.
- `src/audio/siren.js`: lockdown 전환 때 스테이지당 한 번 재생하는 사이렌. 무전 도중에는 시작하지 않는다. `melee/meleeCrouch` 프레임과 F 즉시 공격은 e2e/siren-knife.mjs 및 PC/모바일 입력 테스트로 검증한다.
- 비밀키/생성물/node_modules를 커밋하지 않는다. 변경 파일과 검증 결과를 간결히 보고한다.

- 조명은 stageObjects.js의 lightOff/insideLight와 LIGHT_RADIUS/LIGHT_DEPTH로 판정·표시를 공유한다. 새 오브젝트 효과음은 game.soundEvents에 사건당 한 번 기록하고 Effects가 소비한다. extractionSeconds와 탈출 음원 길이를 맞추며 stage-feedback.test.js 및 e2e/stage-feedback.mjs로 재시작의 실제 함정 높이와 탈출 전환을 검증한다.

- `systems/projectiles.js`: 양측 탄환 이동과 선분 충돌, `rendering/projectileView.js`: 짧은 탄환 메시 풀. 즉시 사격 피해나 긴 레이저선을 복원하지 않는다. trapSize는 함정 렌더링/충돌의 공통 설정이다. 전투 변경은 projectiles.test.js, e2e/projectiles.mjs 및 전체 캠페인 클리어를 검증한다.
- extraction 완료는 1·2번 작전에서 자동 nextStage, 마지막 작전에서만 clear를 유지한다. 조명 안에서는 lightAlertRange 내 경비가 즉시 완전 발각하며 실제 탄환은 여전히 벽에 막힌다. 중간 완료 버튼을 다시 요구하지 않는다.

- 진행 중인 무전은 guardResponse.isRadioActive/radioActive로 판정하고 발각 계산 뒤에도 radioStep을 우선 진행한다. 발견 때문에 무전 음원/프레임을 교체하지 않는다. 새 무전 아트는 enemyRadio 프레임, 배경 세부 묘사는 battlefieldDetails.js, 카메라 수치는 gameConfig.camera에서 관리한다. radio-continuity.test.js와 e2e/radio-scene.mjs로 음성 객체 유지와 두 게이지를 검증한다.

- 소음 리볼버 잔탄은 Game.pistolAmmo의 캠페인 자원이다. nextStage에서 남은 잔탄을 stagePistolAmmo에 저장하고 reset에서 해당 스테이지 진입 잔탄으로 복원한다. startCampaign만 초기 6발을 지급한다. 발사음은 game.soundEvents로 한 번 기록하며 소음 권총은 rally를 호출하지 않는다. 제어판 원격 작동은 panelBounds와 실제 projectile impact를 사용한다. sidearm.test.js/e2e/sidearm.mjs 및 PC·모바일 무기 교체를 검증한다.

- `src/intro`: 전투와 분리한 집 안 프롤로그. 대사/진행은 story.js와 data/introDialogue.json, 실제 3D 가구는 homeView.js, 타자 음성은 typeVoice.js다. 집에서는 이동/E 상호작용만 허용한다. 사진 표시 최소 2초와 암전 후 전쟁 자동 전환을 유지한다. intro.test.js 및 e2e/intro.mjs/intro-mobile.mjs로 PC·터치 전체 흐름을 검증한다. 전투 회귀 테스트는 프롤로그 일시정지 메뉴에 있는 전쟁 바로 시작 버튼을 사용한다.

- 프롤로그 시공간 문구/노출 시간은 data/introCards.json에서 관리한다. 집 음악은 사진을 든 뒤 2초 페이드로 정지하며 이후 다시 시작하지 않는다. sceneAudio.js는 암전 효과음을 전환당 한 번, 전쟁터 환경음을 실제 playing 상태에서만 재생한다. 관련 intro/music/scene-audio 단위 테스트와 e2e/intro.mjs의 실제 음원 상태를 검증한다. 메인 메뉴는 일러스트/타이틀/플레이만 유지한다.
