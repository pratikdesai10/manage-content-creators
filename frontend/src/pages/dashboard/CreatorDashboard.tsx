import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import {
  getCreatorProfiles,
  getCreatorStats,
  getRecentCollaborations,
  getRecentMessages,
  getCollaborationDetail,
  getMessageThread,
  getSocialAccountDetail,
  type Collaboration,
  type DashboardMessage,
} from '../../api/endpoints';
import type { CreatorProfile, SocialAccount } from '../../types';
import { AVAILABILITY_LABELS, RATE_RANGE_LABELS } from '../../types/creator.types';

// ── helpers ───────────────────────────────────────────────────────────────────

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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

type ActivePanel = { type: 'collab'; id: string } | { type: 'social'; id: string } | null;
type ActiveChat = { messageId: string } | null;

// ── Stat Card (Instagram-style insight card with sparkline) ───────────────────

const SPARKLINE_SEEDS: Record<string, number[]> = {
  'Profile Views':    [62, 45, 78, 91, 55, 83, 110, 97, 120, 88, 134, 115, 142, 128],
  'Collaborations':  [0, 1, 0, 1, 1, 0, 2, 1, 1, 2, 1, 2, 3, 2],
  'Messages':        [1, 0, 2, 1, 3, 2, 1, 3, 2, 4, 3, 2, 4, 3],
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const width = 80;
  const height = 28;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - (v / max) * height}`)
    .join(' ');
  // filled area path
  const area = `M0,${height} ` + data.map((v, i) => `L${i * step},${height - (v / max) * height}`).join(' ') + ` L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* last dot */}
      <circle
        cx={(data.length - 1) * step}
        cy={height - (data[data.length - 1] / max) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

const STAT_META: Record<string, { color: string; change: number; period: string; icon: string }> = {
  'Profile Views':   { color: '#7C3AED', change: 18.4, period: 'last 30 days', icon: '👁' },
  'Collaborations':  { color: '#059669', change: 33.3, period: 'last 30 days', icon: '🤝' },
  'Messages':        { color: '#0284C7', change: 50.0, period: 'last 30 days', icon: '💬' },
};

function StatCard({ label, value, sidePanelOpen }: { label: string; value: number | undefined; sidePanelOpen: boolean }) {
  const meta = STAT_META[label] ?? { color: '#6B7280', change: 0, period: 'last 30 days', icon: '📊' };
  const sparkData = SPARKLINE_SEEDS[label] ?? [1, 1, 1, 1, 1, 1, 1];
  const isPositive = meta.change >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      {/* Top row: label + change badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{meta.icon}</span>
          <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
        </div>
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: isPositive ? `${meta.color}15` : '#FEE2E215',
            color: isPositive ? meta.color : '#DC2626',
          }}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(meta.change)}%
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">
          {value !== undefined ? value.toLocaleString('en-IN') : '—'}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{meta.period}</p>
      </div>

      {/* Sparkline — hidden when panel open to save space */}
      {!sidePanelOpen && (
        <div className="pt-1">
          <Sparkline data={sparkData} color={meta.color} />
        </div>
      )}
    </div>
  );
}

// ── Collaboration Detail Panel (compact horizontal layout) ───────────────────

