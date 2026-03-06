// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'agency_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AgencyProfile _$AgencyProfileFromJson(Map<String, dynamic> json) =>
    AgencyProfile(
      id: json['id'] as String,
      userId: json['userId'] as String,
      companyName: json['companyName'] as String,
      description: json['description'] as String?,
      website: json['website'] as String?,
      location: json['location'] as String?,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AgencyProfileToJson(AgencyProfile instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'companyName': instance.companyName,
      'description': instance.description,
      'website': instance.website,
      'location': instance.location,
      'user': instance.user,
    };
