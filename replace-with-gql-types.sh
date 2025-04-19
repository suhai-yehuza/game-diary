#!/bin/bash

GENERATED_FILE="src/lib/types/generated/graphql.ts"
TYPES_DIR="src/lib/types"

# List of domain type files to update (add more as needed)
FILES=(
  "./enums.types.ts"
  "./constants.types.ts"
  "./friendship.types.ts"
  "./game.types.ts"
  "./gamelog.types.ts"
  "./notification.types.ts"
  "./team.types.ts"
  "./toast.types.ts"
  "./user.types.ts"
  "./utility.types.ts"
)

for FILE in "${FILES[@]}"; do
  # For each exported type/interface in the file
  grep -E '^export (type|interface) [A-Za-z0-9_]+' "$TYPES_DIR/$FILE" | while read -r line; do
    NAME=$(echo "$line" | awk '{print $3}' | sed 's/[:{<].*//')
    if grep -qE "export (type|interface|enum) $NAME\\b" "$GENERATED_FILE"; then
      # Remove the old type/interface block
      sed -i '' "/^export type $NAME /,/^}/d" "$TYPES_DIR/$FILE"
      sed -i '' "/^export interface $NAME /,/^}/d" "$TYPES_DIR/$FILE"
      # Add the alias at the top
      sed -i '' "1i\\
export type $NAME = import('./generated/graphql').$NAME;
" "$TYPES_DIR/$FILE"
      echo "Replaced $NAME in $FILE with generated type."
    fi
  done
done

echo "Replacement complete. Please review the files for any manual tweaks."