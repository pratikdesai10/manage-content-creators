import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_client.dart';
import 'service_providers.dart';

class AuthNotifier extends Notifier<AsyncValue<User?>> {
  late final AuthService _authService;
  late final ApiClient _apiClient;

  @override
  AsyncValue<User?> build() {
    _authService = ref.read(authServiceProvider);
    _apiClient = ref.read(apiClientProvider);
    _apiClient.onUnauthorized = () {
      state = const AsyncValue.data(null);
    };
    return const AsyncValue.data(null);
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
      final authResponse =
          await _authService.login(email: email, password: password);
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> registerCreator(Map<String, dynamic> payload) async {
    state = const AsyncValue.loading();
    try {
      final authResponse = await _authService.registerCreator(payload);
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> registerAgency(Map<String, dynamic> payload) async {
    state = const AsyncValue.loading();
    try {
      final authResponse = await _authService.registerAgency(payload);
      state = AsyncValue.data(authResponse.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AsyncValue.data(null);
  }
}

final authNotifierProvider =
    NotifierProvider<AuthNotifier, AsyncValue<User?>>(() => AuthNotifier());

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authNotifierProvider).value;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
