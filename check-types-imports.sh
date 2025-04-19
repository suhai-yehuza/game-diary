#!/bin/bash

# This script checks for any imports that directly access types files
# instead of going through the index.ts barrel file

echo "Checking for direct imports from type files..."

# Look for imports from type files (excluding imports within the types directory)
found_direct_imports=false

# Check all TypeScript files
for type_file in constants.types external.api.types friendship.types game.types gamelog.types notification.types team.types toast.types user.types utility.types redis.types graphql.types db.types api.types schema.types generated/graphql; do
  direct_imports=$(grep -l "from '.*$type_file'" $(find src -type f -name "*.ts" -o -name "*.tsx") | grep -v "src/lib/types")
  
  if [ -n "$direct_imports" ]; then
    found_direct_imports=true
    echo "⚠️ Found direct imports from $type_file in:"
    echo "$direct_imports" | sed 's/^/  - /'
  fi
done

if [ "$found_direct_imports" = true ]; then
  echo ""
  echo "❌ Found direct imports from type files. These should be updated to import from @/lib/types instead."
  echo "Run ./update-imports.sh to fix these issues."
  exit 1
else
  echo "✅ No direct imports from type files found. All imports are using the barrel pattern correctly."
  exit 0
fi 