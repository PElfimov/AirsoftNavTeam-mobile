# Контекст проекта AirsoftNavTeam-mobile

Standalone React Native приложение для отслеживания страйкболистов на карте.
Подключается к DMR-хотспоту на RPi Zero W2 (`http://192.168.4.1:8080/api/players`)
и показывает позиции игроков. Есть демо-режим без железа.

- **Repo:** https://github.com/PElfimov/AirsoftNavTeam-mobile
- **Remote:** `git@github.com-airsoft:PElfimov/AirsoftNavTeam-mobile.git`
  (SSH alias `github.com-airsoft` → ключ `~/.ssh/airsoft_github`)
- **Связанный проект** (хотспот + Ansible playbook):
  `/Users/nadin/workPavel/AirsoftNavTeam/`

## Стек

- React Native **0.79.6** + React **19.0.0** + TypeScript **5.0**
- Навигация: `@react-navigation/{native,stack,bottom-tabs}` v7
- Состояние: `@tanstack/react-query` v5, `AsyncStorage`
- Карта: `@maplibre/maplibre-react-native` **10.4.2** (OSM/ESRI raster тайлы,
  без Google Maps API key — миграция с `react-native-maps`)
- Геолокация: `@react-native-community/geolocation`
- Биометрия: `react-native-biometrics` (заменила корпоративный TurboModule)
- UI: `styled-components` v4, `react-native-svg`, `react-native-gesture-handler`,
  `react-native-reanimated`, `react-native-safe-area-context`,
  `react-native-screens`

## История: что было сделано в первой сессии

Исходник пришёл в виде архива `~/Downloads/airsoft-nav.zip` —
это **папка темы из корпоративного monorepo newton-technology/tezis**.
Цель сессии — собрать standalone-репозиторий, оторванный от monorepo.

### Создано

- Сгенерирован чистый RN 0.79.6 шаблон через
  `npx @react-native-community/cli init AirsoftNav --version 0.79.6`
- 73 файла из архива перенесены в `src/airsoft-nav/`
- `babel.config.js` + `tsconfig.json` — алиас `@src/*` → `src/*`
- `App.tsx` — standalone-обёртка (SafeArea + QueryClient + Auth + Router)
- `src/airsoft-nav/app/contexts/AuthContext.tsx` — переписан с
  `@src/specs/authorization/NativeLocalAuth` (TurboModule из tezis) на
  `AsyncStorage` + `react-native-biometrics`
- `src/airsoft-nav/app/router/index.tsx` — убраны `useAppUpdateStatus` и
  feature `AppSetting` (CodePush, удалены целиком)
- Поправлены баги: `ServerPlayer` импорт указывал на `types/airsoft`
  (нет), исправлен на `types/server`; добавлены поля
  `callsign/role/speed/heading` etc; `fetch(timeout)` заменён на
  `AbortController.signal`

### Удалено как несовместимое с standalone

| Что                                              | Чем заменено                       |
| ------------------------------------------------ | ---------------------------------- |
| `@src/tezis/sentry-init`                         | выкинуто                           |
| `@src/tezis/services/{auth,update,application,…}`| выкинуто, AsyncStorage напрямую    |
| `@src/tezis/components/app_update/*`             | выкинуто (CodePush-замена)         |
| `@src/tezis/components/theme/UiProvider`         | выкинуто                           |
| `@src/tezis/contexts/overlay`                    | выкинуто                           |
| `@ui/{common,layout,typography,theme}/*`         | выкинуто (использ. в AppSetting)   |
| `@core/NtEnvConfig`, `@core/utils/async_request` | выкинуто                           |
| `@src/profitum/shared/api/instance`              | свой `shared/api/instance.ts`      |
| `@src/specs/authorization/NativeLocalAuth`       | `react-native-biometrics` + AsyncStorage |
| `src/airsoft-nav/features/AppSetting/`           | удалена целиком                    |

### Окружение (важно!)

- Ruby системный 2.6 → заменён на **Ruby 3.3.11** через `brew install ruby@3.3`.
  Постоянный PATH: `export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"` в `~/.zshrc`.
  Brew-Ruby 4.0.x НЕ подходит — kconv удалён, ломает CocoaPods 1.16.
- CocoaPods **1.16.2** (в Gemfile подняли с >= 1.13, убрали `xcodeproj < 1.26.0`)
- Xcode.app должен быть активен: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- **Менеджер пакетов: только yarn 1.x.** Никогда не использовать npm
  (есть `yarn.lock`, peer-конфликт с `@react-native-async-storage/async-storage@1.18.1`
  npm не пропускает).

### Native-настройки

- `Info.plist`: `NSLocationWhenInUseUsageDescription`,
  `NSLocalNetworkUsageDescription` (для http к 192.168.4.1),
  `NSFaceIDUsageDescription`
- `LaunchScreen.storyboard` — кастомный (логотип AirsoftNavTeam, оливковый фон)
- `Images.xcassets/AppIcon.appiconset` + `LaunchLogoAirsoftNavTeam.imageset` —
  ассеты на месте

## Запуск

```bash
# первый раз / при изменении pods
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
yarn install
(cd ios && bundle exec pod install)

yarn start          # Metro
yarn ios            # пересборка и запуск iOS симулятора
# или открыть ios/AirsoftNav.xcworkspace в Xcode (⌘B → ▶)
```

## Подключение к хотспоту

В приложении: **Настройки → Сервер**. По умолчанию `host=192.168.10.1`,
`port=8000` (AP хотспота). Первичный канал — WebSocket `ws://{host}:{port}/ws`
(`useHotspotConnection`), REST `/api/players` раз в 30s как fallback
(`useServerPlayers`). Формат пакетов — в `src/airsoft-nav/types/server.ts`.
Для разработки без железа — toggle **Демо** (мок в `app/data/demoData.ts`).

