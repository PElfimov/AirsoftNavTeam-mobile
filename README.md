# AirsoftNavTeam — мобильное приложение

React Native приложение для отслеживания страйкболистов на карте.
Подключается к DMR хотспоту на RPi Zero W2 (`http://192.168.4.1:8080/api/players`)
и показывает позиции игроков в реальном времени.

## Стек

- React Native **0.79.6** (New Architecture готовность)
- React **19.0.0**, TypeScript **5.0**
- `@tanstack/react-query` v5 — синхронизация с хотспотом
- `@react-navigation/*` v7 — Stack + Bottom Tabs
- `react-native-maps` v1.26 — карта (Google/Apple Maps)
- `react-native-async-storage` — локальное хранение команд/настроек
- `react-native-biometrics` — FaceID / TouchID / отпечаток
- `react-native-gesture-handler` + `react-native-reanimated`
- `styled-components` v4

## Установка

```bash
# зависимости
yarn install   # или npm install

# iOS — поставить поды
cd ios && bundle install && bundle exec pod install && cd ..

# Запуск
yarn start          # Metro
yarn ios            # iOS симулятор
yarn android        # Android эмулятор
```

> Кеш npm у тебя сейчас (`/Users/nadin/.npm`) принадлежит root и может ругаться.
> Если `npm install` падает с EACCES — `sudo chown -R 502:20 ~/.npm`.

## Структура

```
.
├── App.tsx                       # standalone-обёртка (без @tezis)
├── index.js                      # точка входа RN
├── android/, ios/                # сгенерированный нативный код
├── src/airsoft-nav/              # исходники приложения (из архива)
│   ├── app/
│   │   ├── contexts/AuthContext  # standalone (AsyncStorage + RN biometrics)
│   │   ├── providers/QueryClient
│   │   ├── hooks/                # useServerPlayers, useTeams, useMapSettings
│   │   ├── data/demoData.ts      # генератор мок-игроков
│   │   └── router/               # Stack + BottomTabs
│   ├── screens/                  # Map / auth / team / settings
│   ├── ui/                       # Button, Input, Modal, иконки
│   ├── types/                    # Player, Team, ServerPlayer
│   ├── mock/, shared/, i18n/, debug/
│   └── modules/                  # пусто (не нужно)
├── babel.config.js               # алиас @src → ./src
└── tsconfig.json                 # paths: @src/* → src/*
```

## Подключение к хотспоту

В приложении: `Настройки → Настройки сервера`.
По умолчанию: `host=192.168.4.1`, `port=8080`, `interval=5000` ms.
Запрос идёт на `GET http://{host}:{port}/api/players` и ожидает:

```json
{
  "players": [
    {
      "id": "10001",
      "latitude": 55.7558,
      "longitude": 37.6173,
      "battery": 87,
      "status": "active",
      "timestamp": 1733212800000
    }
  ]
}
```

Бэкенд на RPi (FastAPI) должен отдавать данные именно в таком формате.
См. `src/airsoft-nav/types/server.ts` и `src/airsoft-nav/app/hooks/useServerPlayers.ts`.

Для разработки без железа есть **демо-режим** — toggle в ServerSettings,
генерирует случайных игроков и анимирует движение (`src/airsoft-nav/app/data/demoData.ts`).

## Что НЕ перенесено из исходного monorepo (newton-technology/tezis)

Эти модули были в оригинальных `App.tsx` / `init.ts` / `router/index.tsx` /
`AuthContext.tsx` и удалены/заменены, так как привязаны к корпоративному фреймворку:

| Удалено из источника                                     | Чем заменено в этом репо                    |
| -------------------------------------------------------- | ------------------------------------------- |
| `@src/tezis/sentry-init`                                 | выкинуто; ставьте `@sentry/react-native` сами при необходимости |
| `@src/tezis/services/{auth,update,application,alert,…}`  | выкинуто, AsyncStorage напрямую             |
| `@src/tezis/components/app_update/useAppUpdateStatus`    | выкинуто (CodePush-замена)                  |
| `@src/tezis/components/theme/UiProvider`                 | выкинуто                                    |
| `@src/tezis/contexts/overlay`                            | выкинуто                                    |
| `@src/tezis/utils/splashscreen`                          | выкинуто                                    |
| `@ui/theme/unistyles/configure`                          | выкинуто                                    |
| `@ui/{common,layout,typography,theme}/*`                 | выкинуто (использовалось только в AppSetting feature) |
| `@core/NtEnvConfig`, `@core/utils/async_request`         | выкинуто, axios инстанс уже есть в `shared/api/instance.ts` |
| `@src/profitum/shared/api/instance`                      | заменено на локальный `shared/api/instance.ts` |
| `@src/specs/authorization/NativeLocalAuth` (TurboModule) | заменено на `react-native-biometrics` + AsyncStorage |
| `src/airsoft-nav/features/AppSetting/`                   | удалена целиком (был CodePush-update UI)    |

## Что СТОИТ скопировать из работающего источника (если нужно)

Если хочешь восстановить часть оригинальной инфраструктуры (Sentry, темы, i18n) —
скопируй из старого monorepo эти папки в `src/`:

- `src/tezis/sentry-init.ts` + конфиг Sentry → если нужен крэш-репортинг
- `src/tezis/components/theme/UiProvider.tsx` + `@ui/theme/*` → если нужна
  оригинальная дизайн-система
- `src/common/utils/locale/i18n.ts` → если нужна i18n с переключением языков
  (сейчас в `src/airsoft-nav/i18n/` лежат JSON, но они нигде не подключены)
- `src/specs/authorization/NativeLocalAuth/` (Spec + native код) → если хочешь
  оригинальную нативную PIN/biometry-реализацию вместо `react-native-biometrics`

После копирования восстанови алиасы в `babel.config.js`:

```js
alias: {
  '@src':  './src',
  '@ui':   './src/ui',
  '@core': './src/core',
}
```

## Чего ещё может не хватать

- **app.json** — содержит только `{name, displayName}`. Если оригинал использовал
  расширенный конфиг (Sentry, deeplinks, intent-фильтры) — подложи свой.
- **`.env.sample.jsonc`** есть в `src/airsoft-nav/`, но никем не читается — для
  работы env-конфига в RN нужно либо `react-native-config`, либо собственный загрузчик.
- **AndroidManifest.xml / Info.plist** — для `react-native-maps` нужен Google
  Maps API key (Android: `<meta-data ... com.google.android.geo.API_KEY>`),
  для геолокации/биометрии — `ACCESS_FINE_LOCATION`, `USE_BIOMETRIC` permissions.
- **iOS Podfile** — после `npm install` запусти `yarn pods`.

## Связано

- Ansible playbook + бэкенд RPi: `/Users/nadin/workPavel/AirsoftNavTeam/`
- DMR хотспот: RPi Zero W2 + MMDVM_HS_Hat, частота 433.875 MHz, `ssh hotspot`
