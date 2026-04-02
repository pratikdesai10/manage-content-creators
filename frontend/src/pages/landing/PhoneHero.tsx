import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, TrendingUp, DollarSign, Search, Handshake, BarChart2, Globe } from 'lucide-react';
import gsap from 'gsap';

// LEFT = Creator journey (3 pills), RIGHT = Brand journey (3 pills), BOTTOM = Go Global
// Phone SVG: 190×380px → half-width=95px, half-height=190px
// Phone hover 1.08x: half-width=103px, half-height=205px
// Pill hover 1.35x: widest pill ~160px → half=108px at hover
// Min safe tx = 103 (phone hover) + 108 (pill hover) + 20 (gap) = 231px
// tx: ±230 for standard pills, ±240/±245 for wider pills
// ty: -130 / 0 / +130 evenly spaced; +240 for Go Global below phone
const orbitIcons = [
  // ── LEFT: Creator journey ──
  {
    id: 'post-content',
    Icon: Camera,
    label: 'Post Content',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    bg: 'from-indigo-500/20 to-indigo-600/10',
    glowColor: 'rgba(99,102,241,0.5)',
    tx: -210,
    ty: -130,
    floatDelay: '0s',
  },
  {
    id: 'grow-audience',
    Icon: TrendingUp,
    label: 'Grow Audience',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bg: 'from-purple-500/20 to-purple-600/10',
    glowColor: 'rgba(139,92,246,0.5)',
    tx: -220,
    ty: 0,
    floatDelay: '0.3s',
  },
  {
    id: 'earn-revenue',
    Icon: DollarSign,
    label: 'Earn Revenue',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    bg: 'from-pink-500/20 to-pink-600/10',
    glowColor: 'rgba(236,72,153,0.5)',
    tx: -210,
    ty: 130,
    floatDelay: '0.6s',
  },
  // ── RIGHT: Brand journey ──
  {
    id: 'find-creators',
    Icon: Search,
    label: 'Find Creators',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bg: 'from-cyan-500/20 to-cyan-600/10',
    glowColor: 'rgba(34,211,238,0.5)',
    tx: 210,
    ty: -130,
    floatDelay: '0.9s',
  },
  {
    id: 'launch-campaigns',
    Icon: Handshake,
    label: 'Launch Campaigns',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bg: 'from-emerald-500/20 to-emerald-600/10',
    glowColor: 'rgba(52,211,153,0.5)',
    tx: 220,
    ty: 0,
    floatDelay: '1.2s',
  },
  {
    id: 'measure-results',
    Icon: BarChart2,
    label: 'Measure Results',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bg: 'from-amber-500/20 to-orange-500/10',
    glowColor: 'rgba(251,191,36,0.5)',
    tx: 210,
    ty: 130,
    floatDelay: '1.5s',
  },
  // ── BOTTOM CENTER ──
  {
    id: 'go-global',
    Icon: Globe,
    label: 'Go Global',
    color: 'text-white/70',
    borderColor: 'border-white/20',
    bg: 'from-white/10 to-white/5',
    glowColor: 'rgba(255,255,255,0.2)',
    tx: 0,
    ty: 240,
    floatDelay: '1.8s',
  },
];

// Mobile fallback cards
const mobileCards = [
  {
    title: 'Post Content',
    subtitle: 'Grow your creator profile',
    Icon: Camera,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30',
    delay: 0,
  },
  {
    title: 'Find Creators',
    subtitle: 'Launch brand campaigns',
    Icon: Search,
    gradient: 'from-cyan-500/20 to-emerald-500/20',
    borderColor: 'border-cyan-500/30',
    delay: 0.15,
  },
];

