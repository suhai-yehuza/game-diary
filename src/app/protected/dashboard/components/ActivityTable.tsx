'use client';

import { useUser } from '@clerk/nextjs';
import {
  User,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Activity,
  Calendar,
  Shield,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '@/app/components/ui/Card';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IUserProfile } from '@/types';
import { ErrorCategory, ErrorSeverity } from '@/types';

// TODO: Implement activity interface and functionality

export function ActivityTable() {
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle case where Clerk is not configured (e.g., in test environment)
  let user = null;
  let isLoaded = false;

  try {
    const userData = useUser();
    user = userData.user;
    isLoaded = userData.isLoaded;
  } catch (error) {
    // Clerk is not configured (e.g., in test environment)
    errorHandlers.ui(error as Error, {
      component: 'ActivityTable',
      action: 'Initialize Clerk user',
      category: ErrorCategory.UI,
      severity: ErrorSeverity.LOW,
      timestamp: new Date().toISOString(),
    });
    console.log('Clerk not configured in ActivityTable, using fallback');
    user = null;
    isLoaded = true;
  }

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const profileData = await response.json();
        setUserProfile(profileData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch profile');
        errorHandlers.api(error, {
          component: 'ActivityTable',
          action: 'Fetch user profile',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user?.id) {
      void fetchUserProfile();
    }
  }, [isLoaded, user?.id]);

  if (!isLoaded) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="text-center text-muted-foreground">
          Please sign in to view your activity.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="text-center text-red-500">Error loading profile: {error}</div>
      </div>
    );
  }

  const displayName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.username || user?.username || 'User';

  const fullName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : null;

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="text-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-3xl" />

            <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-white dark:ring-slate-800 overflow-hidden">
                {userProfile?.profile_image_url || userProfile?.image_url ? (
                  <Image
                    src={userProfile.profile_image_url || userProfile.image_url || ''}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : null}
                <User
                  className={`w-12 h-12 text-white ${userProfile?.profile_image_url || userProfile?.image_url ? 'hidden' : ''}`}
                />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                {displayName}
              </h1>
              {userProfile?.username && fullName && (
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                  @{userProfile.username}
                </p>
              )}

              {/* Bio section */}
              {userProfile?.bio && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-700 dark:text-slate-300 italic text-center">
                    &ldquo;{userProfile.bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Status badges */}
              <div className="flex justify-center gap-3 mt-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <User className="w-4 h-4 mr-2" />
                  Your Profile
                </span>
                {userProfile?.is_friend && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Users className="w-4 h-4 mr-2" />
                    Friend
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="p-6 space-y-4">
            {/* Email Address */}
            {userProfile?.email_address && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="flex items-start space-x-3 mt-1">
                      <p
                        className={`text-lg font-medium break-all overflow-hidden ${
                          !userProfile.can_view_details || userProfile.email_address === '*****'
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {userProfile.email_address}
                      </p>
                      {(!userProfile.can_view_details || userProfile.email_address === '*****') && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex-shrink-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phone Number */}
            {userProfile?.phone_number && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="flex items-start space-x-3 mt-1">
                      <p
                        className={`text-lg font-medium break-all overflow-hidden ${
                          !userProfile.can_view_details || userProfile.phone_number === '*****'
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {userProfile.phone_number}
                      </p>
                      {(!userProfile.can_view_details || userProfile.phone_number === '*****') && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex-shrink-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {userProfile?.timezone && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
                    <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Timezone
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                      {userProfile.timezone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userProfile?.preferred_language && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
                    <MessageCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Language
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                      {userProfile.preferred_language.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userProfile?.last_active_at && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Last Active
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                      {new Date(userProfile.last_active_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userProfile?.created_at && (
              <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Member Since
                    </label>
                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                      {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Activity & Timeline</h2>
          <p className="text-muted-foreground mb-4">
            See your recent activities and timeline here.
          </p>
          <div className="text-center py-8 text-muted-foreground">
            <p>Activity functionality coming soon!</p>
            <p className="text-sm mt-2">This will include search, filter, and sort capabilities.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
