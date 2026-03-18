import { ParticleCanvas } from '../../pages/landing/ParticleCanvas';
import { GlowOrbs } from '../../pages/landing/GlowOrbs';

export function DarkBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#050510]" />
      <ParticleCanvas />
      <GlowOrbs />
    </div>
  );
}
