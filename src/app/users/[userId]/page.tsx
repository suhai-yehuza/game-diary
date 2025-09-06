'use client';

import * as Icons from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import type { IUserProfile } from '@/types';

// Interface moved to src/lib/types/page.types.ts

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const displayName = fullName || user.username || 'Unknown User';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icons.User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{displayName}</h1>
          {user.username && fullName && (
            <p className="text-lg text-gray-600 dark:text-gray-400">@{user.username}</p>
          )}
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icons.Info className="w-5 h-5" />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>Public profile information for this user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.username && (
              <div className="flex items-center space-x-3">
                <Icons.AtSign className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.username}</p>
                </div>
              </div>
            )}

            {fullName && (
              <div className="flex items-center space-x-3">
                <Icons.User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{fullName}</p>
                </div>
              </div>
            )}

            {user.email_address && (
              <div className="flex items-center space-x-3">
                <Icons.Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-gray-900 dark:text-white ${!user.can_view_details && user.email_address.includes('***') ? 'text-gray-500 dark:text-gray-400' : ''}`}
                    >
                      {user.email_address}
                    </p>
                    {!user.can_view_details && user.email_address.includes('***') && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user.phone_number && (
              <div className="flex items-center space-x-3">
                <Icons.Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-gray-900 dark:text-white ${!user.can_view_details && user.phone_number.includes('***') ? 'text-gray-500 dark:text-gray-400' : ''}`}
                    >
                      {user.phone_number}
                    </p>
                    {!user.can_view_details && user.phone_number.includes('***') && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user.created_at && (
              <div className="flex items-center space-x-3">
                <Icons.Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card
          className={`border-blue-200 dark:border-blue-800 ${user.is_friend ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-blue-50/50 dark:bg-blue-900/20'}`}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              {user.is_own_profile ? (
                <Icons.User className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              ) : user.is_friend ? (
                <Icons.Users className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Icons.Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3
                  className={`font-medium mb-1 ${user.is_friend ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}
                >
                  {user.is_own_profile
                    ? 'Your Profile'
                    : user.is_friend
                      ? 'Friend Profile'
                      : 'Privacy Protected'}
                </h3>
                <p
                  className={`text-sm ${user.is_friend ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}
                >
                  {user.is_own_profile
                    ? 'You are viewing your own profile with full access to your information.'
                    : user.is_friend
                      ? 'You are friends with this user, so you can see their contact information.'
                      : 'You are not friends with this user. Contact information is masked for privacy. Send a friend request to view full details.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
