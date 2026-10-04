'use client';

/**
 * InteractiveParticles — retired in the cosmos redesign.
 *
 * The site now has a persistent, GPU-accelerated 3D starfield
 * (see components/cosmos/CosmosBackground) rendered behind every page.
 * The old per-page 2D canvas particles duplicated that effect and cost an
 * extra render loop per page, so this component is now a no-op passthrough.
 * The props are kept so existing call sites keep compiling unchanged.
 */
interface InteractiveParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
}

export default function InteractiveParticles(_props: InteractiveParticlesProps) {
  return null;
}
