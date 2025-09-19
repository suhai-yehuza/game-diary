'use client';

import { ExternalLink, Calendar, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Card, CardContent } from '@/app/components/ui/Card';
import type { INBANewsItem, INBANewsProps } from '@/types';

// Mock NBA news data (in a real app, this would come from a news API)
const MOCK_NBA_NEWS: INBANewsItem[] = [
  {
    id: '1',
    title: 'LeBron James Sets New NBA Scoring Record',
    description:
      "Lakers star LeBron James has broken the all-time NBA scoring record, surpassing Kareem Abdul-Jabbar's previous mark of 38,387 points.",
    url: 'https://www.nba.com/',
    publishedAt: '2024-01-15T10:30:00Z',
    source: 'NBA.com',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    title: 'Warriors vs Celtics: Championship Rematch Preview',
    description:
      "The Golden State Warriors and Boston Celtics face off in a highly anticipated rematch of last year's NBA Finals.",
    url: 'https://www.espn.com/',
    publishedAt: '2024-01-14T15:45:00Z',
    source: 'ESPN',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    title: 'Rookie Sensation Victor Wembanyama Dominates',
    description:
      'San Antonio Spurs rookie Victor Wembanyama continues to impress with his unique combination of size, skill, and basketball IQ.',
    url: 'https://www.si.com/',
    publishedAt: '2024-01-13T12:20:00Z',
    source: 'Sports Illustrated',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
  },
  {
    id: '4',
    title: 'Trade Deadline: Major Moves Expected',
    description:
      'With the NBA trade deadline approaching, several teams are reportedly looking to make significant roster changes.',
    url: 'https://www.bleacherreport.com/',
    publishedAt: '2024-01-12T09:15:00Z',
    source: 'Bleacher Report',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
  },
  {
    id: '5',
    title: 'Injury Update: Key Players Return to Action',
    description:
      'Several star players are set to return from injuries, potentially shifting the playoff race in both conferences.',
    url: 'https://www.foxsports.com/',
    publishedAt: '2024-01-11T14:30:00Z',
    source: 'NBA.com',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=250&fit=crop',
  },
  {
    id: '6',
    title: 'All-Star Game: Fan Voting Begins',
    description:
      'NBA All-Star Game fan voting is now open, with fans able to select their favorite players for the annual showcase.',
    url: 'https://www.cbssports.com/',
    publishedAt: '2024-01-10T11:00:00Z',
    source: 'NBA.com',
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=250&fit=crop',
  },
];

export function NBANews({ limit = 6 }: INBANewsProps) {
  const [news, setNews] = useState<INBANewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, this would fetch from a news API
        // For now, we'll use mock data
        setNews(MOCK_NBA_NEWS.slice(0, limit));
      } catch (_err) {
        setError('Failed to load NBA news');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchNews();
  }, [limit]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'TBD';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'TBD';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit }, (_, i) => (
          <Card key={`loading-skeleton-${i}`} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-bg-theme-secondary rounded-lg mb-4" />
              <div className="h-4 bg-bg-theme-secondary rounded mb-2" />
              <div className="h-4 bg-bg-theme-secondary rounded mb-2 w-3/4" />
              <div className="h-3 bg-bg-theme-secondary rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-semantic-error mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-semantic-error text-text-inverse rounded-md hover:bg-semantic-error/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map(item => (
        <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-0">
            {item.imageUrl && (
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={item.id === '1'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 text-white text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{item.source}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs news-meta-text mb-3">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.publishedAt)}</span>
                <Clock className="w-3 h-3 ml-2" />
                <span>{formatTimeAgo(item.publishedAt)}</span>
              </div>

              <h3 className="font-semibold news-title mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-sm news-description mb-4 line-clamp-3">{item.description}</p>

              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
              >
                Read More
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
