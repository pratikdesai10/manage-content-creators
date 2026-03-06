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
      response.data['data'] as Map<String, dynamic>,
    );
    await _storageService.saveToken(authResponse.accessToken);
    return authResponse;
  }

  /// Register a creator with the full multi-step form payload.
  Future<AuthResponse> registerCreator(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post(
      '/auth/register/creator',
      data: payload,
    );
    final authResponse = AuthResponse.fromJson(
      response.data['data'] as Map<String, dynamic>,
    );
    await _storageService.saveToken(authResponse.accessToken);
    return authResponse;
  }

  /// Register an agency with the full multi-step form payload.
  Future<AuthResponse> registerAgency(Map<String, dynamic> payload) async {
    final response = await _apiClient.dio.post(
      '/auth/register/agency',
      data: payload,
    );
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

  Future<bool> checkEmail(String email) async {
    final response = await _apiClient.dio.get(
      '/auth/check-email/${Uri.encodeComponent(email)}',
    );
    return (response.data['data'] as Map<String, dynamic>)['available'] == true;
  }

  Future<void> logout() async {
    await _storageService.deleteToken();
  }
}
