'use client';

import { UserPlus, UserCheck, UserX, UserMinus, Clock } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { useFriendRequestMutations } from '@/hooks/use-friendships';
import { buttonVariants } from '@/lib/utils/component-variants';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { FriendshipActionButtonProps } from '@/types';
import { ErrorCategory, ErrorSeverity } from '@/types';

export function FriendshipActionButton({
  userId,
  friendshipStatus,
  onStatusChange,
  className = '',
}: FriendshipActionButtonProps) {
  const [isOperating, setIsOperating] = useState(false);
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } =
    useFriendRequestMutations();

  const handleSendFriendRequest = useCallback(async () => {
    if (isOperating) return;

    setIsOperating(true);
    try {
      await sendFriendRequest({
        variables: { userId },
        context: {
          component: 'FriendshipActionButton',
          action: 'Send friend request',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('Friend request sent!');
      onStatusChange?.();
    } catch (error) {
      errorHandlers.api(error as Error, {
        component: 'FriendshipActionButton',
        action: 'Send friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to send friend request');
    } finally {
      setIsOperating(false);
    }
  }, [sendFriendRequest, userId, onStatusChange, isOperating]);

  const handleAcceptFriendRequest = useCallback(async () => {
    if (isOperating || !friendshipStatus?.friendshipId) return;

    setIsOperating(true);
    try {
      await acceptFriendRequest({
        variables: { friendshipId: friendshipStatus.friendshipId },
        context: {
          component: 'FriendshipActionButton',
          action: 'Accept friend request',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('Friend request accepted!');
      onStatusChange?.();
    } catch (error) {
      errorHandlers.api(error as Error, {
        component: 'FriendshipActionButton',
        action: 'Accept friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to accept friend request');
    } finally {
      setIsOperating(false);
    }
  }, [acceptFriendRequest, friendshipStatus?.friendshipId, onStatusChange, isOperating]);

  const handleRejectFriendRequest = useCallback(async () => {
    if (isOperating || !friendshipStatus?.friendshipId) return;

    setIsOperating(true);
    try {
      await rejectFriendRequest({
        variables: { friendshipId: friendshipStatus.friendshipId },
        context: {
          component: 'FriendshipActionButton',
          action: 'Reject friend request',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('Friend request rejected');
      onStatusChange?.();
    } catch (error) {
      errorHandlers.api(error as Error, {
        component: 'FriendshipActionButton',
        action: 'Reject friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to reject friend request');
    } finally {
      setIsOperating(false);
    }
  }, [rejectFriendRequest, friendshipStatus?.friendshipId, onStatusChange, isOperating]);

  const handleRemoveFriend = useCallback(async () => {
    if (isOperating || !friendshipStatus?.friendshipId) return;

    setIsOperating(true);
    try {
      await removeFriend({
        variables: { friendshipId: friendshipStatus.friendshipId },
        context: {
          component: 'FriendshipActionButton',
          action: 'Remove friend',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('Friend removed');
      onStatusChange?.();
    } catch (error) {
      errorHandlers.api(error as Error, {
        component: 'FriendshipActionButton',
        action: 'Remove friend',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to remove friend');
    } finally {
      setIsOperating(false);
    }
  }, [removeFriend, friendshipStatus?.friendshipId, onStatusChange, isOperating]);

  const handleCancelFriendRequest = useCallback(async () => {
    if (isOperating || !friendshipStatus?.friendshipId) return;

    setIsOperating(true);
    try {
      await removeFriend({
        variables: { friendshipId: friendshipStatus.friendshipId },
        context: {
          component: 'FriendshipActionButton',
          action: 'Cancel friend request',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('Friend request cancelled');
      onStatusChange?.();
    } catch (error) {
      errorHandlers.api(error as Error, {
        component: 'FriendshipActionButton',
        action: 'Cancel friend request',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      toast.error('Failed to cancel friend request');
    } finally {
      setIsOperating(false);
    }
  }, [removeFriend, friendshipStatus?.friendshipId, onStatusChange, isOperating]);

  const getButtonContent = () => {
    if (isOperating) {
      return {
        icon: Clock,
        text: 'Processing...',
        variant: 'secondary' as const,
        disabled: true,
        className: 'bg-gray-500 hover:bg-gray-500 text-white',
      };
    }

    if (!friendshipStatus) {
      return {
        icon: UserPlus,
        text: 'Add Friend',
        variant: 'default' as const,
        disabled: false,
        onClick: handleSendFriendRequest,
        className: buttonVariants.variant.primary,
      };
    }

    switch (friendshipStatus.status) {
      case 'PENDING':
        if (friendshipStatus.isInitiator) {
          return {
            icon: UserX,
            text: 'Cancel Request',
            variant: 'destructive' as const,
            disabled: false,
            onClick: handleCancelFriendRequest,
            className: 'bg-orange-600 hover:bg-orange-700 text-white',
          };
        } else {
          return {
            icon: UserCheck,
            text: 'Accept Request',
            variant: 'default' as const,
            disabled: false,
            onClick: handleAcceptFriendRequest,
            className: 'bg-green-600 hover:bg-green-700 text-white',
          };
        }
      case 'ACCEPTED':
        return {
          icon: UserMinus,
          text: 'Unfriend',
          variant: 'destructive' as const,
          disabled: false,
          onClick: handleRemoveFriend,
          className: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'REJECTED':
        return {
          icon: UserPlus,
          text: 'Add Friend',
          variant: 'default' as const,
          disabled: false,
          onClick: handleSendFriendRequest,
          className: buttonVariants.variant.primary,
        };
      default:
        return {
          icon: UserPlus,
          text: 'Add Friend',
          variant: 'default' as const,
          disabled: false,
          onClick: handleSendFriendRequest,
          className: buttonVariants.variant.primary,
        };
    }
  };

  const buttonContent = getButtonContent();
  const Icon = buttonContent.icon;

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={() => void buttonContent.onClick?.()}
        disabled={buttonContent.disabled}
        variant={buttonContent.variant}
        size="lg"
        className={`flex items-center gap-2 ${buttonContent.className || ''}`}
      >
        <Icon className="w-4 h-4" />
        {buttonContent.text}
      </Button>

      {friendshipStatus?.status === 'PENDING' && !friendshipStatus.isInitiator && (
        <Button
          onClick={() => void handleRejectFriendRequest()}
          disabled={isOperating}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
        >
          <UserX className="w-4 h-4" />
          Reject
        </Button>
      )}
    </div>
  );
}
