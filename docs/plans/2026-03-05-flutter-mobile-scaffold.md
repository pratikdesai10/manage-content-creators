# Flutter Mobile App Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a production-ready Flutter mobile app (`mobile/`) inside the monorepo with auth, routing, theme, data models, and service/provider layers wired up.

**Architecture:** Layer-first structure (screens, providers, models, services) mirroring the React frontend. JWT stored in flutter_secure_storage, read by a Dio interceptor. GoRouter handles declarative routing with auth redirect. Riverpod manages all state.

**Tech Stack:** Flutter 3.16+ / Dart 3.2+, Riverpod 2.x, GoRouter 14.x, Dio 5.x, flutter_secure_storage, json_serializable, envied, google_fonts (Inter), flutter_form_builder.

**Design doc:** `docs/plans/2026-03-05-flutter-mobile-scaffold-design.md`

---

### Task 1: Install Flutter SDK

> Skip if Flutter 3.16+ is already installed. Verify with `flutter --version`.

**Files:** None (system-level install)

**Step 1: Install Flutter via official installer (macOS)**

```bash
# Download Flutter SDK to ~/development
mkdir -p ~/development
cd ~/development
# Download latest stable (3.24+ as of 2026)
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.24.5-stable.zip
unzip flutter_macos_arm64_3.24.5-stable.zip
```

Or use homebrew:
```bash
brew install --cask flutter
```

**Step 2: Add Flutter to PATH (add to ~/.zshrc)**

```bash
export PATH="$HOME/development/flutter/bin:$PATH"
source ~/.zshrc
```

**Step 3: Verify installation**

```bash
flutter --version
```
Expected: `Flutter 3.16.x` or higher, `Dart 3.2.x` or higher.

**Step 4: Run doctor**

```bash
flutter doctor
```
Expected: Android toolchain and Xcode should show checkmarks or acceptable warnings. Fix any critical issues shown.

---

### Task 2: Create Flutter project

**Files:**
- Create: `mobile/` (entire Flutter project)

**Step 1: Create the Flutter project from monorepo root**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
flutter create \
  --org com.collabhub \
  --project-name collabhub_mobile \
  --platforms android,ios \
  mobile
```

Expected output: `All done! Your project is created at .../mobile`

**Step 2: Remove boilerplate**

```bash
rm mobile/lib/main.dart          # will be replaced
rm -rf mobile/test/              # will add proper tests later
```

**Step 3: Verify it builds (smoke test)**

```bash
cd mobile
flutter pub get
flutter analyze
```
Expected: No errors.

**Step 4: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/
git commit -m "chore: scaffold Flutter project (Android + iOS)"
```

---

### Task 3: Configure pubspec.yaml dependencies

**Files:**
- Modify: `mobile/pubspec.yaml`

**Step 1: Replace pubspec.yaml contents**

Replace the entire `mobile/pubspec.yaml` with:

```yaml
name: collabhub_mobile
description: CollabHub — Connect creators and agencies.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # HTTP
  dio: ^5.7.0

  # State management
  flutter_riverpod: ^2.6.1
  riverpod_annotation: ^2.6.1

  # Routing
  go_router: ^14.6.2

  # Secure token storage
  flutter_secure_storage: ^9.2.2

  # Forms
  flutter_form_builder: ^9.4.0
  form_builder_validators: ^11.0.0

  # Images & icons
  cached_network_image: ^3.4.1
  flutter_svg: ^2.0.10+1

  # Fonts
  google_fonts: ^6.2.1

  # Environment variables
  envied: ^0.5.4+1

  # JSON serialization
  json_annotation: ^4.9.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

  # Code generation
  build_runner: ^2.4.13
  json_serializable: ^6.9.0
  envied_generator: ^0.5.4+1
  riverpod_generator: ^2.6.1

flutter:
  uses-material-design: true
```

**Step 2: Fetch dependencies**

```bash
cd mobile
flutter pub get
```
Expected: All packages resolve without conflicts.

