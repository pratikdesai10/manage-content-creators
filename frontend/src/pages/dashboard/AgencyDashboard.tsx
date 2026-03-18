import { useState, useEffect, useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  getAgencyProfiles,
  getAgencyStats,
  getAgencyCampaigns,
  getAgencyMessages,
  getAgencyCampaignDetail,
  getAgencyMessageThread,
  getAgencyTopCreators,
  type AgencyCampaign,
  type AgencyMessage,
  type MessageThreadEntry,
} from '../../api/endpoints';
import type { AgencyProfile } from '../../types';
import {
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  BUDGET_RANGE_LABELS,
  PLATFORM_LABELS,
} from '../../types/agency.types';

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

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  ACTIVE: 'bg-blue-500/10 text-blue-400',
  PENDING: 'bg-amber-500/10 text-amber-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

const COLLAB_TYPE_LABEL: Record<string, string> = {
  PAID_CAMPAIGNS: 'Paid Campaign',
  PRODUCT_EXCHANGE: 'Product Exchange',
  AFFILIATE: 'Affiliate',
  BRAND_AMBASSADOR: 'Brand Ambassador',
  EVENT_APPEARANCES: 'Event',
  HYBRID: 'Hybrid',
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatCurrency(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

type ActivePanel = { type: 'campaign'; id: string } | null;
type ActiveChat = { messageId: string } | null;

// ── Sparkline ─────────────────────────────────────────────────────────────────

const SPARKLINE_SEEDS: Record<string, number[]> = {
  'Active Campaigns':   [3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 8, 7, 9, 8],
  'Creators Contacted': [8, 12, 15, 18, 22, 25, 28, 30, 34, 36, 38, 40, 41, 42],
  'Total Spend':        [50, 80, 120, 180, 250, 340, 420, 510, 620, 740, 850, 960, 1100, 1250],
  'Messages':           [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 14, 15],
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const gradientId = useId();
  const max = Math.max(...data, 1);
  const width = 80;
  const height = 28;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - (v / max) * height}`)
    .join(' ');
  const area = `M0,${height} ` + data.map((v, i) => `L${i * step},${height - (v / max) * height}`).join(' ') + ` L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={(data.length - 1) * step}
        cy={height - (data[data.length - 1] / max) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

const STAT_META: Record<string, { color: string; change: number; period: string; icon: string }> = {
  'Active Campaigns':   { color: '#059669', change: 14.3, period: 'last 30 days', icon: '📋' },
  'Creators Contacted': { color: '#7C3AED', change: 23.5, period: 'last 30 days', icon: '👥' },
  'Total Spend':        { color: '#0284C7', change: 18.2, period: 'last 30 days', icon: '💰' },
  'Messages':           { color: '#EA580C', change: 25.0, period: 'last 30 days', icon: '💬' },
};

function AgencyStatCard({
  label,
  value,
  displayValue,
  sidePanelOpen,
  badge,
}: {
  label: string;
  value: number | undefined;
  displayValue?: string;
  sidePanelOpen: boolean;
  badge?: string;
}) {
  const meta = STAT_META[label] ?? { color: '#6B7280', change: 0, period: 'last 30 days', icon: '📊' };
  const sparkData = SPARKLINE_SEEDS[label] ?? [1, 1, 1, 1, 1, 1, 1];
  const isPositive = meta.change >= 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
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

      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white leading-none tabular-nums">
            {displayValue ?? (value !== undefined ? value.toLocaleString('en-IN') : '—')}
          </p>
          {badge && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">{meta.period}</p>
      </div>

      {!sidePanelOpen && (
        <div className="pt-1">
          <Sparkline data={sparkData} color={meta.color} />
        </div>
      )}
    </div>
  );
}

// ── Budget Overview ───────────────────────────────────────────────────────────

const BUDGET_COLORS: Record<string, string> = {
  PAID_CAMPAIGNS: '#7C3AED',
  BRAND_AMBASSADOR: '#059669',
  PRODUCT_EXCHANGE: '#0284C7',
  AFFILIATE: '#EA580C',
  EVENT_APPEARANCES: '#E1306C',
  HYBRID: '#6B7280',
};

function BudgetOverview({ breakdown }: { breakdown: { type: string; amount: number }[] | undefined }) {
  if (!breakdown?.length) return null;
  const maxAmount = Math.max(...breakdown.map((b) => b.amount), 1);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Budget Overview</h2>
      <div className="flex flex-col gap-3">
        {breakdown.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <span className="w-28 text-xs text-gray-400 font-medium truncate">
              {COLLAB_TYPE_LABEL[item.type] ?? item.type}
            </span>
            <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.amount / maxAmount) * 100}%`,
                  backgroundColor: BUDGET_COLORS[item.type] ?? '#6B7280',
                }}
              />
            </div>
            <span className="w-14 text-xs text-gray-400 text-right font-semibold">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Campaigns List ────────────────────────────────────────────────────────────

function CampaignsList({
  campaigns,
  selectedId,
  onSelect,
}: {
  campaigns: AgencyCampaign[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Campaigns</h2>
      {campaigns?.length ? (
        <div className="flex flex-col">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-white/5 last:border-0 transition w-full text-left ${
                selectedId === c.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                  {c.creatorName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.creatorName}</p>
                  <p className="text-xs text-gray-500 truncate">{COLLAB_TYPE_LABEL[c.type] ?? c.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLOR[c.status] ?? 'bg-white/10 text-gray-300'}`}>
                  {c.status}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No campaigns yet</p>
      )}
    </div>
  );
}

