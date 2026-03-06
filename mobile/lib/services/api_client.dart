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
