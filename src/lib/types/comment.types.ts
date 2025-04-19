import type { Comment } from './generated/graphql';

export type { Comment };

export type EditingComment = { id: string; content: string };

export interface CommentsSectionProps {
  parent_id: string;
  parent_type: string;
}
