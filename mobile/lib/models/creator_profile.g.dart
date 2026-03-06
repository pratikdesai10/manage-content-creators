// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'creator_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreatorProfile _$CreatorProfileFromJson(Map<String, dynamic> json) =>
    CreatorProfile(
      id: json['id'] as String,
      userId: json['userId'] as String,
      displayName: json['displayName'] as String,
      bio: json['bio'] as String?,
      niche: (json['niche'] as List<dynamic>).map((e) => e as String).toList(),
      location: json['location'] as String?,
      socialAccounts: (json['socialAccounts'] as List<dynamic>)
          .map((e) => SocialAccount.fromJson(e as Map<String, dynamic>))
          .toList(),
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CreatorProfileToJson(CreatorProfile instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'displayName': instance.displayName,
      'bio': instance.bio,
      'niche': instance.niche,
      'location': instance.location,
      'socialAccounts': instance.socialAccounts,
      'user': instance.user,
    };
