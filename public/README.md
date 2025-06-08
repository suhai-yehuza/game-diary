# Public Assets Documentation

## Overview

This directory contains all static assets served by the application.

## Directory Structure

### Icons (`icons/`)

- UI icons and symbols
- Navigation icons
- Feature icons
- System icons

### Logos (`logos/`)

- Application logos
- Team logos
- Brand assets
- SVG and PNG formats

### Avatars (`avatars/`)

- User avatars
- Default avatars
- Profile pictures
- Avatar placeholders

### Defaults (`defaults/`)

- Default images
- Fallback assets
- Placeholder graphics
- Default icons

## Asset Guidelines

### SVG Optimization

- Use SVGO for optimization
- Remove unnecessary metadata
- Minimize file size
- Maintain accessibility

### Image Formats

- Use SVG for icons and logos
- Use WebP for photos
- Provide fallback formats
- Optimize for web delivery

### Naming Conventions

- Use kebab-case for filenames
- Include size in filename if applicable
- Use descriptive names
- Include format in filename

### Usage Examples

```tsx
// Using an icon
import Icon from '@/components/ui/icon';

<Icon name="gamelog" size="lg" />

// Using a logo
import Image from 'next/image';

<Image
  src="/logos/gamelog-large.svg"
  alt="GameLog Logo"
  width={200}
  height={50}
/>

// Using an avatar
<Image
  src="/avatars/default-user-avatar.svg"
  alt="User Avatar"
  width={40}
  height={40}
/>
```

## Asset Categories

### Icons

- `gamelog.svg` - Main application icon
- `globe.svg` - Language/region icon
- `window.svg` - Window management icon
- `file.svg` - File/document icon

### Logos

- `gamelog-large.svg` - Large application logo
- `gamelog.svg` - Standard application logo
- `default-nba-team-logo.svg` - Default NBA team logo
- `default-team-logo.svg` - Default team logo

### Avatars

- `default-user-avatar.svg` - Default user avatar

### Defaults

- `default-player-logo.svg` - Default player image
- `favicon.ico` - Browser favicon

## Contributing

When adding new assets:

1. Place them in the appropriate category directory
2. Optimize SVGs using SVGO
3. Follow naming conventions
4. Update this README
5. Ensure proper licensing
6. Include alt text for accessibility
