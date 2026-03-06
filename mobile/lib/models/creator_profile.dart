import 'package:json_annotation/json_annotation.dart';
import 'user.dart';
import 'social_account.dart';

part 'creator_profile.g.dart';

@JsonSerializable()
class CreatorProfile {
  final String id;
  final String userId;
  final String displayName;
  final String? bio;
  final List<String> niche;
  final String? location;
  final List<SocialAccount> socialAccounts;
  final User user;

  const CreatorProfile({
    required this.id,
    required this.userId,
    required this.displayName,
    this.bio,
    required this.niche,
    this.location,
    required this.socialAccounts,
    required this.user,
  });

  factory CreatorProfile.fromJson(Map<String, dynamic> json) =>
      _$CreatorProfileFromJson(json);
  Map<String, dynamic> toJson() => _$CreatorProfileToJson(this);
}
