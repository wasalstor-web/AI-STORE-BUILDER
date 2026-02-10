import type { CSSProperties } from 'react';

export type AppBackdropVariant = 'marketing' | 'auth' | 'app' | 'builder';
export type AppBackdropIntensity = 'lux' | 'max';
export type AppBackdropFocus = 'hero' | 'center';

type Props = {
  variant?: AppBackdropVariant;
  intensity?: AppBackdropIntensity;
  focus?: AppBackdropFocus;
  className?: string;
};

const meshUrl = new URL('../../assets/graphics/mesh.svg', import.meta.url).toString();
const beamsUrl = new URL('../../assets/graphics/beams.svg', import.meta.url).toString();
const orbsUrl = new URL('../../assets/graphics/orbs.svg', import.meta.url).toString();
const noiseUrl = new URL('../../assets/graphics/noise.svg', import.meta.url).toString();

function getVariantDefaults(variant: AppBackdropVariant): { x: string; y: string; intensity: AppBackdropIntensity } {
  switch (variant) {
    case 'marketing':
      return { x: '52%', y: '18%', intensity: 'max' };
    case 'auth':
      return { x: '50%', y: '34%', intensity: 'max' };
    case 'builder':
      return { x: '55%', y: '42%', intensity: 'lux' };
    case 'app':
    default:
      return { x: '58%', y: '24%', intensity: 'max' };
  }
}

function getFocusOffsets(focus: AppBackdropFocus, variant: AppBackdropVariant): { x: string; y: string } {
  if (focus === 'center') return { x: '50%', y: '45%' };
  return getVariantDefaults(variant);
}

export default function AppBackdrop({
  variant = 'app',
  intensity,
  focus = 'hero',
  className,
}: Props) {
  const defaults = getVariantDefaults(variant);
  const resolvedIntensity = intensity ?? defaults.intensity;
  const focusPos = getFocusOffsets(focus, variant);

  return (
    <div
      aria-hidden="true"
      className={['app-backdrop', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-intensity={resolvedIntensity}
      style={
        {
          // These are used by CSS to "aim" beams/orbs toward the current hero/center.
          ['--gfx-focus-x' as never]: focusPos.x,
          ['--gfx-focus-y' as never]: focusPos.y,
          ['--gfx-mesh-url' as never]: `url("${meshUrl}")`,
          ['--gfx-beams-url' as never]: `url("${beamsUrl}")`,
          ['--gfx-orbs-url' as never]: `url("${orbsUrl}")`,
          ['--gfx-noise-url' as never]: `url("${noiseUrl}")`,
        } as CSSProperties
      }
    >
      <div className="app-backdrop__aurora" />
      <div className="app-backdrop__mesh" />
      <div className="app-backdrop__beams" />
      <div className="app-backdrop__orbs" />
      <div className="app-backdrop__noise" />
      <div className="app-backdrop__vignette" />
    </div>
  );
}
