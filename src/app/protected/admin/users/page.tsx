'use client';

import { useUser } from '@clerk/nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import { UserSearch } from '@/app/protected/admin/search/UserSearch';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DBUser } from '@/lib/types/generated/graphql';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
const ITEMS_PER_PAGE = 20;

function AdminUsersContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoaded) return;

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const emailAddress = user?.emailAddresses[0].emailAddress;
    if (!emailAddress || !adminEmails.includes(emailAddress)) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        logger.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, isLoaded, router]);

  // Reset to first page when filtered users change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (userId: string) => {
    router.push(`/protected/admin/user/${userId}`);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserSearch users={users} onFilteredUsersChange={setFilteredUsers} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of all users in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow
                key={user.id}
                onClick={() => handleRowClick(user.id)}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-orange-500/50 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-sm"
              >
                <TableCell className="text-muted-foreground">{startIndex + index + 1}</TableCell>
                <TableCell>
                  {`${user.firstName || 'missing-first-name'} ${user.lastName || 'missing-last-name'}`}
                </TableCell>
                <TableCell>{user.emailAddress || 'missing-email-address'}</TableCell>
                <TableCell>{new Date(user.createdAt ?? '').toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
