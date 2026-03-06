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