function CollabDetailPanel({
  creatorId,
  collabId,
  onClose,
}: {
  creatorId: string;
  collabId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['collabDetail', collabId],
    queryFn: () => getCollaborationDetail(creatorId, collabId),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
            {data?.brandName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{data?.brandName ?? '…'}</p>
            <p className="text-xs text-gray-500">{data ? (COLLAB_TYPE_LABEL[data.type] ?? data.type) : ''}</p>
          </div>
          {data && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[data.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {data.status}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 ml-2" aria-label="Close panel">×</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
      ) : data ? (
        <>
          {/* Brief */}
          {data.brief && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brief</p>
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{data.brief}</p>
            </div>
          )}

          {/* Two-column: deliverables + timeline/budget */}
          <div className="grid grid-cols-2 gap-3">
            {data.deliverables && data.deliverables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deliverables</p>
                <ul className="flex flex-col gap-1">
                  {data.deliverables.map((d, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {data.timeline && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
                  <p className="text-xs font-medium text-gray-800">{data.timeline}</p>
                </div>
              )}
              {data.budget && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                  <p className="text-xs font-semibold text-gray-800">{data.budget}</p>
                </div>
              )}
              {(data.contactPerson || data.contactEmail) && (
                <div className="bg-purple-50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-purple-700 mb-0.5">Contact</p>
                  {data.contactPerson && <p className="text-xs text-gray-800 font-medium">{data.contactPerson}</p>}
                  {data.contactEmail && <p className="text-xs text-gray-500 truncate">{data.contactEmail}</p>}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">Could not load details.</p>
      )}
    </div>
  );
}

// ── Chat Panel (fixed bottom-right widget) ───────────────────────────────────

function ChatPanel({
  creatorId,
  messageId,
  onClose,
}: {
  creatorId: string;
  messageId: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messageThread', messageId],
    queryFn: () => getMessageThread(creatorId, messageId),
  });

  useEffect(() => {
    if (data?.threads?.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.threads]);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
            {data?.brandName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className="text-sm font-semibold text-gray-800">{data?.brandName ?? '…'}</p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition text-base leading-none"
          aria-label="Close chat"
        >×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-xs text-gray-400 text-center py-6">Loading…</p>
        ) : data?.threads?.length ? (
          <>
            {data.threads.map((entry) => (
              <div
                key={entry.id}
                className={`flex flex-col max-w-[85%] ${entry.sender === 'CREATOR' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    entry.sender === 'CREATOR'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {entry.text}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 px-1">{formatTime(entry.sentAt)}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">No messages yet.</p>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-gray-100 flex gap-2 rounded-b-2xl">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a reply…"
          className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
          onKeyDown={(e) => e.key === 'Enter' && setDraft('')}
          aria-label="Message input"
        />
        <button
          onClick={() => setDraft('')}
          className="px-3 py-2 bg-purple-600 text-white text-xs rounded-xl hover:bg-purple-700 transition font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── Social Detail Panel ───────────────────────────────────────────────────────

function SocialDetailPanel({
  creatorId,
  accountId,
  onClose,
}: {
  creatorId: string;
  accountId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['socialDetail', accountId],
    queryFn: () => getSocialAccountDetail(creatorId, accountId),
  });

  const platformColor = data ? PLATFORM_COLORS[data.platform] ?? '#6B7280' : '#6B7280';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: platformColor }}
          >
            {data?.platform[0] ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{data?.platform ?? '…'}</p>
            <p className="text-xs text-gray-500">@{data?.handle ?? ''}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0" aria-label="Close panel">×</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
      ) : data ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Followers</p>
            <p className="text-base font-bold text-gray-900">{formatFollowers(data.followerCount)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Engagement</p>
            <p className="text-base font-bold text-gray-900">{data.engagementRate}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Avg Likes</p>
            <p className="text-base font-bold text-gray-900">{formatFollowers(data.avgLikes)}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${(data.growthPercent ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs text-gray-500 mb-0.5">Growth</p>
            <p className={`text-base font-bold ${(data.growthPercent ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {(data.growthPercent ?? 0) >= 0 ? '+' : ''}{data.growthPercent ?? 0}%
            </p>
          </div>
          {data.topContentType && (
            <div className="col-span-2 bg-purple-50 rounded-lg p-2.5">
              <p className="text-xs text-purple-600 font-semibold mb-0.5">Top Content</p>
              <p className="text-xs font-medium text-gray-800">{data.topContentType}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">Could not load analytics.</p>
      )}
    </div>
  );
}

// ── Social Reach (clickable bars) ─────────────────────────────────────────────

function SocialReach({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts: SocialAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (accounts.length === 0) return null;
  const maxFollowers = Math.max(...accounts.map((a) => a.followerCount), 1);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Social Reach</h2>
      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelect(account.id)}
            className={`flex items-center gap-3 cursor-pointer rounded-lg p-2 -mx-2 transition w-full text-left ${
              selectedId === account.id ? 'bg-purple-50' : 'hover:bg-gray-50'
            }`}
          >
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
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Collaborations List (clickable rows) ──────────────────────────────────────

function CollaborationsList({
  collaborations,
  selectedId,
  onSelect,
}: {
  collaborations: Collaboration[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Collaborations</h2>
      {collaborations?.length ? (
        <div className="flex flex-col">
          {collaborations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-gray-50 last:border-0 transition w-full text-left ${
                selectedId === c.id ? 'bg-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                  {c.brandName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.brandName}</p>
                  <p className="text-xs text-gray-500 truncate">{COLLAB_TYPE_LABEL[c.type] ?? c.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {c.status}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No collaborations yet</p>
      )}
    </div>
  );
}

// ── Messages List (clickable rows) ────────────────────────────────────────────

function MessagesList({
  messages,
  selectedId,
  onSelect,
}: {
  messages: DashboardMessage[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Messages</h2>
      {messages?.length ? (
        <div className="flex flex-col">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-gray-50 last:border-0 transition w-full text-left ${
                selectedId === m.id ? 'bg-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {m.brandName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {!m.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.brandName}</p>
                  <p className="text-xs text-gray-500 truncate">{m.preview}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2 whitespace-nowrap">{formatDate(m.createdAt)}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
      )}
    </div>
  );
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, userEmail }: { profile: CreatorProfile; userEmail: string | undefined }) {
  const initials = profile.displayName
    ? profile.displayName[0].toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
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
      {profile.bio && <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>}
      {profile.niche && profile.niche.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.niche.map((cat) => (
            <span key={cat} className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 font-medium">
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
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
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);

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

  const sidePanelOpen = activePanel !== null;
  const selectedCollabId = activePanel?.type === 'collab' ? activePanel.id : null;
  const selectedSocialId = activePanel?.type === 'social' ? activePanel.id : null;

  function openPanel(type: NonNullable<ActivePanel>['type'], id: string) {
    setActivePanel((prev) =>
      prev?.type === type && prev.id === id ? null : { type, id }
    );
  }

  function openChat(messageId: string) {
    setActiveChat((prev) =>
      prev?.messageId === messageId ? null : { messageId }
    );
  }

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
            <ProfileCard profile={profile as CreatorProfile} userEmail={user?.email} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">No creator profile found.</p>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <div className={`flex-1 min-w-0 transition-all duration-200 ${activeChat && !sidePanelOpen ? 'pr-[340px]' : ''}`}>
          <div className={`${sidePanelOpen ? 'grid grid-cols-2 gap-4 items-start' : 'flex flex-col gap-6'}`}>
            {/* Left column — main content */}
            <div className="flex flex-col gap-6">
              <div className={`grid gap-4 ${sidePanelOpen ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <StatCard label="Profile Views" value={stats?.profileViews} sidePanelOpen={sidePanelOpen} />
                <StatCard label="Collaborations" value={stats?.collaborationCount} sidePanelOpen={sidePanelOpen} />
                <StatCard label="Messages" value={stats?.messageCount} sidePanelOpen={sidePanelOpen} />
              </div>

              <SocialReach
                accounts={socialAccounts}
                selectedId={selectedSocialId}
                onSelect={(id) => openPanel('social', id)}
              />
              <CollaborationsList
                collaborations={collaborations}
                selectedId={selectedCollabId}
                onSelect={(id) => openPanel('collab', id)}
              />
              <MessagesList
                messages={messages}
                selectedId={activeChat?.messageId ?? null}
                onSelect={openChat}
              />
            </div>

            {/* Right column — collab / social detail panel */}
            {sidePanelOpen && creatorId && (
              <div className="sticky top-6">
                {activePanel.type === 'collab' && (
                  <CollabDetailPanel
                    creatorId={creatorId}
                    collabId={activePanel.id}
                    onClose={() => setActivePanel(null)}
                  />
                )}
                {activePanel.type === 'social' && (
                  <SocialDetailPanel
                    creatorId={creatorId}
                    accountId={activePanel.id}
                    onClose={() => setActivePanel(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating chat widget — fixed bottom-right, independent of layout */}
      {activeChat && creatorId && (
        <ChatPanel
          creatorId={creatorId}
          messageId={activeChat.messageId}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
