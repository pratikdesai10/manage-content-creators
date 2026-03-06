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

class AgencySignupScreen extends ConsumerStatefulWidget {
  const AgencySignupScreen({super.key});

  @override
  ConsumerState<AgencySignupScreen> createState() => _AgencySignupScreenState();
}

class _AgencySignupScreenState extends ConsumerState<AgencySignupScreen> {
  late final PageController _pageController;
  int _currentStep = 0;
  bool _isSubmitting = false;

  // One form key per step
  final _formKeys = List.generate(5, (_) => GlobalKey<FormState>());

  // ── Step 1: Account Manager ──
  final _fullNameCtrl = TextEditingController();
  final _workEmailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _designationCtrl = TextEditingController();
  final _linkedinUrlCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  // ── Step 2: Brand Details ──
  final _brandNameCtrl = TextEditingController();
  final _companyLegalNameCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  IndustryCategory? _industry;
  CompanySize? _companySize;
  final _yearFoundedCtrl = TextEditingController();
  final _gstinCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  bool _socialsExpanded = false;
  final _igUrlCtrl = TextEditingController();
  final _ytUrlCtrl = TextEditingController();
  final _twUrlCtrl = TextEditingController();
  final _fbUrlCtrl = TextEditingController();
  final _liUrlCtrl = TextEditingController();

  // ── Step 3: Location & Audience ──
  final _countryCtrl = TextEditingController(text: 'India');
  final _stateCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _pinCodeCtrl = TextEditingController();
  Set<String> _targetAgeGroups = {};
  Set<String> _targetGenders = {};
  Set<String> _targetLocations = {};
  String? _targetIncomeBracket;
  Set<String> _targetLanguages = {};

  // ── Step 4: Campaign Preferences ──
  Set<SocialPlatform> _preferredPlatforms = {};
  Set<ContentType> _contentTypesNeeded = {};
  BudgetRange? _budgetRange;
  Set<PaymentType> _paymentTypes = {};
  PaymentTimeline? _paymentTimeline;
  String? _campaignsPerMonth;
  Set<FollowerRange> _preferredFollowerRange = {};
  Set<CreatorCategory> _preferredCreatorCategories = {};

  // ── Step 5: Review & Terms ──
  bool _termsOfService = false;
  bool _brandGuidelines = false;
  bool _paymentTerms = false;
  bool _dataAccuracy = false;
  bool _creatorCommunicationPolicy = false;
  bool _marketingEmails = false;

  static const _stepLabels = [
    'Account',
    'Brand',
    'Audience',
    'Campaign',
    'Review',
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fullNameCtrl.dispose();
    _workEmailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _phoneCtrl.dispose();
    _designationCtrl.dispose();
    _linkedinUrlCtrl.dispose();
    _brandNameCtrl.dispose();
    _companyLegalNameCtrl.dispose();
    _websiteCtrl.dispose();
    _yearFoundedCtrl.dispose();
    _gstinCtrl.dispose();
    _descriptionCtrl.dispose();
    _igUrlCtrl.dispose();
    _ytUrlCtrl.dispose();
    _twUrlCtrl.dispose();
    _fbUrlCtrl.dispose();
    _liUrlCtrl.dispose();
    _countryCtrl.dispose();
    _stateCtrl.dispose();
    _cityCtrl.dispose();
    _pinCodeCtrl.dispose();
    super.dispose();
  }

  // ── Navigation ──

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
      if (!_formKeys[_currentStep].currentState!.validate()) return;

      // Extra chip validations for step 2 (none), step 3, step 4
      if (_currentStep == 2 && !_validateStep3Chips()) return;
      if (_currentStep == 3 && !_validateStep4Chips()) return;