// ── Agency Messages List ──────────────────────────────────────────────────────

function AgencyMessagesList({
  messages,
  selectedId,
  onSelect,
}: {
  messages: AgencyMessage[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Messages</h2>
      {messages?.length ? (
        <div className="flex flex-col">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg cursor-pointer border-b border-white/5 last:border-0 transition w-full text-left ${
                selectedId === m.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
                    {m.creatorName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {!m.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050510]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.creatorName}</p>
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

// ── Top Creators List ─────────────────────────────────────────────────────────

function TopCreatorsList({ agencyId }: { agencyId: string }) {
  const { data: creators } = useQuery({
    queryKey: ['agencyTopCreators', agencyId],
    queryFn: () => getAgencyTopCreators(agencyId),
    enabled: !!agencyId,
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Creators</h2>
      {creators?.length ? (
        <div className="flex flex-col gap-3">
          {creators.map((c) => {
            const platformColor = PLATFORM_COLORS[c.platform] ?? '#6B7280';
            return (
              <div key={c.id} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
                  {c.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white"
                      style={{ backgroundColor: platformColor }}
                    >
                      {PLATFORM_LABELS[c.platform as keyof typeof PLATFORM_LABELS] ?? c.platform}
                    </span>
                    <span className="text-xs text-gray-500">{formatFollowers(c.followers)} followers</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{c.engagementRate}%</p>
                  <p className="text-xs text-gray-400">engagement</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No creators yet</p>
      )}
    </div>
  );
}

// ── Campaign Detail Panel ─────────────────────────────────────────────────────

function CampaignDetailPanel({
  agencyId,
  campaignId,
  onClose,
}: {
  agencyId: string;
  campaignId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['agencyCampaignDetail', campaignId],
    queryFn: () => getAgencyCampaignDetail(agencyId, campaignId),
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
            {data?.creatorName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{data?.creatorName ?? '...'}</p>
            <p className="text-xs text-gray-500">{data ? (COLLAB_TYPE_LABEL[data.type] ?? data.type) : ''}</p>
          </div>
          {data && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[data.status] ?? 'bg-white/10 text-gray-300'}`}>
              {data.status}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300 text-lg leading-none flex-shrink-0 ml-2" aria-label="Close panel">x</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
      ) : data ? (
        <>
          {data.brief && (
            <div className="bg-white/[0.03] rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brief</p>
              <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{data.brief}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {data.deliverables && data.deliverables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deliverables</p>
                <ul className="flex flex-col gap-1">
                  {data.deliverables.map((d, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {data.timeline && (
                <div className="bg-white/[0.03] rounded-lg p-2.5">
                  <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
                  <p className="text-xs font-medium text-white">{data.timeline}</p>
                </div>
              )}
              {data.budget && (
                <div className="bg-white/[0.03] rounded-lg p-2.5">
                  <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                  <p className="text-xs font-semibold text-white">{data.budget}</p>
                </div>
              )}
              {(data.contactPerson || data.contactEmail) && (
                <div className="bg-indigo-500/10 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-indigo-400 mb-0.5">Contact</p>
                  {data.contactPerson && <p className="text-xs text-white font-medium">{data.contactPerson}</p>}
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

// ── Agency Chat Panel ─────────────────────────────────────────────────────────

function AgencyChatPanel({
  agencyId,
  messageId,
  onClose,
}: {
  agencyId: string;
  messageId: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['agencyMessageThread', messageId],
    queryFn: () => getAgencyMessageThread(agencyId, messageId),
  });

  useEffect(() => {
    if (data?.threads?.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.threads?.length]);

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMessage: MessageThreadEntry = {
      id: `local-${Date.now()}`,
      sender: 'BRAND',
      text: draft.trim(),
      sentAt: new Date().toISOString(),
    };
    if (data) {
      data.threads = [...data.threads, newMessage];
    }
    setDraft('');
    toast.success('Message sent');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#0a0a1a]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
            {data?.creatorName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className="text-sm font-semibold text-white">{data?.creatorName ?? '...'}</p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-gray-300 transition text-base leading-none"
          aria-label="Close chat"
        >x</button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-xs text-gray-400 text-center py-6">Loading...</p>
        ) : data?.threads?.length ? (
          <>
            {data.threads.map((entry) => (
              <div
                key={entry.id}
                className={`flex flex-col max-w-[85%] ${entry.sender === 'BRAND' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    entry.sender === 'BRAND'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'
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

      <div className="px-3 py-2.5 border-t border-white/10 flex gap-2 rounded-b-2xl">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a reply..."
          className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/30"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-xl hover:from-indigo-600 hover:to-purple-700 transition font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── Agency Profile Card ───────────────────────────────────────────────────────

function AgencyProfileCard({ profile, userEmail }: { profile: AgencyProfile; userEmail: string | undefined }) {
  const initials = profile.brandName
    ? profile.brandName[0].toUpperCase()
    : userEmail?.[0]?.toUpperCase() ?? '?';

  const industryLabel = INDUSTRY_LABELS[profile.industry as keyof typeof INDUSTRY_LABELS] ?? profile.industry;
  const sizeLabel = COMPANY_SIZE_LABELS[profile.companySize as keyof typeof COMPANY_SIZE_LABELS] ?? profile.companySize;
  const budgetLabel = profile.campaignPreferences?.budgetRange
    ? BUDGET_RANGE_LABELS[profile.campaignPreferences.budgetRange as keyof typeof BUDGET_RANGE_LABELS] ?? profile.campaignPreferences.budgetRange
    : null;
  const platforms = profile.campaignPreferences?.platforms ?? [];

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        {profile.logoUrl ? (
          <img src={profile.logoUrl} alt={profile.brandName} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
        )}
        <div className="text-center">
          <p className="font-bold text-white text-lg">{profile.brandName}</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
              {industryLabel}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300 font-medium">
              {sizeLabel} employees
            </span>
          </div>
        </div>
      </div>

      <hr className="border-white/10" />

      {profile.description && (
        <p className="text-sm text-gray-400 line-clamp-3">{profile.description}</p>
      )}

      {profile.contact && (
        <>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
            <p className="text-sm font-medium text-white">{profile.contact.contactPersonName}</p>
            <p className="text-xs text-gray-500">{profile.contact.designation}</p>
            <p className="text-xs text-gray-500 truncate">{profile.contact.contactEmail}</p>
          </div>
        </>
      )}

      {platforms.length > 0 && (
        <>
          <hr className="border-white/10" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Platforms</p>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: PLATFORM_COLORS[p] ?? '#6B7280' }}
                >
                  {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] ?? p}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {budgetLabel && (
        <>
          <hr className="border-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Budget</span>
            <span className="text-xs font-semibold text-white">{budgetLabel}</span>
          </div>
        </>
      )}

      <hr className="border-white/10" />
      <Link
        to="/dashboard/agency/edit-profile"
        className="w-full py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all text-center block"
      >
        Edit Profile
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AgencyDashboard() {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['agencyProfiles'],
    queryFn: getAgencyProfiles,
    enabled: !!user,
  });

  const profile = profiles?.find((p) => p.user?.id === user?.id);
  const agencyId = profile?.id;

  const { data: stats } = useQuery({
    queryKey: ['agencyStats', agencyId],
    queryFn: () => getAgencyStats(agencyId!),
    enabled: !!agencyId,
  });

  const { data: campaigns } = useQuery({
    queryKey: ['agencyCampaigns', agencyId],
    queryFn: () => getAgencyCampaigns(agencyId!),
    enabled: !!agencyId,
  });

  const { data: messages } = useQuery({
    queryKey: ['agencyMessages', agencyId],
    queryFn: () => getAgencyMessages(agencyId!),
    enabled: !!agencyId,
  });

  const sidePanelOpen = activePanel !== null;
  const selectedCampaignId = activePanel?.type === 'campaign' ? activePanel.id : null;

  function openPanel(id: string) {
    setActivePanel((prev) =>
      prev?.type === 'campaign' && prev.id === id ? null : { type: 'campaign', id }
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
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">Loading profile...</p>
            </div>
          ) : profile ? (
            <AgencyProfileCard profile={profile} userEmail={user?.email} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">No agency profile found.</p>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <div className={`flex-1 min-w-0 transition-all duration-200 ${activeChat && !sidePanelOpen ? 'pr-[340px]' : ''}`}>
          <div className={`${sidePanelOpen ? 'grid grid-cols-2 gap-4 items-start' : 'flex flex-col gap-6'}`}>
            {/* Left column — main content */}
            <div className="flex flex-col gap-6">
              <div className={`grid gap-4 ${sidePanelOpen ? 'grid-cols-2' : 'grid-cols-4'}`}>
                <AgencyStatCard label="Active Campaigns" value={stats?.activeCampaigns} sidePanelOpen={sidePanelOpen} />
                <AgencyStatCard label="Creators Contacted" value={stats?.creatorsContacted} sidePanelOpen={sidePanelOpen} />
                <AgencyStatCard
                  label="Total Spend"
                  value={stats?.totalSpend}
                  displayValue={stats?.totalSpend !== undefined ? `₹${formatCurrency(stats.totalSpend)}` : undefined}
                  sidePanelOpen={sidePanelOpen}
                />
                <AgencyStatCard
                  label="Messages"
                  value={stats?.messageCount}
                  sidePanelOpen={sidePanelOpen}
                  badge={stats?.unreadMessages ? `${stats.unreadMessages} unread` : undefined}
                />
              </div>

              <BudgetOverview breakdown={stats?.budgetBreakdown} />

              <div className={`grid gap-4 ${sidePanelOpen ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <CampaignsList
                  campaigns={campaigns}
                  selectedId={selectedCampaignId}
                  onSelect={openPanel}
                />
                <AgencyMessagesList
                  messages={messages}
                  selectedId={activeChat?.messageId ?? null}
                  onSelect={openChat}
                />
              </div>

              {agencyId && <TopCreatorsList agencyId={agencyId} />}
            </div>

            {/* Right column — campaign detail panel */}
            {sidePanelOpen && agencyId && (
              <div className="sticky top-6">
                <CampaignDetailPanel
                  agencyId={agencyId}
                  campaignId={activePanel.id}
                  onClose={() => setActivePanel(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating chat widget */}
      {activeChat && agencyId && (
        <AgencyChatPanel
          agencyId={agencyId}
          messageId={activeChat.messageId}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
