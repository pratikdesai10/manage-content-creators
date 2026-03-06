# CollabHub Mobile

Flutter mobile app for CollabHub — connects content creators with agencies.

## Prerequisites

- Flutter 3.16+ ([install](https://docs.flutter.dev/get-started/install))
- Dart 3.2+
- Android Studio (for Android) or Xcode 15+ (for iOS)
- CocoaPods (iOS): `sudo gem install cocoapods`

## Setup

1. **Clone and navigate**
   ```bash
   git clone <repo-url>
   cd manage-content-creators/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set COLLABHUB_API_URL to your backend URL
   ```

4. **Generate code** (models, env config, Riverpod)
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```

5. **Run the app**
   ```bash
   flutter run          # picks connected device/emulator
   flutter run -d ios   # iOS simulator
   flutter run -d android  # Android emulator
   ```

## Folder Structure

```
lib/
├── main.dart              # App entry point (ProviderScope + MaterialApp.router)
├── config/
│   ├── app_config.dart    # API base URL (from .env via envied)
│   ├── theme.dart         # Material 3 theme (Inter font, light + dark)
│   └── router.dart        # GoRouter routes + auth redirect
├── models/                # JSON-serializable data models
│   ├── user.dart          # User, AuthResponse, UserRole enum
│   ├── creator_profile.dart
│   ├── agency_profile.dart
│   └── social_account.dart
├── services/
│   ├── api_client.dart    # Dio instance + JWT interceptor + 401 handler
│   ├── auth_service.dart  # login, signup, logout, getMe
│   └── storage_service.dart  # flutter_secure_storage wrapper
├── providers/
│   ├── service_providers.dart  # Riverpod providers for all services
│   └── auth_provider.dart      # AuthNotifier, currentUser, isAuthenticated
├── screens/
│   ├── splash_screen.dart      # Token check → redirect on startup
│   ├── home_screen.dart        # Landing (Join as Creator / Agency)
│   ├── login_screen.dart
│   ├── signup/
│   │   ├── creator_signup_screen.dart
│   │   └── agency_signup_screen.dart
│   └── dashboard/
│       ├── creator_dashboard_screen.dart
│       └── agency_dashboard_screen.dart
├── widgets/
│   ├── common/            # Shared widgets (future)
│   └── forms/             # Form components (future)
└── utils/
    └── validators.dart    # email, phone, URL, required, minLength
```

## Regenerating Code

Run this after modifying any model, env file, or Riverpod provider:

```bash
dart run build_runner build --delete-conflicting-outputs
```

For continuous watch mode during development:

```bash
dart run build_runner watch --delete-conflicting-outputs
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `COLLABHUB_API_URL` | Backend API base URL | `http://localhost:3000` |

> For device testing on Android, use your machine's LAN IP instead of `localhost`: `http://192.168.x.x:3000`
