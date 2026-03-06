class Validators {
  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    final emailRegex = RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) return 'Enter a valid email';
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    final phoneRegex = RegExp(r'^\+?[0-9]{7,15}$');
    if (!phoneRegex.hasMatch(value)) return 'Enter a valid phone number';
    return null;
  }

  static String? url(String? value) {
    if (value == null || value.isEmpty) return null; // optional
    final urlRegex = RegExp(
      r'^(https?://)([\w-]+(\.[\w-]+)+)(:[0-9]+)?(/[\w./?%&=@~:#-]*)?$',
    );
    if (!urlRegex.hasMatch(value)) return 'Enter a valid URL';
    return null;
  }

  static String? requiredUrl(String? value) {
    if (value == null || value.isEmpty) return 'URL is required';
    return url(value);
  }

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? minLength(String? value, int min) {
    if (value == null || value.length < min) {
      return 'Must be at least $min characters';
    }
    return null;
  }

  static String? maxLength(String? value, int max) {
    if (value != null && value.length > max) {
      return 'Must be at most $max characters';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Min 8 characters';
    if (!RegExp(r'[A-Z]').hasMatch(value)) return 'Must contain uppercase letter';
    if (!RegExp(r'[a-z]').hasMatch(value)) return 'Must contain lowercase letter';
    if (!RegExp(r'[0-9]').hasMatch(value)) return 'Must contain a number';
    if (!RegExp(r'[^a-zA-Z0-9]').hasMatch(value)) {
      return 'Must contain a special character';
    }
    return null;
  }

  static String? Function(String?) confirmPassword(String Function() getPassword) {
    return (String? value) {
      if (value == null || value.isEmpty) return 'Please confirm password';
      if (value != getPassword()) return 'Passwords do not match';
      return null;
    };
  }

  static String? displayName(String? value) {
    if (value == null || value.isEmpty) return 'Display name is required';
    if (value.length < 3) return 'Min 3 characters';
    if (value.length > 30) return 'Max 30 characters';
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
      return 'Alphanumeric and underscores only';
    }
    return null;
  }

  static String? name(String? value) {
    if (value == null || value.isEmpty) return 'This field is required';
    if (value.length < 2) return 'Min 2 characters';
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value)) return 'Letters only';
    return null;
  }

  static String? bio(String? value) {
    if (value == null || value.isEmpty) return 'Bio is required';
    if (value.length < 50) return 'Min 50 characters';
    if (value.length > 500) return 'Max 500 characters';
    return null;
  }

  static String? description(String? value) {
    if (value == null || value.isEmpty) return 'Description is required';
    if (value.length < 50) return 'Min 50 characters';
    if (value.length > 500) return 'Max 500 characters';
    return null;
  }
}
