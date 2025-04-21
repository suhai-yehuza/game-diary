'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation } from '@apollo/client';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SignInButton } from '@clerk/nextjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface CreateGameLogModalProps {
  gameId: string;
  userId: string;
}

export function CreateGameLogModal({ gameId, userId }: CreateGameLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [createGameLog, { loading }] = useMutation(CREATE_GAME_LOG);
  const { userId: authUserId } = useAuth();

  const [formData, setFormData] = useState({
    watched_setting: '',
    watched_date: new Date(),
    watched_location: '',
    rating_for_game: '',
    rating_stars: '',
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
      !formData.watched_setting ||
      !formData.watched_date ||
      !formData.watched_location ||
      !formData.rating_for_game
    ) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rating = Number(formData.rating_for_game);
      if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        toast({
          title: 'Invalid rating',
          description: 'Rating must be a whole number between 1 and 5',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        user_id: '060a5823-c5fa-4fd0-9065-0c0e5eecf9c8',
        // user_id: authUserId || userId,
        game_id: gameId,
        watched_setting: formData.watched_setting.toLowerCase(),
        watched_date: formData.watched_date.toISOString(),
        watched_location: formData.watched_location || 'Home',
        rating_for_game: rating,
        watched_count: 1,
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      const result = await createGameLog({
        variables: payload,
      });

      if (result.data?.create_game_log) {
        toast({
          title: '🎉 Success!',
          description: 'Game log successfully created',
          variant: 'success',
        });
        setFormData({
          watched_setting: '',
          watched_date: new Date(),
          watched_location: '',
          rating_for_game: '',
          rating_stars: '',
        });
        setIsOpen(false);
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
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Create a Game Log</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details about where and when you watched the game, along with your rating.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="watched_setting" className="text-gray-900 dark:text-white">
              Watched Setting *
            </Label>
            <Select
              value={formData.watched_setting}
              onValueChange={value => setFormData({ ...formData, watched_setting: value })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select where you watched the game" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="tv" className="text-gray-900 dark:text-white">
                  TV
                </SelectItem>
                <SelectItem value="arena" className="text-gray-900 dark:text-white">
                  Arena
                </SelectItem>
                <SelectItem value="phone" className="text-gray-900 dark:text-white">
                  Phone
                </SelectItem>
                <SelectItem value="laptop" className="text-gray-900 dark:text-white">
                  Laptop
                </SelectItem>
                <SelectItem value="bar" className="text-gray-900 dark:text-white">
                  Bar
                </SelectItem>
                <SelectItem value="home" className="text-gray-900 dark:text-white">
                  Home
                </SelectItem>
                <SelectItem value="other" className="text-gray-900 dark:text-white">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="watched_date" className="text-gray-900 dark:text-white">
              Date *
            </Label>
            <div className="relative">
              <DatePicker
                selected={formData.watched_date}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFormData({ ...formData, watched_date: date });
                  }
                }}
                showTimeSelect
                dateFormat="PPp"
                className="w-full pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                calendarClassName="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                timeClassName={() => 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="watched_location" className="text-gray-900 dark:text-white">
              Location *
            </Label>
            <Input
              id="watched_location"
              placeholder="Enter venue name"
              value={formData.watched_location}
              onChange={e => setFormData({ ...formData, watched_location: e.target.value })}
              required
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rating_for_game" className="text-gray-900 dark:text-white">
              Rating (1-5) *
            </Label>
            <Input
              id="rating_for_game"
              type="number"
              min="1"
              max="5"
              value={formData.rating_for_game}
              onChange={e => setFormData({ ...formData, rating_for_game: e.target.value })}
              required
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Cancel
            </Button>
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
