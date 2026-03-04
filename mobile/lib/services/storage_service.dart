import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class StorageService {
  final FlutterSecureStorage _storage;

  StorageService()
      : _storage = const FlutterSecureStorage(
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
