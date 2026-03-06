// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'social_account.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SocialAccount _$SocialAccountFromJson(Map<String, dynamic> json) =>
    SocialAccount(
      id: json['id'] as String,
      platform: json['platform'] as String,
      handle: json['handle'] as String,
      followersCount: (json['followersCount'] as num).toInt(),
      creatorId: json['creatorId'] as String,
    );

Map<String, dynamic> _$SocialAccountToJson(SocialAccount instance) =>
    <String, dynamic>{
      'id': instance.id,
      'platform': instance.platform,
      'handle': instance.handle,
      'followersCount': instance.followersCount,
      'creatorId': instance.creatorId,
    };
