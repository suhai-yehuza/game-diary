'use client';

import {
  User,
  Mail,
  Calendar,
  Shield,
  Globe,
  Edit,
  Camera,
  Settings,
  Activity,
  Award,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { useUser, useAuth } from '@/app/components/providers/clerk-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import type {
  IClerkUserData,
  IClerkEmailAddress,
  IClerkPhoneNumber,
  IClerkExternalAccount,
} from '@src/lib/types';

export default function ProfilePage() {
  const userResult = useUser() as {
    isLoaded: boolean;
    isSignedIn: boolean;
    user: IClerkUserData | undefined;
  };
  const authResult = useAuth() as { getToken?: () => Promise<string> };

  // Type guard to ensure we have valid user data
  const isLoaded = userResult.isLoaded ?? false;
  const isSignedIn = userResult.isSignedIn ?? false;
  const user = userResult.user;

  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchToken = async () => {
      const getToken = authResult.getToken ?? (() => Promise.resolve('mock-token'));
      if (isSignedIn) {
        const userToken = await getToken();
        setToken(userToken);
      }
    };
    void fetchToken();
  }, [isSignedIn, authResult]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDate = (date: number | null | undefined) => {
    if (!date) return 'Not available';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const primaryEmail = user?.email_addresses?.find(
    e => e.id === user?.primary_email_address_id
  )?.email_address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                    {user?.image_url ? (
                      <Image
                        src={user.image_url}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="w-16 h-16 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <CardTitle className="text-2xl">
                  {user?.first_name} {user?.last_name}
                </CardTitle>
                <CardDescription className="text-base">{primaryEmail}</CardDescription>
                {user?.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{formatDate(user?.created_at).split(',')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last active</span>
                  <span className="font-medium">
                    {formatDate(user?.last_sign_in_at).split(',')[0]}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Right Side */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Your basic profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          First Name
                        </label>
                        <p className="text-lg font-medium">{user?.first_name ?? 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Name
                        </label>
                        <p className="text-lg font-medium">{user?.last_name ?? 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Username
                        </label>
                        <p className="text-lg font-medium">{user?.username ?? 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <p className="text-lg font-medium">
                          {`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
                            'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>Your email addresses and phone numbers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Primary Email
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-medium">{primaryEmail ?? 'Not provided'}</p>
                        {user?.email_addresses?.find(e => e.id === user?.primary_email_address_id)
                          ?.verification.status === 'verified' && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {Array.isArray(user?.email_addresses) && user?.email_addresses?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          All Email Addresses
                        </label>
                        <div className="space-y-2 mt-2">
                          {user?.email_addresses?.map((email: IClerkEmailAddress) => (
                            <div
                              key={email?.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{email?.email_address}</p>
                                <p className="text-sm text-muted-foreground">
                                  {email?.verification?.status === 'verified'
                                    ? 'Verified'
                                    : 'Unverified'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(user?.phone_numbers) && user?.phone_numbers?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Phone Numbers
                        </label>
                        <div className="space-y-2 mt-2">
                          {user?.phone_numbers?.map((phone: IClerkPhoneNumber) => (
                            <div
                              key={phone?.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{phone?.phone_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {phone?.verification?.status === 'verified'
                                    ? 'Verified'
                                    : 'Unverified'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {Array.isArray(user?.external_accounts) && user?.external_accounts?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Connected Accounts
                      </CardTitle>
                      <CardDescription>External accounts linked to your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user?.external_accounts?.map((account: IClerkExternalAccount) => (
                          <div
                            key={account?.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{account?.provider}</p>
                              <p className="text-sm text-muted-foreground">
                                {account?.email_address}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Two-Factor Authentication</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user?.two_factor_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Backup Codes</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user?.backup_code_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user?.backup_code_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generate backup codes for account recovery
                        </p>
                      </div>
                    </div>

                    {token && (
                      <div className="p-4 border rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground">
                          JWT Token (first 50 characters)
                        </label>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <code className="text-sm font-mono break-all">
                            {token.substring(0, 50)}...
                          </code>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Account Activity
                    </CardTitle>
                    <CardDescription>Recent activity and account events</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Account Created</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user?.created_at)}
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Last Sign In</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user?.last_sign_in_at)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Account Status</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Account Status</span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User ID</span>
                          <span className="font-medium text-xs">{user?.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>Manage your account preferences and metadata</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Delete Account</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user?.delete_self_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user?.delete_self_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ability to delete your own account
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Create Organizations</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user?.create_organization_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user?.create_organization_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ability to create new organizations
                        </p>
                      </div>
                    </div>

                    {Object.keys(user?.public_metadata ?? {}).length > 0 && (
                      <div className="p-4 border rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground">
                          Public Metadata
                        </label>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <pre className="text-sm font-mono overflow-auto">
                            {JSON.stringify(user?.public_metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
