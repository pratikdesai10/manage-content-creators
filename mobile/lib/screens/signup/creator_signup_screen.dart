import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../utils/enums.dart';
import '../../utils/validators.dart';
import '../../widgets/chip_multi_select.dart';
import '../../widgets/signup_stepper.dart';
import '../../widgets/step_navigation_buttons.dart';

const _stepLabels = ['Personal', 'Social', 'Profile', 'Collab', 'Review'];
const _genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

class CreatorSignupScreen extends ConsumerStatefulWidget {
  const CreatorSignupScreen({super.key});

  @override
  ConsumerState<CreatorSignupScreen> createState() =>
      _CreatorSignupScreenState();
}

class _CreatorSignupScreenState extends ConsumerState<CreatorSignupScreen> {
  final _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  // One form key per step
  final _formKeys = List.generate(5, (_) => GlobalKey<FormState>());

  // ── Step 1: Personal Info ────────────────────────────────────────
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _displayNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  DateTime? _dateOfBirth;
  String? _gender;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  // ── Step 2: Social Media ─────────────────────────────────────────
  final List<_SocialAccount> _socialAccounts = [_SocialAccount()];

  // ── Step 3: Profile & Categories ─────────────────────────────────
  Set<CreatorCategory> _categories = {};
  final _bioCtrl = TextEditingController();
  Set<String> _languages = {};
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _countryCtrl = TextEditingController(text: 'India');
  Set<ContentType> _contentTypes = {};
  final _portfolioUrlCtrl = TextEditingController();

  // ── Step 4: Collaboration Preferences ────────────────────────────
  RateRange? _rateRange;
  Set<CollaborationType> _collaborationTypes = {};
  Availability? _availability;
  bool _willingToTravel = false;
  TravelScope? _travelScope;
  final _previousCollabsCtrl = TextEditingController();
  final List<String> _notableBrands = [];
  final _brandInputCtrl = TextEditingController();

  // ── Step 5: Review & Terms ───────────────────────────────────────
  bool _termsOfService = false;
  bool _contentGuidelines = false;
  bool _ageConfirmation = false;
  bool _dataAccuracy = false;
  bool _marketingEmails = false;
  bool _whatsappNotifications = false;

  @override
  void dispose() {
    _pageController.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _displayNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _bioCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _countryCtrl.dispose();
    _portfolioUrlCtrl.dispose();
    _previousCollabsCtrl.dispose();
    _brandInputCtrl.dispose();
    for (final account in _socialAccounts) {
      account.dispose();
    }
    super.dispose();
  }

  // ── Navigation ───────────────────────────────────────────────────

