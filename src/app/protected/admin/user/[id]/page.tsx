'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { DBUser } from '@/lib/types/generated/graphql';
export default function AdminUserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user: currentUser, isLoaded } = useUser();
  const router = useRouter();
  const [user, setUser] = useState<DBUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const emailAddress = currentUser?.emailAddresses[0].emailAddress;
    if (!emailAddress || !adminEmails.includes(emailAddress)) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        logger.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [currentUser, isLoaded, router, id]);

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button onClick={() => router.push('/protected/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt={user.username || 'User avatar'}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              {user.emailAddress && <p className="text-gray-600">{user.emailAddress}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h2 className="mb-2 text-lg font-semibold">Account Information</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm">{user.id}</dd>
                </div>
                {user.createdAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="text-sm">{new Date(user.createdAt).toLocaleString()}</dd>
                  </div>
                )}
                {user.updatedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm">{new Date(user.updatedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div>User not found</div>
      )}
    </div>
  );
}