export function PhoneHero() {
  // phoneEntranceRef: GSAP animates this wrapper (opacity/y entrance only)
  const phoneEntranceRef = useRef<HTMLDivElement>(null);
  const screenGlowRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [iconsFloating, setIconsFloating] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!phoneEntranceRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => {
          setIconsFloating(true);
          setPhoneVisible(true);
          // Clear GSAP inline styles from entrance wrapper so Framer Motion hover works
          if (phoneEntranceRef.current) {
            gsap.set(phoneEntranceRef.current, { clearProps: 'all' });
          }
        },
      });

      // Phone entrance — animate opacity+y only, no scale (scale handed to Framer Motion)
      tl.fromTo(
        phoneEntranceRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.3,
      );

      // Screen glow pulse
      if (screenGlowRef.current) {
        tl.fromTo(
          screenGlowRef.current,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' },
          0.8,
        );
      }

      // Icons burst out one by one
      orbitIcons.forEach((icon, i) => {
        const el = iconRefs.current[i];
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, scale: 0, x: 0, y: 0 },
          {
            opacity: 1,
            scale: 1,
            x: icon.tx,
            y: icon.ty,
            duration: 0.45,
            ease: 'back.out(2)',
          },
          1.0 + i * 0.15,
        );
      });
    });

    // Reduced-motion: show everything immediately in final position
    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (phoneEntranceRef.current) gsap.set(phoneEntranceRef.current, { opacity: 1, y: 0 });
      orbitIcons.forEach((icon, i) => {
        const el = iconRefs.current[i];
        if (el) gsap.set(el, { opacity: 1, scale: 1, x: icon.tx, y: icon.ty });
      });
      setIconsFloating(true);
      setPhoneVisible(true);
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="relative flex items-center justify-center md:min-h-[480px]">

      {/* ── Tablet + Desktop: iPhone + orbiting icons ── */}
      <div className="hidden md:flex items-center justify-center relative w-full h-[520px] md:scale-[0.55] lg:scale-[0.8] xl:scale-100 origin-center overflow-visible">

        {/* Orbiting icon pills — GSAP sets their x/y, Framer Motion handles hover pop */}
        {orbitIcons.map((icon, i) => (
          // Outer div: GSAP moves this via x/y (starts at container center via left-1/2 top-1/2)
          // -translate-x-1/2 -translate-y-1/2 centers the pill on the anchor point
          // BUT: GSAP overrides Tailwind's transform, so we use a wrapper approach instead:
          // This div sits at left:50% top:50% (its top-left at container center).
          // GSAP animates x/y from 0 → tx/ty. Since GSAP replaces CSS transform entirely,
          // pill top-left lands at (tx, ty). We shift pill to center via an inner flex wrapper.
          <div
            key={icon.id}
            ref={(el) => { iconRefs.current[i] = el; }}
            className="absolute left-1/2 top-1/2 z-20"
            style={{ opacity: 0 }}
          >
            {/* Shift pill so its center aligns with the GSAP-positioned anchor point */}
            <div className="-translate-x-1/2 -translate-y-1/2">
              {/* Framer Motion owns transform for scale+lift on hover */}
              <motion.div
                whileHover={{
                  scale: 1.35,
                  y: -6,
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                className="cursor-default"
              >
                {/* CSS float animation on inner child — separate from Framer Motion's transform */}
                <div
                  className={`
                    flex items-center gap-2 px-3.5 py-2.5 rounded-2xl
                    bg-gradient-to-br ${icon.bg}
                    border ${icon.borderColor}
                    backdrop-blur-xl shadow-xl
                    whitespace-nowrap
                    ${iconsFloating ? 'animate-orbit-float' : ''}
                  `}
                  style={{
                    animationDelay: iconsFloating ? icon.floatDelay : undefined,
                    boxShadow: `0 4px 24px 0 ${icon.glowColor}, 0 1px 8px rgba(0,0,0,0.4)`,
                  }}
                >
                  <icon.Icon className={`w-4 h-4 ${icon.color} flex-shrink-0`} />
                  <span className="text-xs font-semibold text-white/90">{icon.label}</span>
                </div>
              </motion.div>
            </div>
          </div>
        ))}

        {/* iPhone body — entrance wrapper (GSAP), hover wrapper (Framer Motion) */}
        <div
          ref={phoneEntranceRef}
          className="relative z-10 flex-shrink-0"
          style={{ opacity: 0 }}
        >
        <motion.div
          className="relative"
          whileHover={phoneVisible ? {
            scale: 1.08,
            transition: { type: 'spring', stiffness: 280, damping: 18 },
          } : undefined}
        >
          {/* Ambient glow behind phone */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-50 rounded-[50px]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(99,102,241,0.55) 0%, rgba(139,92,246,0.3) 55%, transparent 80%)',
            }}
          />

          <svg
            viewBox="0 0 220 440"
            width="190"
            height="380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                'drop-shadow(0 32px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 48px rgba(99,102,241,0.3))',
            }}
          >
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="220" y2="440" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1c1c3a" />
                <stop offset="50%" stopColor="#12122a" />
                <stop offset="100%" stopColor="#0a0a1f" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="18" y1="28" x2="202" y2="412" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d0d28" />
                <stop offset="100%" stopColor="#070718" />
              </linearGradient>
              <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
                <stop offset="60%" stopColor="rgba(139,92,246,0.12)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <linearGradient id="edgeHighlight" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
              <clipPath id="screenClip">
                <rect x="18" y="28" width="184" height="384" rx="10" />
              </clipPath>
              <linearGradient id="frameGrad" x1="0" y1="0" x2="220" y2="440" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(160,160,220,0.40)" />
                <stop offset="30%" stopColor="rgba(80,80,140,0.22)" />
                <stop offset="70%" stopColor="rgba(60,60,120,0.22)" />
                <stop offset="100%" stopColor="rgba(140,140,200,0.35)" />
              </linearGradient>
              <linearGradient id="reflectionGrad" x1="18" y1="28" x2="18" y2="88" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Shadow shape */}
            <rect x="1" y="1" width="218" height="438" rx="38" fill="rgba(0,0,0,0.6)" />
            {/* Body */}
            <rect x="2" y="2" width="216" height="436" rx="37" fill="url(#bodyGrad)" />
            {/* Metallic frame */}
            <rect x="2" y="2" width="216" height="436" rx="37" fill="none" stroke="url(#frameGrad)" strokeWidth="2" />
            {/* Edge highlight */}
            <rect x="2" y="2" width="216" height="436" rx="37" fill="none" stroke="url(#edgeHighlight)" strokeWidth="1" />

            {/* Side buttons */}
            <rect x="-1" y="100" width="4" height="28" rx="2" fill="rgba(120,120,180,0.4)" />
            <rect x="-1" y="140" width="4" height="28" rx="2" fill="rgba(120,120,180,0.4)" />
            <rect x="217" y="120" width="4" height="44" rx="2" fill="rgba(120,120,180,0.4)" />

            {/* Screen */}
            <rect x="18" y="28" width="184" height="384" rx="10" fill="url(#screenGrad)" />
            <rect x="18" y="28" width="184" height="384" rx="10" fill="url(#glowGrad)" />

            {/* App UI */}
            <g clipPath="url(#screenClip)">
              {/* Status bar */}
              <rect x="18" y="28" width="184" height="16" fill="rgba(0,0,0,0.3)" />
              <rect x="80" y="32" width="60" height="6" rx="3" fill="rgba(255,255,255,0.08)" />

              {/* App header */}
              <rect x="18" y="44" width="184" height="36" fill="rgba(15,15,40,0.9)" />
              <rect x="30" y="54" width="60" height="8" rx="4" fill="rgba(99,102,241,0.7)" />
              <circle cx="188" cy="58" r="8" fill="rgba(99,102,241,0.25)" />
              <circle cx="188" cy="58" r="4" fill="rgba(139,92,246,0.5)" />
              <rect x="18" y="80" width="184" height="1" fill="rgba(255,255,255,0.06)" />

              {/* Matched! card */}
              <rect x="26" y="90" width="168" height="52" rx="10" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
              <circle cx="38" cy="116" r="6" fill="rgba(99,102,241,0.8)" />
              <rect x="52" y="108" width="50" height="6" rx="3" fill="rgba(99,102,241,0.6)" />
              <rect x="52" y="119" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
              <rect x="158" y="109" width="28" height="14" rx="7" fill="rgba(99,102,241,0.7)" />

              {/* Creator card 1 */}
              <rect x="26" y="154" width="78" height="90" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="65" cy="178" r="16" fill="rgba(139,92,246,0.3)" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
              <circle cx="65" cy="173" r="6" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="65" cy="186" rx="10" ry="6" fill="rgba(255,255,255,0.2)" />
              <rect x="34" y="200" width="62" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
              <rect x="38" y="211" width="54" height="4" rx="2" fill="rgba(99,102,241,0.5)" />
              <rect x="34" y="221" width="30" height="12" rx="6" fill="rgba(99,102,241,0.6)" />

              {/* Creator card 2 */}
              <rect x="116" y="154" width="78" height="90" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="155" cy="178" r="16" fill="rgba(236,72,153,0.25)" stroke="rgba(236,72,153,0.35)" strokeWidth="1" />
              <circle cx="155" cy="173" r="6" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="155" cy="186" rx="10" ry="6" fill="rgba(255,255,255,0.2)" />
              <rect x="124" y="200" width="62" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
              <rect x="128" y="211" width="54" height="4" rx="2" fill="rgba(236,72,153,0.5)" />
              <rect x="124" y="221" width="30" height="12" rx="6" fill="rgba(236,72,153,0.5)" />

              {/* Section label */}
              <rect x="26" y="256" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />

              {/* Stats row */}
              <rect x="26" y="270" width="168" height="44" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <rect x="38" y="281" width="28" height="8" rx="4" fill="rgba(99,102,241,0.6)" />
              <rect x="38" y="293" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
              <rect x="100" y="278" width="1" height="24" fill="rgba(255,255,255,0.08)" />
              <rect x="116" y="281" width="28" height="8" rx="4" fill="rgba(139,92,246,0.6)" />
              <rect x="116" y="293" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
              <rect x="158" y="278" width="1" height="24" fill="rgba(255,255,255,0.08)" />
              <rect x="166" y="281" width="16" height="8" rx="4" fill="rgba(236,72,153,0.6)" />
              <rect x="164" y="293" width="22" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

              {/* Bottom nav */}
              <rect x="18" y="376" width="184" height="36" fill="rgba(10,10,30,0.95)" />
              <rect x="18" y="376" width="184" height="1" fill="rgba(255,255,255,0.06)" />
              {[46, 80, 110, 140, 174].map((x, i) => (
                <circle key={i} cx={x} cy="394" r={i === 0 ? 5 : 3.5}
                  fill={i === 0 ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.2)'} />
              ))}
            </g>

            {/* Dynamic Island */}
            <rect x="76" y="12" width="68" height="14" rx="7" fill="#050510" />
            <circle cx="128" cy="19" r="3.5" fill="#0a0a18" />
            <circle cx="128" cy="19" r="1.5" fill="rgba(99,102,241,0.4)" />

            {/* Screen top reflection */}
            <rect x="18" y="28" width="184" height="60" rx="10" fill="url(#reflectionGrad)" opacity="0.05" />

            {/* Home indicator */}
            <rect x="82" y="424" width="56" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
          </svg>

          {/* Screen ambient glow */}
          <div
            ref={screenGlowRef}
            className="absolute inset-0 pointer-events-none rounded-[38px] animate-screen-glow"
            style={{
              background:
                'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(99,102,241,0.14) 0%, transparent 70%)',
            }}
          />
        </motion.div>
        </div>{/* end phoneEntranceRef */}
      </div>{/* end desktop container */}

      {/* ── Mobile fallback: 2 glass cards (< 768px only) ── */}
      <div className="md:hidden flex flex-col gap-4 w-full max-w-sm">
        {mobileCards.map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + card.delay }}
            className={`
              relative p-5 rounded-2xl border ${card.borderColor}
              bg-gradient-to-br ${card.gradient}
              backdrop-blur-md animate-float
            `}
            style={{ animationDelay: `${card.delay * 2}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <card.Icon className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="font-semibold text-white">{card.title}</p>
                <p className="text-sm text-gray-400">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
