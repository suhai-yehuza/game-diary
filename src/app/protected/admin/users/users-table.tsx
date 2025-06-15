'use client';

import Image from 'next/image';
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/app/components/ui/table';
import type { DbUser } from '@src/lib/types/generated/graphql';
import type { IUsersTableProps } from '@src/lib/types/user.types';

export default function UsersTable({ users }: IUsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Security</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: DbUser) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  {user.imageUrl && (
                    <Image
                      src={user.imageUrl || '/default-avatar.png'}
                      alt={user.username ?? 'User avatar'}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                    />
                  )}
                  <span>{user.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{user.emailAddress}</p>
                  {!user.email_verified && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">Unverified</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${user.password_enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <span className="text-xs">Password</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${user.two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <span className="text-xs">2FA</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.banned
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-green-500/10 text-green-500'
                  }`}
                >
                  {user.banned ? 'Banned' : 'Active'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
