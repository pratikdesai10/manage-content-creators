import 'package:json_annotation/json_annotation.dart';

part 'social_account.g.dart';

@JsonSerializable()
class SocialAccount {
  final String id;
  final String platform;
  final String handle;
  final int followersCount;
  final String creatorId;

  const SocialAccount({
    required this.id,
    required this.platform,
    required this.handle,
    required this.followersCount,
    required this.creatorId,
  });

  factory SocialAccount.fromJson(Map<String, dynamic> json) =>
      _$SocialAccountFromJson(json);
  Map<String, dynamic> toJson() => _$SocialAccountToJson(this);
}
