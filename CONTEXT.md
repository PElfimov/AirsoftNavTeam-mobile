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
- Карта: `react-native-maps` 1.26
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

В приложении: **Настройки → Сервер**. По умолчанию `host=192.168.4.1`,
`port=8080`, `interval=5000` ms. Запрос: `GET http://{host}:{port}/api/players`,
ожидаемый формат — в `src/airsoft-nav/types/server.ts`. Для разработки без
железа — toggle **Демо** в той же экране (мок-генератор в `app/data/demoData.ts`).

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
- **Android** — конфигурация пока не тронута. Нужны: Google Maps API key
  в `AndroidManifest.xml`, permissions `ACCESS_FINE_LOCATION` +
  `USE_BIOMETRIC`.

## Память (`~/.claude/.../memory/`)

- `project_airsoft_tracker.md` — общий контекст всей экосистемы (хотспот + бэкенд)
- `feedback_airsoft_use_yarn.md` — правило: только yarn в этом проекте