WS-устойчивость к Android Doze (`useHotspotConnection.ts`):
- App-level ping каждые 10s, таймаут pong 12s → force close + reconnect.
  Нужен потому что RN WebSocket не пробрасывает ws-control frames в JS,
  и стандартный ping/pong от websockets-уровня не виден приложению.
- `AppState.addEventListener('change', ...)`: возврат в `active` → принудительно
  рвём текущий сокет и коннектимся заново, не доверяя «open» состоянию
  (после сна экрана Wi-Fi радио на Android часто оставляет half-open TCP).
- Бэкофф реконнекта: 1→2→5→10→30s.

## Что ещё может потребоваться

- **App Store marketing icon** — сейчас 1024×1024 в JPG (`1024.jpg`,
  `1024 1.jpg`). Apple принимает только PNG без альфа — пересохранить
  перед публикацией.
- **`@react-native-async-storage/async-storage@1.18.1`** устарел (peer хочет
  RN ≤ 0.72), yarn проглотил молча. Если на runtime упадёт —
  `yarn add @react-native-async-storage/async-storage@^2`.
- **Захардкоженная версия** в `LaunchScreen.storyboard`
  («Версия 1.150.1 (3348)») — заменить или удалить.
- **Sentry / i18n / нативный PIN** — если понадобятся, копировать модули из
  оригинального monorepo (детали в README.md).
- **iOS** — после миграции на MapLibre native pod-ы ещё не переустановлены.
  Перед запуском iOS: `(cd ios && bundle exec pod install)`.

## Android-сборка и установка

Окружение:
- JDK от Android Studio: `/Applications/Android Studio.app/Contents/jbr/Contents/Home`
- Android SDK: `~/Library/Android/sdk`
- Node: `/usr/local/bin/node` (нужно явно в PATH — Gradle subprocess не наследует zsh PATH)

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="/usr/local/bin:$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

cd android
./gradlew assembleDebug      # debug APK ~ android/app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease    # release APK ~ android/app/build/outputs/apk/release/app-release.apk
```

**`newArchEnabled=false`** в `android/gradle.properties` — критично, иначе
многие RN-библиотеки (react-native-svg, ранее react-native-maps) ломаются:
не передаются props в native ViewManager-ы.

Debug APK подключается к Metro: `adb reverse tcp:8081 tcp:8081 && yarn start`.
Release APK самодостаточен (JS-bundle вшит).

`AndroidManifest.xml` уже содержит: `ACCESS_FINE_LOCATION`,
`ACCESS_COARSE_LOCATION`, `USE_BIOMETRIC`, `INTERNET`. Cleartext HTTP/WS
разрешён глобально через `network_security_config.xml`
(`<base-config cleartextTrafficPermitted="true"/>`) — приложение по дизайну
ходит только в локальные сети (хотспот `192.168.10.1`, домашние LAN-IP при
отладке), TLS там не нужен. Раньше был узкий whitelist (`192.168.4.1`,
`10.0.2.2`, `localhost`), и Android резал коннект к `192.168.10.1:8000`.

Релизный билд сейчас подписан **debug-keystore** (`signingConfig signingConfigs.debug`
в `app/build.gradle`) — для распространения через файл/сайдлоад это работает,
для Google Play — нужен реальный keystore.

## История миграции карты

`react-native-maps` 1.26 был установлен изначально, но он:
1. Требует Google Maps API key на Android (Google Maps SDK блокирует весь pipeline
   при невалидном ключе, `ClientParamsBlocking` в логах).
2. Перешёл на Fabric-only codegen в 1.20+, под Paper-режимом
   (`newArchEnabled=false`) props не передаются в `UrlTileManager` через
   ViewManagerPropertyUpdater → TileProvider создаётся, но не получает urlTemplate.

Решено: миграция на `@maplibre/maplibre-react-native` 10.4.2. Затронуты:
- `src/airsoft-nav/screens/Map/AuthenticatedMapScreen.tsx`
- `src/airsoft-nav/screens/Map/UnauthenticatedMapScreen.tsx`
- `src/airsoft-nav/screens/Map/components/{LocateButton,ZoomControls/ZoomControls}.tsx`
- `src/airsoft-nav/screens/Map/mapStyles.ts` (новый — стили для standard/satellite/hybrid)
- `MapView` → `MapView` из MapLibre, `Marker` → `MarkerView`,
  `Region` → camera `centerCoordinate` + `zoomLevel`, `animateToRegion` → `cameraRef.setCamera`/`flyTo`/`zoomTo`.
- Стили: OSM raster для «Схема», ESRI World Imagery для «Спутник»,
  ESRI Imagery + Reference labels для «Гибрид».

### Offline карт (нереализовано — auto-cache only)

MapLibre RN на Android имеет ограничение: `HTTPFileSource` не маршрутизирует
`asset://` и `data:` URLs к локальным резолверам — `OfflineManager.createPack`
требует реальный `file://` или `https://` URL для styleURL. Чтобы реализовать
prefetch региона, нужно либо `react-native-fs` (копировать style в cache dir),
либо хостить style на public URL. Пока работает только встроенный
auto-cache MapLibre — что просмотрено, остаётся в SQLite `mbgl-cache`.

## Память (`~/.claude/.../memory/`)

- `project_airsoft_tracker.md` — общий контекст всей экосистемы (хотспот + бэкенд)
- `feedback_airsoft_use_yarn.md` — правило: только yarn в этом проекте
