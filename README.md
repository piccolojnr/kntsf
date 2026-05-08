# Knutsford SRC Mobile App

Expo Router mobile app for Knutsford SRC permit verification, student self-service, and operations card management.

## Requirements

- Node.js and pnpm
- Expo SDK 54 tooling
- A running Knutsford backend with the mobile API routes enabled
- `EXPO_PUBLIC_API_BASE_URL` configured before starting the app

## Environment

Create a local environment file or export the variable in your shell:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<backend-host>:3001
EXPO_PUBLIC_APP_ENV=development
```

The app does not include a mock API fallback. If `EXPO_PUBLIC_API_BASE_URL` is missing, startup fails with a clear configuration error.

Android emulator backend URL:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001
```

Physical device backend URL:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-lan-ip>:3001
```

The phone and backend machine must be on the same network, and the backend must listen on an address reachable from the device.

## Development

Install dependencies:

```bash
pnpm install
```

Start Expo:

```bash
pnpm expo start -c
```

Android NFC requires a development build because `react-native-nfc-manager` is a native module and is not available in Expo Go.

## Backend Routes

The app currently depends on these backend routes:

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/me`
- `GET /api/mobile/student/profile`
- `GET /api/mobile/student/permits`
- `GET /api/mobile/student/card`
- `POST /api/mobile/verify/student`
- `POST /api/mobile/verify/card`
- `POST /api/mobile/verify/permit-code`
- `POST /api/mobile/permits/issue`
- `POST /api/mobile/cards/register`
- `POST /api/mobile/cards/replace`
- `POST /api/mobile/cards/revoke`
- `GET /api/mobile/operations/students?search=&page=&limit=`
- `GET /api/mobile/operations/permits?search=&status=&page=&limit=`
- `GET /api/mobile/operations/cards?search=&status=&page=&limit=`
- `GET /api/mobile/operations/verifications?page=&limit=`
- `GET /api/mobile/operations/audit-logs?page=&limit=`
- `GET /api/mobile/operations/permit-config`
- `POST /api/mobile/student/card/report-lost`

## API Rules

All network requests go through `src/lib/api/api-client.ts`.

Feature-specific API wrappers live under `src/features/**`.

Auth tokens are stored with Expo Secure Store and attached as `Authorization: Bearer <token>` by the API client.
