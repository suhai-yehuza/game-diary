'use client';

import * as Icons from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { FriendshipActionButton } from '@/app/components/FriendshipActionButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { useFriendshipStatus } from '@/hooks/use-friendships';
import type { IUserProfile } from '@/types';

// Interface moved to src/lib/types/page.types.ts

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get friendship status for this user
  const { status: friendshipStatus, refetch: refetchFriendshipStatus } =
    useFriendshipStatus(userId);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch user data - this might be restricted by RLS
        const response = await fetch(`/api/user/${userId}`);

        if (!response.ok) {
          if (response.status === 403) {
            setError('This user profile is private.');
          } else if (response.status === 404) {
            setError('User not found.');
          } else {
            setError('Unable to load user profile.');
          }
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Unable to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <Icons.Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600 dark:text-gray-400">
              Loading user profile...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-8 text-center">
              <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
                Profile Unavailable
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User profiles may be private or you may need to be signed in to view them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Icons.User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                User Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The requested user profile could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const displayName = fullName || user.username || 'Anonymous';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-3xl" />

            <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              {/* Friendship Action Button - Top Right */}
              {!user.is_own_profile && (
                <div className="absolute top-6 right-6">
                  <FriendshipActionButton
                    userId={userId}
                    friendshipStatus={friendshipStatus}
                    onStatusChange={() => void refetchFriendshipStatus()}
                  />
                </div>
              )}

              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-white dark:ring-slate-800 overflow-hidden">
                {user.profile_image_url || user.image_url ? (
                  <Image
                    src={user.profile_image_url || user.image_url || ''}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : null}
                <Icons.User
                  className={`w-12 h-12 text-white ${user.profile_image_url || user.image_url ? 'hidden' : ''}`}
                />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                {displayName}
              </h1>
              {user.username && fullName && (
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                  @{user.username}
                </p>
              )}

              {/* Bio section */}
              {user.bio && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-700 dark:text-slate-300 italic text-center">
                    &quot;{user.bio}&quot;
                  </p>
                </div>
              )}

              {/* Status badges */}
              <div className="flex justify-center gap-3 mt-6">
                {user.is_own_profile && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Icons.User className="w-4 h-4 mr-2" />
                    Your Profile
                  </span>
                )}
                {user.is_friend && !user.is_own_profile && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Icons.Users className="w-4 h-4 mr-2" />
                    Friend
                  </span>
                )}
                {user.created_at && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    <Icons.Calendar className="w-4 h-4 mr-2" />
                    Member since {new Date(user.created_at).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <Card className="bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icons.Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  User Information
                </span>
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                {user.is_own_profile
                  ? 'Your personal profile information'
                  : user.is_friend
                    ? "Friend's profile information"
                    : 'Public profile information for this user'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {user.username && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Icons.AtSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Username
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {user.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {fullName && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Icons.User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {fullName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user.email_address && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors flex-shrink-0">
                      <Icons.Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="flex items-start space-x-3 mt-1">
                        <p
                          className={`text-lg font-medium break-all overflow-hidden ${!user.can_view_details || user.email_address === '*****' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                          {user.email_address}
                        </p>
                        {(!user.can_view_details || user.email_address === '*****') && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex-shrink-0">
                            <Icons.Shield className="w-3 h-3 mr-1" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user.phone_number && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors flex-shrink-0">
                      <Icons.Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <div className="flex items-start space-x-3 mt-1">
                        <p
                          className={`text-lg font-medium break-all overflow-hidden ${!user.can_view_details || user.phone_number === '*****' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                          {user.phone_number}
                        </p>
                        {(!user.can_view_details || user.phone_number === '*****') && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex-shrink-0">
                            <Icons.Shield className="w-3 h-3 mr-1" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user.created_at && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <Icons.Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Member Since
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user.timezone && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
                      <Icons.Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Timezone
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {user.timezone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user.preferred_language && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
                      <Icons.MessageCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Language
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {user.preferred_language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user.last_active_at && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Icons.Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Last Active
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {new Date(user.last_active_at).toLocaleDateString('en-US', {
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

              {user.last_sign_in_at && (
                <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                      <Icons.LogIn className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Last Sign In
                      </label>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                        {new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
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
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card
            className={`shadow-xl border-2 rounded-2xl overflow-hidden ${
              user.is_own_profile
                ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                : user.is_friend
                  ? 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                  : 'border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-xl ${
                    user.is_own_profile
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : user.is_friend
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}
                >
                  {user.is_own_profile ? (
                    <Icons.User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : user.is_friend ? (
                    <Icons.Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icons.Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      user.is_own_profile
                        ? 'text-blue-800 dark:text-blue-200'
                        : user.is_friend
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    {user.is_own_profile
                      ? 'Your Personal Profile'
                      : user.is_friend
                        ? 'Friend Profile'
                        : 'Privacy Protected Profile'}
                  </h3>
                  <p
                    className={`text-base leading-relaxed ${
                      user.is_own_profile
                        ? 'text-blue-700 dark:text-blue-300'
                        : user.is_friend
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {user.is_own_profile
                      ? 'You are viewing your own profile with full access to all your personal information and settings.'
                      : user.is_friend
                        ? 'You are friends with this user, so you can see their contact information and connect with them.'
                        : 'You are not friends with this user. Contact information is masked for privacy protection. Send a friend request to view full details and connect.'}
                  </p>
                  {!user.is_own_profile && !user.is_friend && (
                    <div className="mt-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        💡 <strong>Tip:</strong> To view this user&apos;s full contact information,
                        send them a friend request from the Friends page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
