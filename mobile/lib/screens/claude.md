# Module: Screens

## Purpose
- Full-screen page widgets for each route

## Responsibilities
- Render UI for each app screen
- Orchestrate multi-step signup forms (creator + agency, 5 steps each)
- Handle navigation and auth actions

## Folder Structure
```
screens/
├── splash_screen.dart     — Auth check → route to dashboard or home
├── home_screen.dart       — Landing with "Join as Creator/Agency" CTAs
├── login_screen.dart      — Login form (placeholder)
├── signup/
│   ├── creator_signup_screen.dart — 5-step PageView form
│   ├── agency_signup_screen.dart  — 5-step PageView form
│   └── verify_email_screen.dart   — Post-signup verification
└── dashboard/
    ├── creator_dashboard_screen.dart — Creator home (placeholder)
    └── agency_dashboard_screen.dart  — Agency home (placeholder)
```

## Key Components
- **SplashScreen** — checks auth on init, routes based on user role
- **CreatorSignupScreen** — 5-step form (personal → social → profile → collaboration → review)
  - Uses `PageController` for step navigation
  - Per-step form validation with `FormKey`
  - Builds signup payload, calls `authNotifierProvider.registerCreator()`
- **AgencySignupScreen** — 5-step form (account manager → brand → location/audience → campaign → review)
  - Same PageView pattern, calls `authNotifierProvider.registerAgency()`
- **Dashboard screens** — display user email, logout button

## Data Flow
- Signup: fill form → validate step → next → ... → submit → API call → navigate to verify-email
- Splash: checkAuth() → role-based routing

## Dependencies
- Internal: `providers/auth_provider`, `utils/enums`, `utils/validators`, `widgets/*`
- External: `flutter_riverpod`, `go_router`

## Integration
- All screens referenced in `config/router.dart`
- Signup screens use `SignupStepper`, `StepNavigationButtons`, `ChipMultiSelect` widgets

## Conventions
- Use `ConsumerWidget` or `ConsumerStatefulWidget` for Riverpod access
- Navigate with `context.go()` / `context.push()` from GoRouter
- Form validation per step before advancing
