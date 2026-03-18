import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCreatorProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import type { CreatorProfile } from '../../types';
import {
  CATEGORY_LABELS,
  PLATFORM_LABELS,
  RATE_RANGE_LABELS,
  AVAILABILITY_LABELS,
  COLLABORATION_TYPE_LABELS,
  CONTENT_TYPE_LABELS,
  TRAVEL_SCOPE_LABELS,
} from '../../types/creator.types';
import type { CreatorCategory, SocialPlatform } from '../../types/creator.types';

function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return count.toString();
}

export function CreatorPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: profile, isLoading, isError } = useQuery<CreatorProfile>({
    queryKey: ['creator', id],
    queryFn: () => getCreatorProfile(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400 mb-4">Creator profile not found.</p>
        <Link to="/creators" className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Link>
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();
  const isOwnProfile = profile.userId === user?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link to="/creators" className="text-gray-400 hover:text-white font-medium inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </Link>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.displayName}
                className="h-24 w-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
              <p className="text-gray-400 text-sm">@{profile.firstName} {profile.lastName}</p>

              {/* Categories */}
              {profile.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-medium"
                    >
                      {CATEGORY_LABELS[cat as CreatorCategory] ?? cat}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                {(profile.city || profile.state || profile.country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </span>
                )}

                {profile.availability && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    {AVAILABILITY_LABELS[profile.availability as keyof typeof AVAILABILITY_LABELS] ?? profile.availability}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio */}
      {profile.bio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
            <p className="text-gray-300 whitespace-pre-line">{profile.bio}</p>
          </div>
        </motion.div>
      )}

      {/* Social Accounts */}
      {profile.socialAccounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Social Accounts</h2>
            <div className="space-y-3">
              {profile.socialAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="font-medium text-white">
                        {PLATFORM_LABELS[account.platform as SocialPlatform] ?? account.platform}
                      </p>
                      <p className="text-sm text-gray-500">@{account.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatFollowerCount(account.followerCount)}</p>
                    <p className="text-xs text-gray-500">{account.engagementRate.toFixed(1)}% engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content & Collaboration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Content & Collaboration</h2>

          {profile.contentTypes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Content Types</h3>
              <div className="flex flex-wrap gap-2">
                {profile.contentTypes.map((ct) => (
                  <span key={ct} className="bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {CONTENT_TYPE_LABELS[ct as keyof typeof CONTENT_TYPE_LABELS] ?? ct}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.rateRange && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Rate Range</h3>
              <p className="text-white">{RATE_RANGE_LABELS[profile.rateRange as keyof typeof RATE_RANGE_LABELS] ?? profile.rateRange}</p>
            </div>
          )}

          {profile.collaborationTypes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Collaboration Types</h3>
              <div className="flex flex-wrap gap-2">
                {profile.collaborationTypes.map((ct) => (
                  <span key={ct} className="bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {COLLABORATION_TYPE_LABELS[ct as keyof typeof COLLABORATION_TYPE_LABELS] ?? ct}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Travel</h3>
            <p className="text-white">
              {profile.willingToTravel ? 'Willing to travel' : 'Not willing to travel'}
              {profile.willingToTravel && profile.travelScope && (
                <span className="text-gray-500"> — {TRAVEL_SCOPE_LABELS[profile.travelScope as keyof typeof TRAVEL_SCOPE_LABELS] ?? profile.travelScope}</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Info</h2>

          {profile.languages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Languages</h3>
              <p className="text-white">{profile.languages.join(', ')}</p>
            </div>
          )}

          {profile.previousCollaborations != null && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Previous Collaborations</h3>
              <p className="text-white">{profile.previousCollaborations}</p>
            </div>
          )}

          {profile.notableBrands.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Notable Brands</h3>
              <p className="text-white">{profile.notableBrands.join(', ')}</p>
            </div>
          )}

          {profile.portfolioUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Portfolio</h3>
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                {profile.portfolioUrl} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Profile Button */}
      {isOwnProfile && (
        <div className="flex justify-center">
          <Link
            to="/dashboard/creator/edit-profile"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25"
          >
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
}
