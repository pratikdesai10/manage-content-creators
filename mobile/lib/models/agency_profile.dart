import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'agency_profile.g.dart';

@JsonSerializable()
class AgencyProfile {
  final String id;
  final String userId;
  final String companyName;
  final String? description;
  final String? website;
  final String? location;
  final User user;

  const AgencyProfile({
    required this.id,
    required this.userId,
    required this.companyName,
    this.description,
    this.website,
    this.location,
    required this.user,
  });

  factory AgencyProfile.fromJson(Map<String, dynamic> json) =>
      _$AgencyProfileFromJson(json);
  Map<String, dynamic> toJson() => _$AgencyProfileToJson(this);
}