  void _goToStep(int step) {
    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _onNext() {
    if (_currentStep < 4) {
      if (!_validateCurrentStep()) return;
      _goToStep(_currentStep + 1);
    } else {
      _submit();
    }
  }

  void _onBack() {
    if (_currentStep > 0) _goToStep(_currentStep - 1);
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _formKeys[0].currentState?.validate() ?? false;
      case 1:
        if (_socialAccounts.isEmpty) {
          _showError('Add at least one social account');
          return false;
        }
        for (final account in _socialAccounts) {
          if (account.platform == null) {
            _showError('Select a platform for each social account');
            return false;
          }
          if (account.handleCtrl.text.trim().isEmpty) {
            _showError('Enter a handle for each social account');
            return false;
          }
          if (account.profileUrlCtrl.text.trim().isEmpty) {
            _showError('Enter a profile URL for each social account');
            return false;
          }
          if (account.followerCountCtrl.text.trim().isEmpty) {
            _showError('Enter follower count for each social account');
            return false;
          }
          final urlErr = Validators.url(account.profileUrlCtrl.text.trim());
          if (urlErr != null) {
            _showError(urlErr);
            return false;
          }
        }
        return true;
      case 2:
        if (_categories.isEmpty) {
          _showError('Select at least 1 category');
          return false;
        }
        if (_languages.isEmpty) {
          _showError('Select at least 1 language');
          return false;
        }
        if (_contentTypes.isEmpty) {
          _showError('Select at least 1 content type');
          return false;
        }
        return _formKeys[2].currentState?.validate() ?? false;
      case 3:
        if (_rateRange == null) {
          _showError('Select a rate range');
          return false;
        }
        if (_collaborationTypes.isEmpty) {
          _showError('Select at least 1 collaboration type');
          return false;
        }
        if (_availability == null) {
          _showError('Select your availability');
          return false;
        }
        if (_willingToTravel && _travelScope == null) {
          _showError('Select a travel scope');
          return false;
        }
        return _formKeys[3].currentState?.validate() ?? false;
      case 4:
        if (!_termsOfService ||
            !_contentGuidelines ||
            !_ageConfirmation ||
            !_dataAccuracy) {
          _showError('Please accept all required agreements');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  // ── Submission ───────────────────────────────────────────────────

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'email': _emailCtrl.text.trim(),
      'password': _passwordCtrl.text,
      'firstName': _firstNameCtrl.text.trim(),
      'lastName': _lastNameCtrl.text.trim(),
      'displayName': _displayNameCtrl.text.trim(),
      'phone': _phoneCtrl.text.trim(),
      'dateOfBirth': _dateOfBirth != null
          ? '${_dateOfBirth!.year}-${_dateOfBirth!.month.toString().padLeft(2, '0')}-${_dateOfBirth!.day.toString().padLeft(2, '0')}'
          : null,
      'gender': _gender,
      'bio': _bioCtrl.text.trim(),
      'languages': _languages.toList(),
      'city': _cityCtrl.text.trim(),
      'state': _stateCtrl.text.trim(),
      'country': _countryCtrl.text.trim(),
      'categories': _categories.map((c) => c.name).toList(),
      'contentTypes': _contentTypes.map((c) => c.name).toList(),
      'portfolioUrl': _portfolioUrlCtrl.text.trim(),
      'rateRange': _rateRange?.name,
      'collaborationTypes': _collaborationTypes.map((c) => c.name).toList(),
      'availability': _availability?.name,
      'willingToTravel': _willingToTravel,
      'travelScope': _willingToTravel ? _travelScope?.name : null,
      'previousCollaborations': _previousCollabsCtrl.text.trim().isNotEmpty
          ? int.tryParse(_previousCollabsCtrl.text.trim())
          : null,
      'notableBrands': _notableBrands.isNotEmpty ? _notableBrands : null,
      'marketingEmails': _marketingEmails,
      'whatsappNotifications': _whatsappNotifications,
      'socialAccounts': _socialAccounts
          .map((a) => {
                'platform': a.platform!.name,
                'handle': a.handleCtrl.text.trim(),
                'profileUrl': a.profileUrlCtrl.text.trim(),
                'followerCount':
                    int.tryParse(a.followerCountCtrl.text.trim()) ?? 0,
              })
          .toList(),
    };

    // Remove null/empty optional fields
    payload.removeWhere((key, value) {
      if (value == null) return true;
      if (value is String && value.isEmpty) return true;
      if (value is List && value.isEmpty) return true;
      return false;
    });

    return payload;
  }

  Future<void> _submit() async {
    if (!_validateCurrentStep()) return;

    setState(() => _isSubmitting = true);

    try {
      final payload = _buildPayload();
      await ref.read(authNotifierProvider.notifier).registerCreator(payload);

      if (!mounted) return;
      context.go('/signup/verify-email');
    } catch (e) {
      if (!mounted) return;
      String message = 'Registration failed. Please try again.';
      if (e is DioException) {
        final data = e.response?.data;
        if (data is Map<String, dynamic>) {
          final msg = data['message'];
          if (msg is List && msg.isNotEmpty) {
            message = msg.first.toString();
          } else if (msg is String) {
            message = msg;
          }
        }
      }
      _showError(message);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
      );
  }

  // ── Helpers ──────────────────────────────────────────────────────

  InputDecoration _inputDecoration(String label, {String? hint, Widget? suffix}) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      suffixIcon: suffix,
      border: const OutlineInputBorder(),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 8),
      child: Text(
        text,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }

