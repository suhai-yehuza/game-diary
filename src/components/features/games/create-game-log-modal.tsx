'use client';

import { useMutation } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { Calendar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/lib/types/config.types';
import type {
  ClassificationValue,
  WatchedSettingValue,
  WatchedScopeValue,
} from '@/lib/types/config.types';

import 'react-datepicker/dist/react-datepicker.css';

interface CreateGameLogModalProps {
  gameId?: string;
  userId?: string;
  onSuccess?: () => void;
}

interface FormData {
  classification: ClassificationValue;
  watchedSetting: WatchedSettingValue;
  watchedScope: WatchedScopeValue;
  watchedDate: Date;
  watchedLocation: string;
  ratingForGame: string;
  ratingStars: number;
  notes: string;
  tags: string[];
}

export function CreateGameLogModal({ gameId, onSuccess }: CreateGameLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [createGameLog, { loading }] = useMutation(CREATE_GAME_LOG);
  const { user } = useAuthContext();
  const authUserId = user?.id;

  const [formData, setFormData] = useState<FormData>({
    classification: CLASSIFICATION.PROTECTED,
    watchedSetting: WATCHED_SETTING.TV,
    watchedScope: WATCHED_SCOPE.FULL_GAME,
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: '',
    ratingStars: 3,
    notes: '',
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a game log',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (
      !formData.watchedSetting ||
      !formData.watchedDate ||
      !formData.watchedLocation ||
      !formData.ratingForGame
    ) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rating = Number(formData.ratingForGame);
      if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        toast({
          title: 'Invalid rating',
          description: 'Rating must be a whole number between 1 and 5',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        userId: authUserId,
        gameId: gameId,
        classification: formData.classification,
        watchedScope: formData.watchedScope,
        watchedSetting: formData.watchedSetting,
        watchedDate: formData.watchedDate.toISOString(),
        watchedLocation: formData.watchedLocation,
        ratingForGame: rating,
        notes: formData.notes,
        tags: formData.tags,
      };

      const result = await createGameLog({
        variables: payload,
      });

      if (result.data?.create_game_log) {
        toast({
          title: '🎉 Success!',
          description: 'Game log successfully created',
          variant: 'default',
        });
        setFormData({
          classification: CLASSIFICATION.PROTECTED,
          watchedSetting: WATCHED_SETTING.TV,
          watchedScope: WATCHED_SCOPE.FULL_GAME,
          watchedDate: new Date(),
          watchedLocation: '',
          ratingForGame: '',
          ratingStars: 3,
          notes: '',
          tags: [],
        });
        setIsOpen(false);
        onSuccess?.();
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating game log:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game log. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!authUserId) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Sign in to Create Game Log
        </Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Create a Game Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-gray-900 dark:text-white">Create a Game Log</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details about where and when you watched the game, along with your rating.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="classification" className="text-gray-900 dark:text-white">
              Classification *
            </Label>
            <Select
              value={formData.classification}
              onValueChange={(value: ClassificationValue) =>
                setFormData({ ...formData, classification: value })
              }
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {Object.entries(CLASSIFICATION).map(([key, value]) => (
                  <SelectItem key={key} value={value} className="text-gray-900 dark:text-white">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="watchedSetting" className="text-gray-900 dark:text-white">
              Watched Setting *
            </Label>
            <Select
              value={formData.watchedSetting}
              onValueChange={(value: WatchedSettingValue) =>
                setFormData({ ...formData, watchedSetting: value })
              }
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select where you watched the game" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {Object.entries(WATCHED_SETTING).map(([key, value]) => (
                  <SelectItem key={key} value={value} className="text-gray-900 dark:text-white">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="watchedScope" className="text-gray-900 dark:text-white">
              Watched Scope *
            </Label>
            <Select
              value={formData.watchedScope}
              onValueChange={(value: WatchedScopeValue) =>
                setFormData({ ...formData, watchedScope: value })
              }
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {Object.entries(WATCHED_SCOPE).map(([key, value]) => (
                  <SelectItem key={key} value={value} className="text-gray-900 dark:text-white">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="watchedDate" className="text-gray-900 dark:text-white">
              Date *
            </Label>
            <div className="relative">
              <DatePicker
                selected={formData.watchedDate}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFormData({ ...formData, watchedDate: date });
                  }
                }}
                dateFormat="MMMM d, yyyy"
                className="w-full pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                calendarClassName="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="watchedLocation" className="text-gray-900 dark:text-white">
              Location *
            </Label>
            <Input
              id="watchedLocation"
              placeholder="Enter venue name"
              value={formData.watchedLocation}
              onChange={e => setFormData({ ...formData, watchedLocation: e.target.value })}
              required
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rating" className="text-gray-900 dark:text-white">
              Rating *
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={formData.ratingStars} size="lg" />
                <span className="text-lg font-medium">{formData.ratingStars}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    type="button"
                    variant={formData.ratingStars === star ? 'default' : 'outline'}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        ratingStars: star,
                        ratingForGame: star.toString(),
                      })
                    }
                    className="w-8 h-8 p-0"
                  >
                    ★
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-gray-900 dark:text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Share your thoughts about the game..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? 'Creating...' : 'Create Log'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