**Step 3: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/pubspec.yaml mobile/pubspec.lock
git commit -m "chore: add Flutter dependencies to pubspec.yaml"
```

---

### Task 4: Create .env and env config

**Files:**
- Create: `mobile/.env`
- Create: `mobile/.env.example`
- Create: `mobile/lib/config/app_config.dart`

**Step 1: Create mobile/.env.example**

```
COLLABHUB_API_URL=http://localhost:3000
```

**Step 2: Create mobile/.env (actual, gitignored)**

```
COLLABHUB_API_URL=http://localhost:3000
```

**Step 3: Add .env to mobile/.gitignore**

Open `mobile/.gitignore` and add at the bottom:
```
# Environment variables
.env
lib/config/env.g.dart
```

**Step 4: Create mobile/lib/config/app_config.dart**

```dart
import 'package:envied/envied.dart';

part 'app_config.g.dart';

@Envied(path: '.env')
abstract class Env {
  @EnviedField(varName: 'COLLABHUB_API_URL', defaultValue: 'http://localhost:3000')
  static const String apiBaseUrl = _Env.apiBaseUrl;
}

class AppConfig {
  static const String apiBaseUrl = Env.apiBaseUrl;
  static const String appName = 'CollabHub';
  static const String authTokenKey = 'auth_token';
}
```

**Step 5: Run code generation**

```bash
cd mobile
dart run build_runner build --delete-conflicting-outputs
```
Expected: Creates `lib/config/app_config.g.dart` (and `env.g.dart`).

**Step 6: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/.env.example mobile/lib/config/app_config.dart mobile/lib/config/app_config.g.dart
git commit -m "feat(mobile): add env config with envied"
```

---

### Task 5: Create theme

**Files:**
- Create: `mobile/lib/config/theme.dart`

**Step 1: Create mobile/lib/config/theme.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color _primarySeed = Color(0xFF6C63FF);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _primarySeed,
      brightness: Brightness.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: _primarySeed,
      brightness: Brightness.dark,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    );
  }
}
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/config/theme.dart
git commit -m "feat(mobile): add Material 3 theme with Inter font"
```

---

### Task 6: Create data models

**Files:**
- Create: `mobile/lib/models/user.dart`
- Create: `mobile/lib/models/social_account.dart`
- Create: `mobile/lib/models/creator_profile.dart`
- Create: `mobile/lib/models/agency_profile.dart`

**Step 1: Create mobile/lib/models/user.dart**

```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

enum UserRole {
  @JsonValue('CREATOR')
  creator,
  @JsonValue('AGENCY')
  agency,
}