  // ── Build ────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Join as Creator'),
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _onBack,
              )
            : null,
      ),
      body: Column(
        children: [
          SignupStepper(currentStep: _currentStep, labels: _stepLabels),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep1PersonalInfo(),
                _buildStep2SocialMedia(),
                _buildStep3ProfileCategories(),
                _buildStep4CollabPreferences(),
                _buildStep5Review(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: StepNavigationButtons(
              currentStep: _currentStep,
              totalSteps: 5,
              onNext: _onNext,
              onBack: _onBack,
              isSubmitting: _isSubmitting,
              submitLabel: 'Create Account',
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 1: Personal Info
  // ════════════════════════════════════════════════════════════════════

  Widget _buildStep1PersonalInfo() {
    return Form(
      key: _formKeys[0],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Personal Information'),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _firstNameCtrl,
                  decoration: _inputDecoration('First Name'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      Validators.required(v, field: 'First name'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _lastNameCtrl,
                  decoration: _inputDecoration('Last Name'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      Validators.required(v, field: 'Last name'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _displayNameCtrl,
            decoration: _inputDecoration('Display Name',
                hint: 'How you want to be known'),
            validator: (v) =>
                Validators.required(v, field: 'Display name'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _emailCtrl,
            decoration: _inputDecoration('Email'),
            keyboardType: TextInputType.emailAddress,
            validator: Validators.email,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneCtrl,
            decoration: _inputDecoration('Phone Number', hint: '+91XXXXXXXXXX'),
            keyboardType: TextInputType.phone,
            validator: Validators.phone,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordCtrl,
            decoration: _inputDecoration(
              'Password',
              suffix: IconButton(
                icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            obscureText: _obscurePassword,
            validator: _validatePassword,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _confirmPasswordCtrl,
            decoration: _inputDecoration(
              'Confirm Password',
              suffix: IconButton(
                icon: Icon(
                    _obscureConfirm ? Icons.visibility_off : Icons.visibility),
                onPressed: () =>
                    setState(() => _obscureConfirm = !_obscureConfirm),
              ),
            ),
            obscureText: _obscureConfirm,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Confirm your password';
              if (v != _passwordCtrl.text) return 'Passwords do not match';
              return null;
            },
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _pickDateOfBirth,
            child: AbsorbPointer(
              child: TextFormField(
                decoration: _inputDecoration(
                  'Date of Birth',
                  hint: _dateOfBirth != null
                      ? '${_dateOfBirth!.day.toString().padLeft(2, '0')}/${_dateOfBirth!.month.toString().padLeft(2, '0')}/${_dateOfBirth!.year}'
                      : 'DD/MM/YYYY',
                  suffix: const Icon(Icons.calendar_today),
                ),
                controller: TextEditingController(
                  text: _dateOfBirth != null
                      ? '${_dateOfBirth!.day.toString().padLeft(2, '0')}/${_dateOfBirth!.month.toString().padLeft(2, '0')}/${_dateOfBirth!.year}'
                      : '',
                ),
                validator: (v) {
                  if (_dateOfBirth == null) return 'Date of birth is required';
                  return null;
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _gender,
            decoration: _inputDecoration('Gender (Optional)'),
            items: _genderOptions
                .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                .toList(),
            onChanged: (v) => setState(() => _gender = v),
          ),
        ],
      ),
    );
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Must be at least 8 characters';
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Must contain at least 1 uppercase letter';
    }
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Must contain at least 1 lowercase letter';
    }
    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return 'Must contain at least 1 number';
    }
    if (!RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(value)) {
      return 'Must contain at least 1 special character';
    }
    return null;
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 18, now.month, now.day),
      firstDate: DateTime(1950),
      lastDate: now,
      helpText: 'Select your date of birth',
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 2: Social Media
  // ════════════════════════════════════════════════════════════════════

  Widget _buildStep2SocialMedia() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      children: [
        _sectionTitle('Social Media Accounts'),
        Text(
          'Add at least one social media account where you create content.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 16),
        ..._socialAccounts.asMap().entries.map((entry) {
          final index = entry.key;
          final account = entry.value;
          return _buildSocialAccountCard(account, index);
        }),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            setState(() => _socialAccounts.add(_SocialAccount()));
          },
          icon: const Icon(Icons.add),
          label: const Text('Add Account'),
        ),
      ],
    );
  }

  Widget _buildSocialAccountCard(_SocialAccount account, int index) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Account ${index + 1}',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                if (_socialAccounts.length > 1)
                  IconButton(
                    icon: Icon(Icons.delete_outline, color: cs.error),
                    onPressed: () {
                      setState(() {
                        _socialAccounts[index].dispose();
                        _socialAccounts.removeAt(index);
                      });
                    },
                    tooltip: 'Remove account',
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<SocialPlatform>(
              initialValue: account.platform,
              decoration: _inputDecoration('Platform'),
              items: SocialPlatform.values
                  .map((p) =>
                      DropdownMenuItem(value: p, child: Text(p.label)))
                  .toList(),
              onChanged: (v) => setState(() => account.platform = v),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: account.handleCtrl,
              decoration: _inputDecoration('Handle', hint: '@username'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: account.profileUrlCtrl,
              decoration:
                  _inputDecoration('Profile URL', hint: 'https://...'),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: account.followerCountCtrl,
              decoration: _inputDecoration('Follower Count'),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 3: Profile & Categories
  // ════════════════════════════════════════════════════════════════════

  Widget _buildStep3ProfileCategories() {
    return Form(
      key: _formKeys[2],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Categories (max 3)'),
          ChipMultiSelect<CreatorCategory>(
            items: CreatorCategory.values,
            selected: _categories,
            labelBuilder: (c) => c.label,
            onChanged: (v) => setState(() => _categories = v),
            maxSelections: 3,
          ),
          if (_categories.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                'Select at least 1 category',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 12,
                ),
              ),
            ),
          const SizedBox(height: 20),
          _sectionTitle('Bio'),
          TextFormField(
            controller: _bioCtrl,
            decoration: _inputDecoration('Tell us about yourself',
                hint: 'Min 50, max 500 characters'),
            maxLines: 4,
            maxLength: 500,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Bio is required';
              if (v.trim().length < 50) return 'Bio must be at least 50 characters';
              return null;
            },
          ),
          const SizedBox(height: 20),
          _sectionTitle('Languages'),
          ChipMultiSelect<String>(
            items: kLanguages,
            selected: _languages,
            labelBuilder: (l) => l,
            onChanged: (v) => setState(() => _languages = v),
          ),
          if (_languages.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                'Select at least 1 language',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 12,
                ),
              ),
            ),
          const SizedBox(height: 20),
          _sectionTitle('Location'),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _cityCtrl,
                  decoration: _inputDecoration('City'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => Validators.required(v, field: 'City'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _stateCtrl,
                  decoration: _inputDecoration('State'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => Validators.required(v, field: 'State'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _countryCtrl,
            decoration: _inputDecoration('Country'),
            textCapitalization: TextCapitalization.words,
            validator: (v) => Validators.required(v, field: 'Country'),
          ),
          const SizedBox(height: 20),
          _sectionTitle('Content Types'),
          ChipMultiSelect<ContentType>(
            items: ContentType.values,
            selected: _contentTypes,
            labelBuilder: (c) => c.label,
            onChanged: (v) => setState(() => _contentTypes = v),
          ),
          if (_contentTypes.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                'Select at least 1 content type',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 12,
                ),
              ),
            ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _portfolioUrlCtrl,
            decoration: _inputDecoration('Portfolio URL (Optional)',
                hint: 'https://yourportfolio.com'),
            keyboardType: TextInputType.url,
            validator: Validators.url,
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 4: Collaboration Preferences
  // ════════════════════════════════════════════════════════════════════

  Widget _buildStep4CollabPreferences() {
    return Form(
      key: _formKeys[3],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Rate Range'),
          DropdownButtonFormField<RateRange>(
            initialValue: _rateRange,
            decoration: _inputDecoration('Your rate per collaboration'),
            items: RateRange.values
                .map((r) => DropdownMenuItem(value: r, child: Text(r.label)))
                .toList(),
            onChanged: (v) => setState(() => _rateRange = v),
          ),
          const SizedBox(height: 20),
          _sectionTitle('Collaboration Types'),
          ChipMultiSelect<CollaborationType>(
            items: CollaborationType.values,
            selected: _collaborationTypes,
            labelBuilder: (c) => c.label,
            onChanged: (v) => setState(() => _collaborationTypes = v),
          ),
          if (_collaborationTypes.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                'Select at least 1 collaboration type',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 12,
                ),
              ),
            ),
          const SizedBox(height: 20),
          _sectionTitle('Availability'),
          DropdownButtonFormField<Availability>(
            initialValue: _availability,
            decoration: _inputDecoration('Your availability'),
            items: Availability.values
                .map((a) => DropdownMenuItem(value: a, child: Text(a.label)))
                .toList(),
            onChanged: (v) => setState(() => _availability = v),
          ),
          const SizedBox(height: 20),
          SwitchListTile(
            title: const Text('Willing to Travel'),
            subtitle: const Text('For brand events, shoots, etc.'),
            value: _willingToTravel,
            onChanged: (v) => setState(() {
              _willingToTravel = v;
              if (!v) _travelScope = null;
            }),
            contentPadding: EdgeInsets.zero,
          ),
          if (_willingToTravel) ...[
            const SizedBox(height: 12),
            DropdownButtonFormField<TravelScope>(
              initialValue: _travelScope,
              decoration: _inputDecoration('Travel Scope'),
              items: TravelScope.values
                  .map(
                      (t) => DropdownMenuItem(value: t, child: Text(t.label)))
                  .toList(),
              onChanged: (v) => setState(() => _travelScope = v),
            ),
          ],
          const SizedBox(height: 20),
          TextFormField(
            controller: _previousCollabsCtrl,
            decoration: _inputDecoration(
              'Previous Collaborations (Optional)',
              hint: 'Number of past brand collaborations',
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          ),
          const SizedBox(height: 20),
          _sectionTitle('Notable Brands (Optional)'),
          Text(
            'Brands you have worked with previously.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _brandInputCtrl,
                  decoration: _inputDecoration('Brand name'),
                  textCapitalization: TextCapitalization.words,
                  onFieldSubmitted: (_) => _addBrand(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: _addBrand,
                icon: const Icon(Icons.add),
              ),
            ],
          ),
          if (_notableBrands.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _notableBrands
                  .map((brand) => Chip(
                        label: Text(brand),
                        onDeleted: () {
                          setState(() => _notableBrands.remove(brand));
                        },
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  void _addBrand() {
    final brand = _brandInputCtrl.text.trim();
    if (brand.isEmpty) return;
    if (_notableBrands.contains(brand)) {
      _showError('Brand already added');
      return;
    }
    setState(() {
      _notableBrands.add(brand);
      _brandInputCtrl.clear();
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 5: Review & Terms
  // ════════════════════════════════════════════════════════════════════

  Widget _buildStep5Review() {
    final textTheme = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      children: [
        _sectionTitle('Review Your Information'),
        // Personal Info Card
        _reviewCard(
          title: 'Personal Info',
          icon: Icons.person_outline,
          children: [
            _reviewRow('Name',
                '${_firstNameCtrl.text.trim()} ${_lastNameCtrl.text.trim()}'),
            _reviewRow('Display Name', _displayNameCtrl.text.trim()),
            _reviewRow('Email', _emailCtrl.text.trim()),
            _reviewRow('Phone', _phoneCtrl.text.trim()),
            if (_dateOfBirth != null)
              _reviewRow('Date of Birth',
                  '${_dateOfBirth!.day.toString().padLeft(2, '0')}/${_dateOfBirth!.month.toString().padLeft(2, '0')}/${_dateOfBirth!.year}'),
            if (_gender != null) _reviewRow('Gender', _gender!),
          ],
        ),
        const SizedBox(height: 12),
        // Social Accounts Card
        _reviewCard(
          title: 'Social Media',
          icon: Icons.share_outlined,
          children: _socialAccounts.map((a) {
            return _reviewRow(
              a.platform?.label ?? 'Unknown',
              '${a.handleCtrl.text.trim()} (${a.followerCountCtrl.text.trim()} followers)',
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        // Profile Card
        _reviewCard(
          title: 'Profile & Categories',
          icon: Icons.category_outlined,
          children: [
            _reviewRow('Categories',
                _categories.map((c) => c.label).join(', ')),
            _reviewRow('Languages', _languages.join(', ')),
            _reviewRow('Location',
                '${_cityCtrl.text.trim()}, ${_stateCtrl.text.trim()}, ${_countryCtrl.text.trim()}'),
            _reviewRow('Content Types',
                _contentTypes.map((c) => c.label).join(', ')),
            if (_portfolioUrlCtrl.text.trim().isNotEmpty)
              _reviewRow('Portfolio', _portfolioUrlCtrl.text.trim()),
          ],
        ),
        const SizedBox(height: 12),
        // Collab Preferences Card
        _reviewCard(
          title: 'Collaboration Preferences',
          icon: Icons.handshake_outlined,
          children: [
            if (_rateRange != null)
              _reviewRow('Rate Range', _rateRange!.label),
            _reviewRow('Collab Types',
                _collaborationTypes.map((c) => c.label).join(', ')),
            if (_availability != null)
              _reviewRow('Availability', _availability!.label),
            _reviewRow('Travel', _willingToTravel
                ? 'Yes${_travelScope != null ? ' - ${_travelScope!.label}' : ''}'
                : 'No'),
            if (_previousCollabsCtrl.text.trim().isNotEmpty)
              _reviewRow('Previous Collaborations',
                  _previousCollabsCtrl.text.trim()),
            if (_notableBrands.isNotEmpty)
              _reviewRow('Notable Brands', _notableBrands.join(', ')),
          ],
        ),
        const SizedBox(height: 24),
        // Agreements
        Text(
          'Agreements',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        _requiredCheckbox(
          value: _termsOfService,
          label: 'I agree to the Terms of Service *',
          onChanged: (v) => setState(() => _termsOfService = v ?? false),
        ),
        _requiredCheckbox(
          value: _contentGuidelines,
          label: 'I agree to the Content Guidelines *',
          onChanged: (v) => setState(() => _contentGuidelines = v ?? false),
        ),
        _requiredCheckbox(
          value: _ageConfirmation,
          label: 'I confirm that I am 18 years or older *',
          onChanged: (v) => setState(() => _ageConfirmation = v ?? false),
        ),
        _requiredCheckbox(
          value: _dataAccuracy,
          label: 'I confirm that all information provided is accurate *',
          onChanged: (v) => setState(() => _dataAccuracy = v ?? false),
        ),
        const Divider(height: 24),
        CheckboxListTile(
          value: _marketingEmails,
          onChanged: (v) => setState(() => _marketingEmails = v ?? false),
          title: Text('Receive marketing emails',
              style: textTheme.bodyMedium),
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
          dense: true,
        ),
        CheckboxListTile(
          value: _whatsappNotifications,
          onChanged: (v) =>
              setState(() => _whatsappNotifications = v ?? false),
          title: Text('Receive WhatsApp notifications',
              style: textTheme.bodyMedium),
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
          dense: true,
        ),
      ],
    );
  }

  Widget _reviewCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: cs.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: cs.primary,
                      ),
                ),
              ],
            ),
            const Divider(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _reviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _requiredCheckbox({
    required bool value,
    required String label,
    required ValueChanged<bool?> onChanged,
  }) {
    final cs = Theme.of(context).colorScheme;
    return CheckboxListTile(
      value: value,
      onChanged: onChanged,
      title: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: !value ? cs.error : null,
            ),
      ),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }
}

// ══════════════════════════════════════════════════════════════════════
// Helper class for social account form data
// ══════════════════════════════════════════════════════════════════════

class _SocialAccount {
  SocialPlatform? platform;
  final TextEditingController handleCtrl = TextEditingController();
  final TextEditingController profileUrlCtrl = TextEditingController();
  final TextEditingController followerCountCtrl = TextEditingController();

  void dispose() {
    handleCtrl.dispose();
    profileUrlCtrl.dispose();
    followerCountCtrl.dispose();
  }
}
