'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { PaginatedGameLogsTable } from '@/app/components/game-logs/PaginatedGameLogsTable';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { ContentLoading } from '@/app/components/ui/loading-states';
import { HoverAnimation, FadeIn, StaggerAnimation } from '@/app/components/ui/micro-interactions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
import { ActivityTable } from '@/app/protected/dashboard/components/ActivityTable';
import { OptimizedFriendsTable } from '@/app/protected/dashboard/components/FriendsTable';
import { logger } from '@/lib/utils/logger';

function UserGreeting() {
  // Handle case where Clerk is not configured (e.g., in test environment)
  let isLoaded = false;
  let isSignedIn = false;
  let user = null;

  try {
    const userData = useUser();
    isLoaded = userData.isLoaded;
    isSignedIn = userData.isSignedIn ?? false;
    user = userData.user;
  } catch {
    // Clerk is not configured (e.g., in test environment)
    logger.info('Clerk not configured, using fallback user data');
    isLoaded = true;
    isSignedIn = false;
    user = null;
  }

  if (!isLoaded) return null;
  return (
    <section className="py-4 sm:py-6 bg-gradient-to-r from-primary/5 to-primary/10 mb-4 sm:mb-6">
      <div className="container mx-auto px-4 text-left">
        <p className="text-sm sm:text-base text-muted-foreground">
          {isSignedIn
            ? `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`
            : 'Welcome, Guest!'}
        </p>
      </div>
    </section>
  );
}

export default function UserDashboardPage() {
  const isMobile = useMobileDetection();
  const [selectedTab, setSelectedTab] = React.useState('game-logs');
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle tab change with loading state
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setSelectedTab(value);
    // Simulate loading delay for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <FadeIn>
        <UserGreeting />
      </FadeIn>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <FadeIn delay={100}>
          <Tabs value={selectedTab} onValueChange={handleTabChange}>
            {/* Enhanced Responsive Tabs with cleaner design */}
            <TabsList
              className={`mb-6 sm:mb-8 ${
                isMobile ? 'grid w-full grid-cols-3 gap-2' : 'flex w-full flex-row gap-4'
              }`}
            >
              <HoverAnimation>
                <TabsTrigger
                  value="game-logs"
                  className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm py-3 px-4 rounded-lg border border-border hover:bg-muted hover-lift"
                >
                  Game Logs
                </TabsTrigger>
              </HoverAnimation>
              <HoverAnimation>
                <TabsTrigger
                  value="friends"
                  className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm py-3 px-4 rounded-lg border border-border hover:bg-muted hover-lift"
                >
                  Friends
                </TabsTrigger>
              </HoverAnimation>
              <HoverAnimation>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm py-3 px-4 rounded-lg border border-border hover:bg-muted hover-lift"
                >
                  {isMobile ? 'Activity' : 'Activity & Timeline'}
                </TabsTrigger>
              </HoverAnimation>
            </TabsList>

            {/* Tab Content with improved loading states and animations */}
            <TabsContent value="game-logs" className="mt-0">
              <StaggerAnimation delay={200}>
                <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                  {isLoading ? (
                    <ContentLoading type="table" count={5} />
                  ) : (
                    <ErrorBoundary>
                      <PaginatedGameLogsTable />
                    </ErrorBoundary>
                  )}
                </div>
              </StaggerAnimation>
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <StaggerAnimation delay={200}>
                <div
                  className={`rounded-lg border bg-card ${isMobile ? 'p-3' : 'p-6'} mb-4 sm:mb-8 hover-lift`}
                >
                  {isLoading ? (
                    <ContentLoading type="list" count={4} />
                  ) : (
                    <ErrorBoundary>
                      <OptimizedFriendsTable />
                    </ErrorBoundary>
                  )}
                </div>
              </StaggerAnimation>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <StaggerAnimation delay={200}>
                <div
                  className={`rounded-lg border bg-card ${isMobile ? 'p-3' : 'p-6'} mb-4 sm:mb-8 hover-lift`}
                >
                  {isLoading ? (
                    <ContentLoading type="table" count={3} />
                  ) : (
                    <ErrorBoundary>
                      <ActivityTable />
                    </ErrorBoundary>
                  )}
                </div>
              </StaggerAnimation>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </div>
  );
}