@JsonSerializable()
class User {
  final String id;
  final String email;
  final UserRole role;
  final String createdAt;
  final String updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class AuthResponse {
  @JsonKey(name: 'access_token')
  final String accessToken;
  final User user;

  const AuthResponse({required this.accessToken, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}
```

**Step 2: Create mobile/lib/models/social_account.dart**

```dart
import 'package:json_annotation/json_annotation.dart';

part 'social_account.g.dart';

@JsonSerializable()
class SocialAccount {
  final String id;
  final String platform;
  final String handle;
  final int followersCount;
  final String creatorId;

  const SocialAccount({
    required this.id,
    required this.platform,
    required this.handle,
    required this.followersCount,
    required this.creatorId,
  });

  factory SocialAccount.fromJson(Map<String, dynamic> json) =>
      _$SocialAccountFromJson(json);
  Map<String, dynamic> toJson() => _$SocialAccountToJson(this);
}
```

**Step 3: Create mobile/lib/models/creator_profile.dart**

```dart
import 'package:json_annotation/json_annotation.dart';
import 'user.dart';
import 'social_account.dart';

part 'creator_profile.g.dart';

@JsonSerializable()
class CreatorProfile {
  final String id;
  final String userId;
  final String displayName;
  final String? bio;
  final List<String> niche;
  final String? location;
  final List<SocialAccount> socialAccounts;
  final User user;

  const CreatorProfile({
    required this.id,
    required this.userId,
    required this.displayName,
    this.bio,
    required this.niche,
    this.location,
    required this.socialAccounts,
    required this.user,
  });

  factory CreatorProfile.fromJson(Map<String, dynamic> json) =>
      _$CreatorProfileFromJson(json);
  Map<String, dynamic> toJson() => _$CreatorProfileToJson(this);
}
```

**Step 4: Create mobile/lib/models/agency_profile.dart**

```dart
import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'agency_profile.g.dart';

@JsonSerializable()
class AgencyProfile {
  final String id;
  final String userId;
  final String companyName;
  final String? description;
  final String? website;
  final String? location;
  final User user;

  const AgencyProfile({
    required this.id,
    required this.userId,
    required this.companyName,
    this.description,
    this.website,
    this.location,
    required this.user,
  });

  factory AgencyProfile.fromJson(Map<String, dynamic> json) =>
      _$AgencyProfileFromJson(json);
  Map<String, dynamic> toJson() => _$AgencyProfileToJson(this);
}
```

**Step 5: Run code generation**

```bash
cd mobile
dart run build_runner build --delete-conflicting-outputs
```
Expected: Creates `lib/models/*.g.dart` files for all 4 models.

**Step 6: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/models/
git commit -m "feat(mobile): add data models matching TypeScript interfaces"
```

---

### Task 7: Create storage service

**Files:**
- Create: `mobile/lib/services/storage_service.dart`

**Step 1: Create mobile/lib/services/storage_service.dart**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class StorageService {
  final FlutterSecureStorage _storage;

  StorageService() : _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveToken(String token) async {
    await _storage.write(key: AppConfig.authTokenKey, value: token);
  }

  Future<String?> getToken() async {
    return _storage.read(key: AppConfig.authTokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: AppConfig.authTokenKey);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/services/storage_service.dart
git commit -m "feat(mobile): add StorageService for JWT token management"
```

---

### Task 8: Create API client

**Files:**
- Create: `mobile/lib/services/api_client.dart`

**Step 1: Create mobile/lib/services/api_client.dart**

```dart
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import 'storage_service.dart';

class ApiClient {
  late final Dio dio;
  final StorageService _storageService;

  // Callback invoked on 401 so AuthNotifier can clear state
  void Function()? onUnauthorized;

  ApiClient(this._storageService) {
    dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    _addInterceptors();
  }

  void _addInterceptors() {
    // Attach JWT on every request
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _storageService.deleteToken();
          onUnauthorized?.call();
        }
        handler.next(error);
      },
    ));
  }
}
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/services/api_client.dart
git commit -m "feat(mobile): add Dio ApiClient with JWT interceptor"
```

---

### Task 9: Create auth service

**Files:**
- Create: `mobile/lib/services/auth_service.dart`

**Step 1: Create mobile/lib/services/auth_service.dart**

```dart
import '../models/user.dart';
import 'api_client.dart';
import 'storage_service.dart';

class AuthService {
  final ApiClient _apiClient;
  final StorageService _storageService;

  AuthService(this._apiClient, this._storageService);

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final authResponse = AuthResponse.fromJson(
      // Backend wraps in {success, data, timestamp}
      response.data['data'] as Map<String, dynamic>,
    );
    await _storageService.saveToken(authResponse.accessToken);
    return authResponse;
  }

  Future<AuthResponse> signupCreator({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final response = await _apiClient.dio.post('/auth/signup/creator', data: {
      'email': email,
      'password': password,
      'displayName': displayName,
    });
    final authResponse = AuthResponse.fromJson(
      response.data['data'] as Map<String, dynamic>,
    );
    await _storageService.saveToken(authResponse.accessToken);
    return authResponse;
  }

  Future<AuthResponse> signupAgency({
    required String email,
    required String password,
    required String companyName,
  }) async {
    final response = await _apiClient.dio.post('/auth/signup/agency', data: {
      'email': email,
      'password': password,
      'companyName': companyName,
    });
    final authResponse = AuthResponse.fromJson(
      response.data['data'] as Map<String, dynamic>,
    );
    await _storageService.saveToken(authResponse.accessToken);
    return authResponse;
  }

  Future<User> getMe() async {
    final response = await _apiClient.dio.get('/auth/me');
    return User.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _storageService.deleteToken();
  }
}
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/services/auth_service.dart
git commit -m "feat(mobile): add AuthService with login/signup/logout/getMe"
```

---

### Task 10: Create Riverpod providers

**Files:**
- Create: `mobile/lib/providers/service_providers.dart`
- Create: `mobile/lib/providers/auth_provider.dart`

**Step 1: Create mobile/lib/providers/service_providers.dart**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/storage_service.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(storageServiceProvider);
  final client = ApiClient(storage);
  return client;
});

final authServiceProvider = Provider<AuthService>((ref) {
  final api = ref.watch(apiClientProvider);
  final storage = ref.watch(storageServiceProvider);
  return AuthService(api, storage);
});
```

**Step 2: Create mobile/lib/providers/auth_provider.dart**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_client.dart';
import 'service_providers.dart';

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final AuthService _authService;
  final ApiClient _apiClient;

  AuthNotifier(this._authService, this._apiClient) : super(const AsyncValue.data(null)) {
    // Wire 401 callback to clear auth state
    _apiClient.onUnauthorized = () {
      state = const AsyncValue.data(null);
    };
  }

  Future<void> checkAuth() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.getMe();
      state = AsyncValue.data(user);
    } catch (_) {
      state = const AsyncValue.data(null);
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = const AsyncValue.loading();
    try {
      final authResponse = await _authService.login(email: email, password: password);
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signupCreator({
    required String email,
    required String password,
    required String displayName,
  }) async {
    state = const AsyncValue.loading();
    try {
      final authResponse = await _authService.signupCreator(
        email: email, password: password, displayName: displayName,
      );
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signupAgency({
    required String email,
    required String password,
    required String companyName,
  }) async {
    state = const AsyncValue.loading();
    try {
      final authResponse = await _authService.signupAgency(
        email: email, password: password, companyName: companyName,
      );
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AsyncValue.data(null);
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier(
    ref.watch(authServiceProvider),
    ref.watch(apiClientProvider),
  );
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authNotifierProvider).value;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
```

**Step 3: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/providers/
git commit -m "feat(mobile): add Riverpod service and auth providers"
```

---

### Task 11: Create router

**Files:**
- Create: `mobile/lib/config/router.dart`

**Step 1: Create mobile/lib/config/router.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/home_screen.dart';
import '../screens/login_screen.dart';
import '../screens/signup/creator_signup_screen.dart';
import '../screens/signup/agency_signup_screen.dart';
import '../screens/dashboard/creator_dashboard_screen.dart';
import '../screens/dashboard/agency_dashboard_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(isAuthenticatedProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isDashboard = state.matchedLocation.startsWith('/dashboard');
      if (isDashboard && !authState) {
        return '/login';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(
        path: '/signup/creator',
        builder: (_, __) => const CreatorSignupScreen(),
      ),
      GoRoute(
        path: '/signup/agency',
        builder: (_, __) => const AgencySignupScreen(),
      ),
      GoRoute(
        path: '/dashboard/creator',
        builder: (_, __) => const CreatorDashboardScreen(),
      ),
      GoRoute(
        path: '/dashboard/agency',
        builder: (_, __) => const AgencyDashboardScreen(),
      ),
    ],
  );
});
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/config/router.dart
git commit -m "feat(mobile): add GoRouter with auth redirect"
```

---

### Task 12: Create screens

**Files:**
- Create: `mobile/lib/screens/splash_screen.dart`
- Create: `mobile/lib/screens/home_screen.dart`
- Create: `mobile/lib/screens/login_screen.dart`
- Create: `mobile/lib/screens/signup/creator_signup_screen.dart`
- Create: `mobile/lib/screens/signup/agency_signup_screen.dart`
- Create: `mobile/lib/screens/dashboard/creator_dashboard_screen.dart`
- Create: `mobile/lib/screens/dashboard/agency_dashboard_screen.dart`

**Step 1: Create mobile/lib/screens/splash_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await ref.read(authNotifierProvider.notifier).checkAuth();
    if (!mounted) return;

    final user = ref.read(currentUserProvider);
    if (user == null) {
      context.go('/');
    } else if (user.role == UserRole.creator) {
      context.go('/dashboard/creator');
    } else {
      context.go('/dashboard/agency');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
```

**Step 2: Create mobile/lib/screens/home_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'CollabHub',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Connect creators and agencies',
                style: Theme.of(context).textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              FilledButton(
                onPressed: () => context.push('/signup/creator'),
                child: const Text('Join as Creator'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.push('/signup/agency'),
                child: const Text('Join as Agency'),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.push('/login'),
                child: const Text('Already have an account? Log in'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Step 3: Create mobile/lib/screens/login_screen.dart**

```dart
import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Log In')),
      body: const Center(
        child: Text('Login form — coming soon'),
      ),
    );
  }
}
```

**Step 4: Create mobile/lib/screens/signup/creator_signup_screen.dart**

```dart
import 'package:flutter/material.dart';

class CreatorSignupScreen extends StatelessWidget {
  const CreatorSignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join as Creator')),
      body: const Center(
        child: Text('Creator signup — coming soon'),
      ),
    );
  }
}
```

**Step 5: Create mobile/lib/screens/signup/agency_signup_screen.dart**

```dart
import 'package:flutter/material.dart';

class AgencySignupScreen extends StatelessWidget {
  const AgencySignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join as Agency')),
      body: const Center(
        child: Text('Agency signup — coming soon'),
      ),
    );
  }
}
```

**Step 6: Create mobile/lib/screens/dashboard/creator_dashboard_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class CreatorDashboardScreen extends ConsumerWidget {
  const CreatorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Creator Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go('/');
            },
          ),
        ],
      ),
      body: Center(
        child: Text('Welcome, ${user?.email ?? ''}'),
      ),
    );
  }
}
```

**Step 7: Create mobile/lib/screens/dashboard/agency_dashboard_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class AgencyDashboardScreen extends ConsumerWidget {
  const AgencyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agency Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go('/');
            },
          ),
        ],
      ),
      body: Center(
        child: Text('Welcome, ${user?.email ?? ''}'),
      ),
    );
  }
}
```

**Step 8: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/screens/
git commit -m "feat(mobile): add all screen scaffolds (splash, home, login, signup, dashboards)"
```

---

### Task 13: Create utils and stub widget folders

**Files:**
- Create: `mobile/lib/utils/validators.dart`
- Create: `mobile/lib/widgets/common/.gitkeep`
- Create: `mobile/lib/widgets/forms/.gitkeep`

**Step 1: Create mobile/lib/utils/validators.dart**

```dart
class Validators {
  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    final emailRegex = RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) return 'Enter a valid email';
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    final phoneRegex = RegExp(r'^\+?[0-9]{7,15}$');
    if (!phoneRegex.hasMatch(value)) return 'Enter a valid phone number';
    return null;
  }

  static String? url(String? value) {
    if (value == null || value.isEmpty) return null; // optional
    final urlRegex = RegExp(
      r'^(https?://)([\w-]+(\.[\w-]+)+)(:[0-9]+)?(/[\w-./?%&=]*)?$',
    );
    if (!urlRegex.hasMatch(value)) return 'Enter a valid URL';
    return null;
  }

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? minLength(String? value, int min) {
    if (value == null || value.length < min) {
      return 'Must be at least $min characters';
    }
    return null;
  }
}
```

**Step 2: Create stub folders**

```bash
touch mobile/lib/widgets/common/.gitkeep
touch mobile/lib/widgets/forms/.gitkeep
```

**Step 3: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/utils/ mobile/lib/widgets/
git commit -m "feat(mobile): add validators utility and stub widget folders"
```

---

### Task 14: Create main.dart and wire everything together

**Files:**
- Create: `mobile/lib/main.dart`

**Step 1: Create mobile/lib/main.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/router.dart';
import 'config/theme.dart';

void main() {
  runApp(const ProviderScope(child: CollabHubApp()));
}

class CollabHubApp extends ConsumerWidget {
  const CollabHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'CollabHub',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

**Step 2: Run analyze to verify no errors**

```bash
cd mobile
flutter analyze
```
Expected: No errors. Warnings about unused imports are OK at this stage.

**Step 3: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/lib/main.dart
git commit -m "feat(mobile): wire main.dart with ProviderScope, MaterialApp.router, theme"
```

---

### Task 15: Create mobile README

**Files:**
- Create: `mobile/README.md`

**Step 1: Create mobile/README.md**

```markdown
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
```

**Step 2: Commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add mobile/README.md
git commit -m "docs(mobile): add Flutter project README"
```

---

### Task 16: Final verification

**Step 1: Full analyze**

```bash
cd mobile
flutter analyze
```
Expected: No errors.

**Step 2: Run build_runner one final time**

```bash
dart run build_runner build --delete-conflicting-outputs
```
Expected: All `.g.dart` files generated cleanly.

**Step 3: Verify project structure**

```bash
find lib -type f -name "*.dart" | sort
```
Expected output should include all 20+ files created in this plan.

**Step 4: Update monorepo CLAUDE.md**

Add a `mobile` section to `CLAUDE.md` at the project root documenting:
- Commands: `flutter pub get`, `flutter run`, `dart run build_runner build`
- Architecture summary matching this plan

**Step 5: Final commit**

```bash
cd /Users/pratikdesai/projects/manage-content-creators
git add CLAUDE.md
git commit -m "docs: add Flutter mobile section to CLAUDE.md"
```

