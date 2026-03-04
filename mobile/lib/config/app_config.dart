import 'package:envied/envied.dart';

part 'app_config.g.dart';

@Envied(path: '.env', obfuscate: false)
final class Env {
  @EnviedField(varName: 'COLLABHUB_API_URL', defaultValue: 'http://localhost:3000')
  static const String apiBaseUrl = _Env.apiBaseUrl;
}

class AppConfig {
  static const String apiBaseUrl = Env.apiBaseUrl;
  static const String appName = 'CollabHub';
  static const String authTokenKey = 'auth_token';
}
