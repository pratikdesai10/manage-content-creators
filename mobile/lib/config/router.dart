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
