import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import {
  getCreatorProfiles,
  getCreatorStats,
  getRecentCollaborations,
  getRecentMessages,
  type Collaboration,
  type DashboardMessage,
} from '../../api/endpoints';
import type { CreatorProfile, SocialAccount } from '../../types';
import { AVAILABILITY_LABELS, RATE_RANGE_LABELS } from '../../types/creator.types';

// ── helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  YOUTUBE: '#FF0000',
  TWITTER: '#1DA1F2',
  FACEBOOK: '#1877F2',
  TIKTOK: '#000000',
  LINKEDIN: '#0A66C2',
  BLOG: '#F97316',
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const COLLAB_TYPE_LABEL: Record<string, string> = {
  PAID_CAMPAIGNS: 'Paid Campaign',
  PRODUCT_EXCHANGE: 'Product Exchange',
  AFFILIATE: 'Affiliate',
  BRAND_AMBASSADOR: 'Brand Ambassador',
  EVENT_APPEARANCES: 'Event',
  HYBRID: 'Hybrid',
};

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number | undefined; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function SocialReach({ accounts }: { accounts: SocialAccount[] }) {
  if (accounts.length === 0) return null;
  const maxFollowers = Math.max(...accounts.map((a) => a.followerCount), 1);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Social Reach</h2>
      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-3">
            <span className="w-24 text-xs text-gray-600 font-medium truncate">{account.platform}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(account.followerCount / maxFollowers) * 100}%`,
                  backgroundColor: PLATFORM_COLORS[account.platform] ?? '#6B7280',
                }}
              />
            </div>
            <span className="w-12 text-xs text-gray-600 text-right font-semibold">
              {formatFollowers(account.followerCount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollaborationsList({ collaborations }: { collaborations: Collaboration[] | undefined }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Collaborations</h2>
      {collaborations?.length ? (
        <div className="flex flex-col">
          {collaborations.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                  {c.brandName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.brandName}</p>
                  <p className="text-xs text-gray-500">{COLLAB_TYPE_LABEL[c.type] ?? c.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {c.status}
                </span>
                <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No collaborations yet</p>
      )}
    </div>
  );
}

function MessagesList({ messages }: { messages: DashboardMessage[] | undefined }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Messages</h2>
      {messages?.length ? (
        <div className="flex flex-col">
          {messages.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {m.brandName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {!m.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.brandName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{m.preview}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{formatDate(m.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
      )}
    </div>
  );
}

// ── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({ profile, userEmail }: { profile: CreatorProfile; userEmail: string | undefined }) {
  const initials = profile.displayName
    ? profile.displayName[0].toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{profile.displayName}</p>
          <p className="text-sm text-gray-500">@{profile.displayName}</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Bio */}
      {profile.bio && <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>}

      {/* Niche / Categories */}
      {profile.niche && profile.niche.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.niche.map((cat) => (
            <span key={cat} className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 font-medium">
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {profile.location && (
        <>
          <hr className="border-gray-100" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Location</span>
            <span className="text-xs font-semibold text-gray-800">{profile.location}</span>
          </div>
        </>
      )}

      {(profile.availability || profile.rateRange) && (
        <>
          <hr className="border-gray-100" />
          {profile.availability && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Availability</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.availability === 'IMMEDIATELY' ? 'bg-green-100 text-green-700' : profile.availability === 'NOT_AVAILABLE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {AVAILABILITY_LABELS[profile.availability as keyof typeof AVAILABILITY_LABELS] ?? profile.availability}
              </span>
            </div>
          )}
          {profile.rateRange && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rate</span>
              <span className="text-xs font-semibold text-gray-800">
                {RATE_RANGE_LABELS[profile.rateRange as keyof typeof RATE_RANGE_LABELS] ?? profile.rateRange}
              </span>
            </div>
          )}
        </>
      )}

      <hr className="border-gray-100" />

      <button className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition">
        Edit Profile
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CreatorDashboard() {
  const { user } = useAuth();

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['creatorProfiles'],
    queryFn: getCreatorProfiles,
    enabled: !!user,
  });

  const profile = profiles?.find((p) => p.user?.id === user?.id);
  const creatorId = profile?.id;

  const { data: stats } = useQuery({
    queryKey: ['creatorStats', creatorId],
    queryFn: () => getCreatorStats(creatorId!),
    enabled: !!creatorId,
  });

  const { data: collaborations } = useQuery({
    queryKey: ['recentCollaborations', creatorId],
    queryFn: () => getRecentCollaborations(creatorId!),
    enabled: !!creatorId,
  });

  const { data: messages } = useQuery({
    queryKey: ['recentMessages', creatorId],
    queryFn: () => getRecentMessages(creatorId!),
    enabled: !!creatorId,
  });

  const socialAccounts = profile?.socialAccounts ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-72 flex-shrink-0">
          {profilesLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">Loading profile…</p>
            </div>
          ) : profile ? (
            <ProfileCard profile={profile as any} userEmail={user?.email} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">No creator profile found.</p>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Profile Views" value={stats?.profileViews} icon="👁" />
            <StatCard label="Collaborations" value={stats?.collaborationCount} icon="🤝" />
            <StatCard label="Messages" value={stats?.messageCount} icon="💬" />
          </div>

          <SocialReach accounts={socialAccounts} />
          <CollaborationsList collaborations={collaborations} />
          <MessagesList messages={messages} />
        </main>
      </div>
    </div>
  );
}