      _goToStep(_currentStep + 1);
    } else {
      _submit();
    }
  }

  void _onBack() {
    if (_currentStep > 0) _goToStep(_currentStep - 1);
  }

  bool _validateStep3Chips() {
    final errors = <String>[];
    if (_targetAgeGroups.isEmpty) errors.add('Select at least 1 age group');
    if (_targetGenders.isEmpty) errors.add('Select at least 1 gender');
    if (_targetLocations.isEmpty) errors.add('Select at least 1 target location');
    if (_targetLanguages.isEmpty) errors.add('Select at least 1 language');
    if (errors.isNotEmpty) {
      _showError(errors.first);
      return false;
    }
    return true;
  }

  bool _validateStep4Chips() {
    final errors = <String>[];
    if (_preferredPlatforms.isEmpty) errors.add('Select at least 1 platform');
    if (_contentTypesNeeded.isEmpty) errors.add('Select at least 1 content type');
    if (_paymentTypes.isEmpty) errors.add('Select at least 1 payment type');
    if (_preferredFollowerRange.isEmpty) {
      errors.add('Select at least 1 follower range');
    }
    if (_preferredCreatorCategories.isEmpty) {
      errors.add('Select at least 1 creator category');
    }
    if (errors.isNotEmpty) {
      _showError(errors.first);
      return false;
    }
    return true;
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ));
  }

  // ── Submission ──

  bool get _allAgreementsAccepted =>
      _termsOfService &&
      _brandGuidelines &&
      _paymentTerms &&
      _dataAccuracy &&
      _creatorCommunicationPolicy;

  Future<void> _submit() async {
    if (!_allAgreementsAccepted) {
      _showError('Please accept all required agreements to continue');
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final payload = _buildPayload();
      await ref.read(authNotifierProvider.notifier).registerAgency(payload);

      if (!mounted) return;
      context.go('/signup/verify-email');
    } catch (e) {
      if (!mounted) return;
      String message = 'Registration failed. Please try again.';
      if (e is DioException && e.response?.data is Map) {
        final data = e.response!.data as Map;
        if (data['message'] is List && (data['message'] as List).isNotEmpty) {
          message = (data['message'] as List).first.toString();
        } else if (data['message'] is String) {
          message = data['message'] as String;
        }
      }
      _showError(message);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'fullName': _fullNameCtrl.text.trim(),
      'workEmail': _workEmailCtrl.text.trim(),
      'password': _passwordCtrl.text,
      'phone': _phoneCtrl.text.trim(),
      'designation': _designationCtrl.text.trim(),
      'brandName': _brandNameCtrl.text.trim(),
      'companyLegalName': _companyLegalNameCtrl.text.trim(),
      'website': _websiteCtrl.text.trim(),
      'industry': _industry!.name,
      'companySize': _companySize!.name,
      'description': _descriptionCtrl.text.trim(),
      'country': _countryCtrl.text.trim(),
      'state': _stateCtrl.text.trim(),
      'city': _cityCtrl.text.trim(),
      'targetAudience': {
        'ageGroups': _targetAgeGroups.toList(),
        'genders': _targetGenders.toList(),
        'locations': _targetLocations.toList(),
        'languages': _targetLanguages.toList(),
        if (_targetIncomeBracket != null && _targetIncomeBracket!.isNotEmpty)
          'incomeBracket': _targetIncomeBracket,
      },
      'campaignPreferences': {
        'platforms': _preferredPlatforms.map((e) => e.name).toList(),
        'contentTypes': _contentTypesNeeded.map((e) => e.name).toList(),
        'budgetRange': _budgetRange!.name,
        'paymentTypes': _paymentTypes.map((e) => e.name).toList(),
        'paymentTimeline': _paymentTimeline!.name,
        'preferredFollowerRange':
            _preferredFollowerRange.map((e) => e.name).toList(),
        'preferredCreatorCategories':
            _preferredCreatorCategories.map((e) => e.name).toList(),
        if (_campaignsPerMonth != null && _campaignsPerMonth!.isNotEmpty)
          'campaignsPerMonth': _campaignsPerMonth,
      },
      'marketingEmails': _marketingEmails,
    };

    // Optional fields — only include if non-empty
    final linkedinUrl = _linkedinUrlCtrl.text.trim();
    if (linkedinUrl.isNotEmpty) payload['linkedinUrl'] = linkedinUrl;

    final yearText = _yearFoundedCtrl.text.trim();
    if (yearText.isNotEmpty) {
      final parsed = int.tryParse(yearText);
      if (parsed != null) payload['yearFounded'] = parsed;
    }

    final gstin = _gstinCtrl.text.trim();
    if (gstin.isNotEmpty) payload['gstin'] = gstin;

    final pinCode = _pinCodeCtrl.text.trim();
    if (pinCode.isNotEmpty) payload['pinCode'] = pinCode;

    // Brand socials — remove empty entries, omit object if all empty
    final socials = <String, String>{};
    void addSocial(String key, TextEditingController ctrl) {
      final v = ctrl.text.trim();
      if (v.isNotEmpty) socials[key] = v;
    }

    addSocial('instagram', _igUrlCtrl);
    addSocial('youtube', _ytUrlCtrl);
    addSocial('twitter', _twUrlCtrl);
    addSocial('facebook', _fbUrlCtrl);
    addSocial('linkedin', _liUrlCtrl);
    if (socials.isNotEmpty) payload['brandSocials'] = socials;

    return payload;
  }

  // ── Helpers ──

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
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      child: Text(
        text,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }

  Widget _chipLabel(String label, {bool required = true}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          if (required)
            Text(' *',
                style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUILD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join as Agency / Brand')),
      body: Column(
        children: [
          SignupStepper(currentStep: _currentStep, labels: _stepLabels),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep1(),
                _buildStep2(),
                _buildStep3(),
                _buildStep4(),
                _buildStep5(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1 — Account Manager
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Widget _buildStep1() {
    return Form(
      key: _formKeys[0],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Account Manager'),
          const SizedBox(height: 4),

          // Full name
          TextFormField(
            controller: _fullNameCtrl,
            decoration: _inputDecoration('Full Name'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'Full name'),
          ),
          const SizedBox(height: 16),

          // Work email
          TextFormField(
            controller: _workEmailCtrl,
            decoration: _inputDecoration('Work Email'),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            validator: Validators.email,
          ),
          const SizedBox(height: 16),

          // Password
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
            textInputAction: TextInputAction.next,
            validator: _validatePassword,
          ),
          const SizedBox(height: 16),

          // Confirm password
          TextFormField(
            controller: _confirmPasswordCtrl,
            decoration: _inputDecoration(
              'Confirm Password',
              suffix: IconButton(
                icon: Icon(_obscureConfirmPassword
                    ? Icons.visibility_off
                    : Icons.visibility),
                onPressed: () => setState(
                    () => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
            ),
            obscureText: _obscureConfirmPassword,
            textInputAction: TextInputAction.next,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Please confirm your password';
              if (v != _passwordCtrl.text) return 'Passwords do not match';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Phone
          TextFormField(
            controller: _phoneCtrl,
            decoration: _inputDecoration('Phone Number', hint: '+91XXXXXXXXXX'),
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            validator: Validators.phone,
          ),
          const SizedBox(height: 16),

          // Designation
          TextFormField(
            controller: _designationCtrl,
            decoration: _inputDecoration('Designation', hint: 'e.g. Marketing Manager'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'Designation'),
          ),
          const SizedBox(height: 16),

          // LinkedIn (optional)
          TextFormField(
            controller: _linkedinUrlCtrl,
            decoration: _inputDecoration('LinkedIn URL (optional)',
                hint: 'https://linkedin.com/in/...'),
            keyboardType: TextInputType.url,
            textInputAction: TextInputAction.done,
            validator: Validators.url,
          ),

          StepNavigationButtons(
            currentStep: _currentStep,
            totalSteps: 5,
            onNext: _onNext,
            onBack: _onBack,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2 — Brand Details
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Widget _buildStep2() {
    return Form(
      key: _formKeys[1],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Brand Details'),
          const SizedBox(height: 4),

          // Brand name
          TextFormField(
            controller: _brandNameCtrl,
            decoration: _inputDecoration('Brand Name'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'Brand name'),
          ),
          const SizedBox(height: 16),

          // Company legal name
          TextFormField(
            controller: _companyLegalNameCtrl,
            decoration: _inputDecoration('Company Legal Name'),
            textInputAction: TextInputAction.next,
            validator: (v) =>
                Validators.required(v, field: 'Company legal name'),
          ),
          const SizedBox(height: 16),

          // Website
          TextFormField(
            controller: _websiteCtrl,
            decoration:
                _inputDecoration('Website', hint: 'https://example.com'),
            keyboardType: TextInputType.url,
            textInputAction: TextInputAction.next,
            validator: (v) {
              final req = Validators.required(v, field: 'Website');
              if (req != null) return req;
              return Validators.url(v);
            },
          ),
          const SizedBox(height: 16),

          // Industry dropdown
          DropdownButtonFormField<IndustryCategory>(
            initialValue: _industry,
            decoration: _inputDecoration('Industry'),
            items: IndustryCategory.values
                .map((e) => DropdownMenuItem(value: e, child: Text(e.label)))
                .toList(),
            onChanged: (v) => setState(() => _industry = v),
            validator: (v) => v == null ? 'Please select an industry' : null,
          ),
          const SizedBox(height: 16),

          // Company size dropdown
          DropdownButtonFormField<CompanySize>(
            initialValue: _companySize,
            decoration: _inputDecoration('Company Size'),
            items: CompanySize.values
                .map((e) =>
                    DropdownMenuItem(value: e, child: Text('${e.label} employees')))
                .toList(),
            onChanged: (v) => setState(() => _companySize = v),
            validator: (v) => v == null ? 'Please select company size' : null,
          ),
          const SizedBox(height: 16),

          // Year founded (optional)
          TextFormField(
            controller: _yearFoundedCtrl,
            decoration: _inputDecoration('Year Founded (optional)'),
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(4),
            ],
            textInputAction: TextInputAction.next,
            validator: (v) {
              if (v == null || v.isEmpty) return null;
              final year = int.tryParse(v);
              if (year == null || year < 1800 || year > DateTime.now().year) {
                return 'Enter a valid year';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          // GSTIN (optional)
          TextFormField(
            controller: _gstinCtrl,
            decoration: _inputDecoration('GSTIN (optional)'),
            textCapitalization: TextCapitalization.characters,
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 16),

          // Description (min 50, max 500)
          TextFormField(
            controller: _descriptionCtrl,
            decoration: _inputDecoration('Brand Description').copyWith(
              counterText:
                  '${_descriptionCtrl.text.length}/500',
              helperText: 'Min 50 characters',
            ),
            maxLines: 4,
            maxLength: 500,
            textInputAction: TextInputAction.newline,
            onChanged: (_) => setState(() {}),
            validator: (v) {
              if (v == null || v.trim().isEmpty) {
                return 'Description is required';
              }
              if (v.trim().length < 50) {
                return 'Description must be at least 50 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 8),

          // Brand socials (expandable)
          _buildSocialsSection(),

          StepNavigationButtons(
            currentStep: _currentStep,
            totalSteps: 5,
            onNext: _onNext,
            onBack: _onBack,
          ),
        ],
      ),
    );
  }

  Widget _buildSocialsSection() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: ExpansionTile(
        title: const Text('Brand Social Links (optional)'),
        initiallyExpanded: _socialsExpanded,
        onExpansionChanged: (v) => _socialsExpanded = v,
        childrenPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _socialField('Instagram', _igUrlCtrl, 'https://instagram.com/...'),
          _socialField('YouTube', _ytUrlCtrl, 'https://youtube.com/@...'),
          _socialField('Twitter / X', _twUrlCtrl, 'https://x.com/...'),
          _socialField('Facebook', _fbUrlCtrl, 'https://facebook.com/...'),
          _socialField('LinkedIn', _liUrlCtrl, 'https://linkedin.com/company/...'),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _socialField(
      String label, TextEditingController ctrl, String hint) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: ctrl,
        decoration: _inputDecoration(label, hint: hint),
        keyboardType: TextInputType.url,
        textInputAction: TextInputAction.next,
        validator: Validators.url,
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3 — Location & Audience
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Widget _buildStep3() {
    return Form(
      key: _formKeys[2],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Location'),
          const SizedBox(height: 4),

          // Country
          TextFormField(
            controller: _countryCtrl,
            decoration: _inputDecoration('Country'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'Country'),
          ),
          const SizedBox(height: 16),

          // State
          TextFormField(
            controller: _stateCtrl,
            decoration: _inputDecoration('State'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'State'),
          ),
          const SizedBox(height: 16),

          // City
          TextFormField(
            controller: _cityCtrl,
            decoration: _inputDecoration('City'),
            textInputAction: TextInputAction.next,
            validator: (v) => Validators.required(v, field: 'City'),
          ),
          const SizedBox(height: 16),

          // Pin code (optional)
          TextFormField(
            controller: _pinCodeCtrl,
            decoration: _inputDecoration('Pin Code (optional)'),
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(6),
            ],
            textInputAction: TextInputAction.done,
          ),

          const SizedBox(height: 24),
          _sectionTitle('Target Audience'),

          // Age groups
          _chipLabel('Age Groups'),
          ChipMultiSelect<String>(
            items: kAgeGroups,
            selected: _targetAgeGroups,
            labelBuilder: (e) => e,
            onChanged: (v) => setState(() => _targetAgeGroups = v),
          ),
          const SizedBox(height: 20),

          // Genders
          _chipLabel('Genders'),
          ChipMultiSelect<String>(
            items: kTargetGenders,
            selected: _targetGenders,
            labelBuilder: (e) => e,
            onChanged: (v) => setState(() => _targetGenders = v),
          ),
          const SizedBox(height: 20),

          // Target locations
          _chipLabel('Target Locations'),
          ChipMultiSelect<String>(
            items: kTargetLocations,
            selected: _targetLocations,
            labelBuilder: (e) => e,
            onChanged: (v) => setState(() => _targetLocations = v),
          ),
          const SizedBox(height: 20),

          // Income bracket (optional dropdown)
          DropdownButtonFormField<String>(
            initialValue: _targetIncomeBracket,
            decoration: _inputDecoration('Target Income Bracket (optional)'),
            items: kIncomeBrackets
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) => setState(() => _targetIncomeBracket = v),
          ),
          const SizedBox(height: 20),

          // Languages
          _chipLabel('Languages'),
          ChipMultiSelect<String>(
            items: kLanguages,
            selected: _targetLanguages,
            labelBuilder: (e) => e,
            onChanged: (v) => setState(() => _targetLanguages = v),
          ),

          StepNavigationButtons(
            currentStep: _currentStep,
            totalSteps: 5,
            onNext: _onNext,
            onBack: _onBack,
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4 — Campaign Preferences
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Widget _buildStep4() {
    return Form(
      key: _formKeys[3],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Campaign Preferences'),
          const SizedBox(height: 4),

          // Preferred platforms
          _chipLabel('Preferred Platforms'),
          ChipMultiSelect<SocialPlatform>(
            items: SocialPlatform.values,
            selected: _preferredPlatforms,
            labelBuilder: (e) => e.label,
            onChanged: (v) => setState(() => _preferredPlatforms = v),
          ),
          const SizedBox(height: 20),

          // Content types needed
          _chipLabel('Content Types Needed'),
          ChipMultiSelect<ContentType>(
            items: ContentType.values,
            selected: _contentTypesNeeded,
            labelBuilder: (e) => e.label,
            onChanged: (v) => setState(() => _contentTypesNeeded = v),
          ),
          const SizedBox(height: 20),

          // Budget range
          DropdownButtonFormField<BudgetRange>(
            initialValue: _budgetRange,
            decoration: _inputDecoration('Budget Range'),
            items: BudgetRange.values
                .map((e) => DropdownMenuItem(value: e, child: Text(e.label)))
                .toList(),
            onChanged: (v) => setState(() => _budgetRange = v),
            validator: (v) => v == null ? 'Please select a budget range' : null,
          ),
          const SizedBox(height: 20),

          // Payment types
          _chipLabel('Payment Types'),
          ChipMultiSelect<PaymentType>(
            items: PaymentType.values,
            selected: _paymentTypes,
            labelBuilder: (e) => e.label,
            onChanged: (v) => setState(() => _paymentTypes = v),
          ),
          const SizedBox(height: 20),

          // Payment timeline
          DropdownButtonFormField<PaymentTimeline>(
            initialValue: _paymentTimeline,
            decoration: _inputDecoration('Payment Timeline'),
            items: PaymentTimeline.values
                .map((e) => DropdownMenuItem(value: e, child: Text(e.label)))
                .toList(),
            onChanged: (v) => setState(() => _paymentTimeline = v),
            validator: (v) =>
                v == null ? 'Please select a payment timeline' : null,
          ),
          const SizedBox(height: 20),

          // Campaigns per month (optional)
          DropdownButtonFormField<String>(
            initialValue: _campaignsPerMonth,
            decoration: _inputDecoration('Campaigns Per Month (optional)'),
            items: kCampaignsPerMonth
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) => setState(() => _campaignsPerMonth = v),
          ),
          const SizedBox(height: 20),

          // Preferred follower range
          _chipLabel('Preferred Follower Range'),
          ChipMultiSelect<FollowerRange>(
            items: FollowerRange.values,
            selected: _preferredFollowerRange,
            labelBuilder: (e) => e.label,
            onChanged: (v) => setState(() => _preferredFollowerRange = v),
          ),
          const SizedBox(height: 20),

          // Preferred creator categories (max 5)
          _chipLabel('Preferred Creator Categories (max 5)'),
          ChipMultiSelect<CreatorCategory>(
            items: CreatorCategory.values,
            selected: _preferredCreatorCategories,
            labelBuilder: (e) => e.label,
            maxSelections: 5,
            onChanged: (v) => setState(() => _preferredCreatorCategories = v),
          ),

          StepNavigationButtons(
            currentStep: _currentStep,
            totalSteps: 5,
            onNext: _onNext,
            onBack: _onBack,
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 5 — Review & Terms
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Widget _buildStep5() {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Form(
      key: _formKeys[4],
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          _sectionTitle('Review Your Information'),

          // Summary card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: cs.outlineVariant),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _reviewSection('Account Manager', {
                    'Name': _fullNameCtrl.text,
                    'Email': _workEmailCtrl.text,
                    'Phone': _phoneCtrl.text,
                    'Designation': _designationCtrl.text,
                    if (_linkedinUrlCtrl.text.trim().isNotEmpty)
                      'LinkedIn': _linkedinUrlCtrl.text,
                  }),
                  const Divider(height: 24),
                  _reviewSection('Brand Details', {
                    'Brand': _brandNameCtrl.text,
                    'Legal Name': _companyLegalNameCtrl.text,
                    'Website': _websiteCtrl.text,
                    'Industry': _industry?.label ?? '-',
                    'Company Size': _companySize?.label ?? '-',
                    if (_yearFoundedCtrl.text.trim().isNotEmpty)
                      'Year Founded': _yearFoundedCtrl.text,
                    if (_gstinCtrl.text.trim().isNotEmpty)
                      'GSTIN': _gstinCtrl.text,
                  }),
                  const Divider(height: 24),
                  _reviewSection('Location', {
                    'Country': _countryCtrl.text,
                    'State': _stateCtrl.text,
                    'City': _cityCtrl.text,
                    if (_pinCodeCtrl.text.trim().isNotEmpty)
                      'Pin Code': _pinCodeCtrl.text,
                  }),
                  const Divider(height: 24),
                  _reviewChips('Target Audience', {
                    'Age Groups': _targetAgeGroups.toList(),
                    'Genders': _targetGenders.toList(),
                    'Locations': _targetLocations.toList(),
                    'Languages': _targetLanguages.toList(),
                    if (_targetIncomeBracket != null)
                      'Income Bracket': [_targetIncomeBracket!],
                  }),
                  const Divider(height: 24),
                  _reviewChips('Campaign Preferences', {
                    'Platforms':
                        _preferredPlatforms.map((e) => e.label).toList(),
                    'Content Types':
                        _contentTypesNeeded.map((e) => e.label).toList(),
                    'Budget': [_budgetRange?.label ?? '-'],
                    'Payment Types':
                        _paymentTypes.map((e) => e.label).toList(),
                    'Payment Timeline': [_paymentTimeline?.label ?? '-'],
                    if (_campaignsPerMonth != null)
                      'Campaigns/Month': [_campaignsPerMonth!],
                    'Follower Range':
                        _preferredFollowerRange.map((e) => e.label).toList(),
                    'Creator Categories':
                        _preferredCreatorCategories.map((e) => e.label).toList(),
                  }),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          Text('Agreements',
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),

          _requiredCheckbox(
            'I agree to the Terms of Service *',
            _termsOfService,
            (v) => setState(() => _termsOfService = v ?? false),
          ),
          _requiredCheckbox(
            'I agree to follow Brand Guidelines *',
            _brandGuidelines,
            (v) => setState(() => _brandGuidelines = v ?? false),
          ),
          _requiredCheckbox(
            'I agree to the Payment Terms *',
            _paymentTerms,
            (v) => setState(() => _paymentTerms = v ?? false),
          ),
          _requiredCheckbox(
            'I confirm the accuracy of all data provided *',
            _dataAccuracy,
            (v) => setState(() => _dataAccuracy = v ?? false),
          ),
          _requiredCheckbox(
            'I agree to the Creator Communication Policy *',
            _creatorCommunicationPolicy,
            (v) => setState(() => _creatorCommunicationPolicy = v ?? false),
          ),

          const Divider(height: 16),

          CheckboxListTile(
            value: _marketingEmails,
            onChanged: (v) => setState(() => _marketingEmails = v ?? false),
            title: Text('I would like to receive marketing emails',
                style: tt.bodyMedium),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            dense: true,
          ),

          StepNavigationButtons(
            currentStep: _currentStep,
            totalSteps: 5,
            onNext: _onNext,
            onBack: _onBack,
            isSubmitting: _isSubmitting,
            submitLabel: 'Create Account',
          ),
        ],
      ),
    );
  }

  Widget _requiredCheckbox(
      String label, bool value, ValueChanged<bool?> onChanged) {
    final tt = Theme.of(context).textTheme;
    return CheckboxListTile(
      value: value,
      onChanged: onChanged,
      title: Text(label, style: tt.bodyMedium),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }

  Widget _reviewSection(String title, Map<String, String> entries) {
    final tt = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: tt.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        ...entries.entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 120,
                    child: Text('${e.key}:',
                        style: tt.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  ),
                  Expanded(
                    child: Text(e.value, style: tt.bodySmall),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _reviewChips(String title, Map<String, List<String>> entries) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: tt.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        ...entries.entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${e.key}:',
                      style: tt.bodySmall
                          ?.copyWith(color: cs.onSurfaceVariant)),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: e.value
                        .map((v) => Chip(
                              label: Text(v, style: const TextStyle(fontSize: 12)),
                              visualDensity: VisualDensity.compact,
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              padding: EdgeInsets.zero,
                              labelPadding:
                                  const EdgeInsets.symmetric(horizontal: 8),
                            ))
                        .toList(),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}
