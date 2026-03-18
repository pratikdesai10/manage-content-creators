import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Globe, ExternalLink, Building2, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAgencyProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import type { AgencyProfile } from '../../types';
import {
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  BUDGET_RANGE_LABELS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TIMELINE_LABELS,
  FOLLOWER_RANGE_LABELS,
  PLATFORM_LABELS,
  CONTENT_TYPE_LABELS,
} from '../../types/agency.types';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function labelFor(map: Record<string, string>, key: string): string {
  return map[key as keyof typeof map] ?? key;
}

export function AgencyPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<AgencyProfile>({
    queryKey: ['agency', id],
    queryFn: () => getAgencyProfile(id!),
    enabled: !!id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Error / not found
  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400 text-lg">Agency profile not found.</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = profile.userId === user?.id;
  const socials = profile.brandSocials
    ? Object.entries(profile.brandSocials).filter(([, url]) => url)
    : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm p-6 mb-6">
            <div className="flex items-start gap-5">
              {/* Logo / Initials */}
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.brandName}
                  className="h-20 w-20 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                  {getInitials(profile.brandName)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">{profile.brandName}</h1>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-400">
                    <Building2 className="h-3.5 w-3.5" />
                    {labelFor(INDUSTRY_LABELS, profile.industry)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                    <Users className="h-3.5 w-3.5" />
                    {labelFor(COMPANY_SIZE_LABELS, profile.companySize)} employees
                  </span>
                  {profile.yearFounded && (
                    <span className="text-xs text-gray-500">
                      Est. {profile.yearFounded}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city}, {profile.state}, {profile.country}
                  </span>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </motion.div>

        {/* Description */}
        {profile.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{profile.description}</p>
            </section>
          </motion.div>
        )}

        {/* Contact */}
        {profile.contact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
              <div className="grid gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Contact Person</span>
                  <p className="font-medium text-white">{profile.contact.contactPersonName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Designation</span>
                  <p className="font-medium text-white">{profile.contact.designation}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a
                    href={`mailto:${profile.contact.contactEmail}`}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {profile.contact.contactEmail}
                  </a>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* Target Audience */}
        {profile.targetAudience && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Target Audience</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.targetAudience.ageGroups.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Age Groups</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.targetAudience.ageGroups.map((ag) => (
                        <span key={ag} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.targetAudience.genders.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Genders</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.targetAudience.genders.map((g) => (
                        <span key={g} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.targetAudience.locations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Locations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.targetAudience.locations.map((l) => (
                        <span key={l} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.targetAudience.incomeBracket && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Income Bracket</p>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
                      {profile.targetAudience.incomeBracket}
                    </span>
                  </div>
                )}
                {profile.targetAudience.languages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.targetAudience.languages.map((lang) => (
                        <span key={lang} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* Campaign Preferences */}
        {profile.campaignPreferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Campaign Preferences</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.campaignPreferences.platforms.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Preferred Platforms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.campaignPreferences.platforms.map((p) => (
                        <span key={p} className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs text-indigo-400">
                          {labelFor(PLATFORM_LABELS, p)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.campaignPreferences.contentTypes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Content Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.campaignPreferences.contentTypes.map((ct) => (
                        <span key={ct} className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs text-indigo-400">
                          {labelFor(CONTENT_TYPE_LABELS, ct)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Budget Range</p>
                  <span className="text-sm text-white">
                    {labelFor(BUDGET_RANGE_LABELS, profile.campaignPreferences.budgetRange)}
                  </span>
                </div>
                {profile.campaignPreferences.paymentTypes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Payment Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.campaignPreferences.paymentTypes.map((pt) => (
                        <span key={pt} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                          {labelFor(PAYMENT_TYPE_LABELS, pt)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Payment Timeline</p>
                  <span className="text-sm text-white">
                    {labelFor(PAYMENT_TIMELINE_LABELS, profile.campaignPreferences.paymentTimeline)}
                  </span>
                </div>
                {profile.campaignPreferences.preferredFollowerRange.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Preferred Follower Ranges</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.campaignPreferences.preferredFollowerRange.map((fr) => (
                        <span key={fr} className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-400">
                          {labelFor(FOLLOWER_RANGE_LABELS, fr)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.campaignPreferences.preferredCreatorCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Preferred Creator Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.campaignPreferences.preferredCreatorCategories.map((cat) => (
                        <span key={cat} className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* Brand Socials */}
        {socials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Brand Socials</h2>
              <div className="flex flex-wrap gap-3">
                {socials.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors"
                  >
                    <span className="capitalize">{platform}</span>
                    <ExternalLink className="h-3 w-3 text-gray-500" />
                  </a>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* Edit Profile button (own profile only) */}
        {isOwnProfile && (
          <div className="flex justify-center mt-8">
            <Link
              to="/dashboard/agency/edit-profile"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
              Edit Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
