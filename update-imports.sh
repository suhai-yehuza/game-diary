#!/bin/bash

# Find all TypeScript files that import from consolidated.types
echo "Updating imports from consolidated.types.ts to index.ts"
grep -l "from '.*consolidated.types'" $(find src -type f -name "*.ts" -o -name "*.tsx") | while read file; do
  echo "Updating $file"
  # Replace imports from consolidated.types with imports from index
  sed -i '' "s|from '.*consolidated.types'|from '@/lib/types'|g" "$file"
done

# Update direct imports from type files to use the index
echo "Updating direct imports to use the index.ts barrel file"
for type_file in constants.types external.api.types friendship.types game.types gamelog.types notification.types team.types toast.types user.types utility.types redis.types graphql.types db.types api.types schema.types; do
  grep -l "from '.*$type_file'" $(find src -type f -name "*.ts" -o -name "*.tsx") | while read file; do
    if [[ "$file" != src/lib/types/* ]]; then  # Skip files in the types directory
      echo "Updating $file"
      # Replace imports from specific type files with imports from index
      sed -i '' "s|from '.*$type_file'|from '@/lib/types'|g" "$file"
    fi
  done
done

# Also update generated/graphql imports
grep -l "from '.*types/generated/graphql'" $(find src -type f -name "*.ts" -o -name "*.tsx") | while read file; do
  if [[ "$file" != src/lib/types/* ]]; then  # Skip files in the types directory
    echo "Updating $file"
    # Replace imports from generated/graphql with imports from index
    sed -i '' "s|from '.*types/generated/graphql'|from '@/lib/types'|g" "$file"
  fi
done

# Update imports for hook types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*UseSwipeActionsOptions.*from.*@\/lib\/types/import { UseSwipeActionsOptions } from "@\/lib\/types\/hook.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*UsePullToRefreshOptions.*from.*@\/lib\/types/import { UsePullToRefreshOptions } from "@\/lib\/types\/hook.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*UseMutationWithOptimisticUpdateOptions.*from.*@\/lib\/types/import { UseMutationWithOptimisticUpdateOptions } from "@\/lib\/types\/hook.types"/g'

# Update imports for monitoring types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*MonitoringMetrics.*from.*@\/lib\/types/import { MonitoringMetrics } from "@\/lib\/types\/monitoring.types"/g'

# Update imports for API request types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*ExtendedNextApiRequest.*from.*@\/lib\/types/import { ExtendedNextApiRequest } from "@\/lib\/types\/api-request.types"/g'

# Update imports for API response types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*PlayerApiResponse.*from.*@\/lib\/types/import { PlayerApiResponse } from "@\/lib\/types\/api-response.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*SeasonApiResponse.*from.*@\/lib\/types/import { SeasonApiResponse } from "@\/lib\/types\/api-response.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*TeamApiResponse.*from.*@\/lib\/types/import { TeamApiResponse } from "@\/lib\/types\/api-response.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*PlayerStatistics.*from.*@\/lib\/types/import { PlayerStatistics } from "@\/lib\/types\/api-response.types"/g'

# Update imports for common types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*SortDirection.*from.*@\/lib\/types/import { SortDirection } from "@\/lib\/types\/common.types"/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import.*TargetType.*from.*@\/lib\/types/import { TargetType } from "@\/lib\/types\/common.types"/g'

echo "Update complete. Please check for any remaining issues." 