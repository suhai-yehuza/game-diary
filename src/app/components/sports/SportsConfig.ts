import { SPORTS_CONFIG, type SportKey } from '@/types';

export { SPORTS_CONFIG, type SportKey };

export const ALL_SPORTS_BUTTONS = Object.entries(SPORTS_CONFIG).map(([_key, sport]) => ({
  name: sport.name,
  fullName: sport.fullName,
  href: sport.href,
  color: sport.color,
  icon: sport.icon,
}));
