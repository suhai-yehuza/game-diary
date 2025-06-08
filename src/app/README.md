# App Directory (`src/app`)

This directory contains the Next.js 13+ App Router structure, organized for scalable routing, API endpoints, and page components.

## 📁 Directory Structure

```
src/app/
├── _components/           # Shared app-level components
├── _types/               # App-specific type definitions
├── _utils/               # App-level utility functions
├── api/                  # API route handlers
│   ├── admin/           # Admin-specific API routes
│   ├── cache/           # Cache management endpoints
│   ├── games/           # Game data API routes
│   ├── graphql/         # GraphQL endpoint
│   ├── user/            # User-specific API routes
│   ├── users/           # User management API routes
│   └── webhooks/        # Webhook handlers
├── dashboard/           # Dashboard pages
├── protected/           # Authentication-required pages
│   ├── admin/          # Admin panel pages
│   ├── client/         # Client-specific pages
│   ├── server/         # Server-rendered protected pages
│   └── user/           # User profile and management
├── search/             # Search functionality pages
├── sign-in/            # Authentication pages
├── sign-up/            # Registration pages
├── sports/             # Sports-related pages
│   ├── all-sports/     # Multi-sport views
│   ├── mlb/           # Baseball pages
│   ├── mls/           # Soccer pages
│   ├── nba/           # Basketball pages
│   │   ├── games/     # Individual game pages
│   │   └── teams/     # Team-specific pages
│   ├── nfl/           # Football pages
│   └── nhl/           # Hockey pages
├── styles/             # Global stylesheets
├── globals.css         # Global CSS variables and styles
├── layout.tsx          # Root layout component
├── not-found.tsx       # 404 error page
└── page.tsx           # Homepage component
```

## 🏗️ **Architecture Principles**

### **1. Route Organization**

Pages are organized by user access level and feature domain:

```
├── (public routes)     # No authentication required
│   ├── page.tsx       # Homepage
│   ├── sign-in/       # Login
│   └── sign-up/       # Registration
├── protected/         # Authentication required
│   ├── user/         # Standard user features
│   └── admin/        # Admin-only features
└── api/              # Backend API routes
```

### **2. Feature-Based Routing**

Related functionality is grouped together:

- `sports/nba/` - All NBA-related pages
- `protected/user/` - All user management pages
- `api/games/` - All game-related API endpoints

### **3. Access Control Strategy**

Clear separation of authentication levels:

- **Public:** Homepage, auth pages, basic sports info
- **Protected:** User profiles, game logs, friends
- **Admin:** User management, system administration

## 📄 **Page Types & Patterns**

### **Static Pages**

```typescript
// app/sports/nba/page.tsx
export default function NBAPage() {
  return <NBALandingComponent />;
}
```

### **Dynamic Pages**

```typescript
// app/sports/nba/games/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default function GamePage({ params }: Props) {
  return <GameDetailComponent gameId={params.id} />;
}
```

### **Protected Pages**

```typescript
// app/protected/user/page.tsx
import { auth } from '@clerk/nextjs';

export default function UserPage() {
  const { userId } = auth();
  return <UserProfileComponent userId={userId} />;
}
```

## 🔌 **API Route Organization**

### **RESTful Patterns**

```
api/
├── users/
│   ├── route.ts       # GET /api/users (list)
│   └── [id]/
│       └── route.ts   # GET /api/users/[id] (detail)
├── games/
│   ├── route.ts       # GET /api/games
│   └── [id]/
│       └── route.ts   # GET /api/games/[id]
└── admin/
    └── users/
        └── route.ts   # Admin user management
```

### **Specialized Endpoints**

- `api/graphql/` - GraphQL endpoint for complex queries
- `api/cache/` - Cache invalidation and management
- `api/webhooks/` - External service integrations

## 🎯 **Optimization Improvements**

### **Before Optimization:**

- 📊 Mixed concerns in page components
- 📊 Repeated layout patterns
- 📊 Inconsistent error handling
- 📊 Large page components

### **After Optimization:**

- ✅ **Shared Components:** Common patterns extracted to `_components/`
- ✅ **Type Safety:** Centralized types in `_types/`
- ✅ **Utility Functions:** Reusable logic in `_utils/`
- ✅ **Consistent Layouts:** Standardized page structures

## 🔐 **Authentication & Authorization**

### **Route Protection Levels**

```typescript
// Public routes (no auth required)
app/
├── page.tsx
├── sign-in/
└── sports/ (public sports info)

// Protected routes (auth required)
app/protected/
├── user/           # Standard user access
└── admin/          # Admin-only access
```

### **Middleware Protection**

```typescript
// middleware.ts
export default authMiddleware({
  publicRoutes: ['/', '/sports/(.*)', '/sign-in', '/sign-up'],
  ignoredRoutes: ['/api/webhooks/(.*)'],
});
```

## 📱 **Responsive Design Strategy**

### **Layout Hierarchy**

```
RootLayout
├── AuthProvider
├── ThemeProvider
├── QueryProvider
└── ToastProvider
    └── PageLayout
        └── FeatureLayout
            └── ComponentLayout
```

### **Shared Components**

```typescript
// app/_components/
├── AuthGuard.tsx      # Route protection
├── ErrorBoundary.tsx  # Error handling
├── LoadingSpinner.tsx # Loading states
├── PageHeader.tsx     # Consistent headers
└── Sidebar.tsx        # Navigation sidebar
```

## 🚀 **Performance Optimizations**

### **Code Splitting**

```typescript
// Lazy loading for large features
const AdminPanel = lazy(() => import('@/components/features/admin'));
const GameDetail = lazy(() => import('@/components/features/games/detail'));
```

### **Static Generation**

```typescript
// Static sports pages
export async function generateStaticParams() {
  return [{ sport: 'nba' }, { sport: 'nfl' }, { sport: 'mlb' }];
}
```

### **API Route Caching**

```typescript
// api/games/route.ts
export async function GET() {
  const games = await getGames();

  return NextResponse.json(games, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate',
    },
  });
}
```

## 🧭 **Navigation Patterns**

### **Breadcrumb Structure**

```
Home > Sports > NBA > Games > [Game ID]
Home > Protected > User > Profile
Home > Protected > Admin > Users > [User ID]
```

### **Menu Organization**

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Sports', href: '/sports' },
  { name: 'Search', href: '/search' },
  { name: 'Profile', href: '/protected/user' },
];
```

## 📊 **SEO & Metadata**

### **Dynamic Metadata**

```typescript
// app/sports/nba/games/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const game = await getGame(params.id);

  return {
    title: `${game.homeTeam} vs ${game.awayTeam}`,
    description: `Game details for ${game.date}`,
  };
}
```

### **Structured Data**

```typescript
// Sports pages include structured data for search engines
const structuredData = {
  '@type': 'SportsEvent',
  homeTeam: game.homeTeam,
  awayTeam: game.awayTeam,
  startDate: game.date,
};
```

## 🎨 **Styling Strategy**

### **Global Styles**

- `globals.css` - CSS variables, resets, base styles
- Tailwind CSS for component styling
- CSS modules for component-specific styles

### **Theme System**

- Dark/light mode support
- Consistent design tokens
- Responsive breakpoints

## 🧪 **Testing Approach**

```typescript
// Page-level tests
describe('NBA Games Page', () => {
  it('renders game list correctly', () => {
    render(<NBAGamesPage />);
    expect(screen.getByText('NBA Games')).toBeInTheDocument();
  });
});

// API route tests
describe('/api/games', () => {
  it('returns games list', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
```
