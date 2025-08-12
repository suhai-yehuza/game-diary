import { Eye, EyeOff, Lock, Users } from 'lucide-react';

import { CLASSIFICATION } from '@/lib/types';
import type { IClassificationIconProps } from '@/lib/types';

export const ClassificationIcon = ({ classification }: IClassificationIconProps) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return <Eye className="w-4 h-4 text-green-600" data-testid="eye-icon" />;
    case CLASSIFICATION.PROTECTED:
      return <Users className="w-4 h-4 text-yellow-600" data-testid="users-icon" />;
    case CLASSIFICATION.PRIVATE:
      return <Lock className="w-4 h-4 text-red-600" data-testid="lock-icon" />;
    default:
      return <EyeOff className="w-4 h-4 text-gray-400" data-testid="eye-off-icon" />;
  }
};
