import { Eye, EyeOff, Lock, Users } from 'lucide-react';

import { CLASSIFICATION } from '@/types';
import type { IClassificationIconProps } from '@/types';

export const ClassificationIcon = ({ classification }: IClassificationIconProps) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return <Eye className="w-4 h-4 text-semantic-success" data-testid="eye-icon" />;
    case CLASSIFICATION.PROTECTED:
      return <Users className="w-4 h-4 text-semantic-warning" data-testid="users-icon" />;
    case CLASSIFICATION.PRIVATE:
      return <Lock className="w-4 h-4 text-semantic-error" data-testid="lock-icon" />;
    default:
      return <EyeOff className="w-4 h-4 text-neutral-400" data-testid="eye-off-icon" />;
  }
};
