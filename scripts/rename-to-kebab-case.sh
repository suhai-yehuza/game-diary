#!/bin/bash

# Script to rename files to follow React/Next.js best practices
# - React Components: PascalCase
# - Utilities, Hooks, Services: camelCase
# - Types: camelCase
# - Config files: kebab-case

set -e

echo "Renaming files to follow React/Next.js naming conventions..."

# Function to rename a file if it exists and needs renaming
rename_file() {
    local old_name="$1"
    local new_name="$2"

    # Find the file in the project
    local file_path=$(find . -name "$old_name" -type f 2>/dev/null | grep -vE '/node_modules/|/\.next/|/dist/|/out/|/coverage/|/test-results-e2e/|/playwright-report/|/\.git/' | head -1)

    if [ -n "$file_path" ] && [ "$old_name" != "$new_name" ]; then
        local dir_path=$(dirname "$file_path")
        local new_path="$dir_path/$new_name"

        if [ -f "$new_path" ]; then
            echo "Warning: $new_path already exists, skipping $file_path"
            return
        fi

        if [ "$3" = "--dry-run" ]; then
            echo "  $file_path -> $new_path"
        else
            echo "Renaming: $file_path -> $new_path"
            git mv "$file_path" "$new_path"
        fi
    fi
}

# Function to rename all files
rename_all_files() {
    local dry_run="$1"
    local changed=false

    # Types (convert to camelCase)
    rename_file "constant.types.ts" "constantTypes.ts" "$dry_run"
    rename_file "component.types.ts" "componentTypes.ts" "$dry_run"
    rename_file "external.api.types.ts" "externalApiTypes.ts" "$dry_run"
    rename_file "infrastructure.types.ts" "infrastructureTypes.ts" "$dry_run"
    rename_file "core.types.ts" "coreTypes.ts" "$dry_run"
    rename_file "ui.types.ts" "uiTypes.ts" "$dry_run"
    rename_file "admin-experimental.types.ts" "adminExperimentalTypes.ts" "$dry_run"

    # Mock files (convert to camelCase)
    rename_file "live-games.mock.ts" "liveGamesMock.ts" "$dry_run"
    rename_file "nba-leagues.mock.ts" "nbaLeaguesMock.ts" "$dry_run"
    rename_file "nba-teams.mock.ts" "nbaTeamsMock.ts" "$dry_run"
    rename_file "nba-team-statistics.mock.ts" "nbaTeamStatisticsMock.ts" "$dry_run"
    rename_file "nba-standings.mock.ts" "nbaStandingsMock.ts" "$dry_run"
    rename_file "nba-game-statistics.mock.ts" "nbaGameStatisticsMock.ts" "$dry_run"
    rename_file "nba-games.mock.ts" "nbaGamesMock.ts" "$dry_run"
    rename_file "nba-player-statistics.mock.ts" "nbaPlayerStatisticsMock.ts" "$dry_run"
    rename_file "nba-players.mock.ts" "nbaPlayersMock.ts" "$dry_run"
    rename_file "nba-seasons.mock.ts" "nbaSeasonsMock.ts" "$dry_run"

    # Error files (convert to camelCase)
    rename_file "api.error.ts" "apiError.ts" "$dry_run"
}

# Main execution
if [ "$1" = "--dry-run" ]; then
    echo "DRY RUN - No files will be renamed"
    echo "Files that would be renamed:"
    rename_all_files "--dry-run"
else
    rename_all_files ""
    echo ""
    echo "All files renamed successfully!"
    echo ""
    echo "IMPORTANT: You need to update imports in your code files."
    echo "Run the following commands to find and update imports:"
    echo "grep -r 'from.*\.types' src/ --include='*.ts' --include='*.tsx'"
    echo "grep -r 'from.*\.mock' src/ --include='*.ts' --include='*.tsx'"
    echo "grep -r 'from.*\.error' src/ --include='*.ts' --include='*.tsx'"
fi
