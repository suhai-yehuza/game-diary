import { User, Circle } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type { IFallbackAvatarProps } from '@/types';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 32,
  xl: 48,
};

// Avatar generation services
const getDiceBearAvatar = (name: string, size: number) => {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=${size}&backgroundColor=transparent`;
};

const getBoringAvatars = (name: string, size: number) => {
  const seed = encodeURIComponent(name);
  return `https://source.boringavatars.com/marble/${size}/${seed}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;
};

const getUIavatars = (name: string, size: number) => {
  const background = generateColorFromName(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&size=${size}&bold=true`;
};

// Multiavatar is behind Cloudflare protection, so we'll use a fallback
const getMultiavatar = (name: string, size: number) => {
  // Fallback to UI Avatars with a different color scheme
  const background = generateColorFromName(name + '_alt');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&size=${size}&bold=true`;
};

const generateColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex color
  const hue = hash % 360;
  const saturation = 70;
  const lightness = 50;

  // Convert HSL to RGB
  const c = ((1 - Math.abs((2 * lightness) / 100 - 1)) * saturation) / 100;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness / 100 - c / 2;

  let r, g, b;
  if (hue >= 0 && hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue >= 60 && hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue >= 120 && hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue >= 180 && hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue >= 240 && hue < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getAvatarUrl = (name: string, variant: string, size: number) => {
  // Use different avatar services based on variant for variety
  switch (variant) {
    case 'player':
      return getDiceBearAvatar(name, size);
    case 'team':
      return getBoringAvatars(name, size);
    case 'league':
      return getUIavatars(name, size);
    default:
      return getMultiavatar(name, size);
  }
};

export function FallbackAvatar({
  name,
  size = 'md',
  className,
  variant = 'player',
}: IFallbackAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarSize = size === 'sm' ? 64 : size === 'md' ? 80 : size === 'lg' ? 128 : 192;
  const avatarUrl = useMemo(
    () => getAvatarUrl(name, variant, avatarSize),
    [name, variant, avatarSize]
  );

  const getIcon = () => {
    switch (variant) {
      case 'player':
        return <Circle size={iconSizes[size]} className="text-theme-muted" />;
      case 'team':
        return <Circle size={iconSizes[size]} className="text-theme-muted" />;
      case 'league':
        return <Circle size={iconSizes[size]} className="text-theme-muted" />;
      default:
        return <User size={iconSizes[size]} className="text-theme-muted" />;
    }
  };

  // If image failed to load, show gradient fallback
  if (imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-purple-600 text-white font-semibold shadow-lg',
          sizeClasses[size],
          className
        )}
      >
        {initials.length >= 2 ? <span className="font-bold">{initials}</span> : getIcon()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full overflow-hidden shadow-lg',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={avatarUrl}
        alt={`${name} avatar`}
        width={avatarSize}
        height={avatarSize}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

// Specialized components for different use cases
export function PlayerFallbackAvatar({
  name,
  size = 'md',
  className,
}: Omit<IFallbackAvatarProps, 'variant'>) {
  return <FallbackAvatar name={name} size={size} className={className} variant="player" />;
}

export function TeamFallbackAvatar({
  name,
  size = 'md',
  className,
}: Omit<IFallbackAvatarProps, 'variant'>) {
  return <FallbackAvatar name={name} size={size} className={className} variant="team" />;
}

export function LeagueFallbackAvatar({
  name,
  size = 'md',
  className,
}: Omit<IFallbackAvatarProps, 'variant'>) {
  return <FallbackAvatar name={name} size={size} className={className} variant="league" />;
}
