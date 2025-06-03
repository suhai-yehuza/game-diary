#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapping of types to their source files
const typeMapping = {
  // Generated GraphQL types
  Resolvers: '@/lib/types/generated/graphql',
  User: '@/lib/types/generated/graphql',
  UserSummary: '@/lib/types/generated/graphql',
  TeamStats: '@/lib/types/generated/graphql',
  PlayerStats: '@/lib/types/generated/graphql',
  Comment: '@/lib/types/generated/graphql',
  Reaction: '@/lib/types/generated/graphql',
  Game: '@/lib/types/generated/graphql',
  GameLog: '@/lib/types/generated/graphql',
  Team: '@/lib/types/generated/graphql',
  Player: '@/lib/types/generated/graphql',

  // Context types
  Context: '@/lib/types/context.types',

  // Shared types
  APIConfigOptions: '@/lib/types/shared.types',
  StandingApiResponse: '@/lib/types/shared.types',
  LeaguesApiResponse: '@/lib/types/shared.types',
  BaseUser: '@/lib/types/shared.types',
  DEFAULT_PAGE_SIZE: '@/lib/types/shared.types',
  MAX_PAGE_SIZE: '@/lib/types/shared.types',
  DEFAULT_SORT_DIRECTION: '@/lib/types/shared.types',

  // API types
  SeasonApiResponse: '@/lib/types/api.types',
  APIResponse: '@/lib/types/api.types',
  APIError: '@/lib/types/api.types',
  ValidationResult: '@/lib/types/api.types',
  ValidationRule: '@/lib/types/api.types',
  APIRequestOptions: '@/lib/types/api.types',
  APIClient: '@/lib/types/api.types',
  RateLimitConfig: '@/lib/types/api.types',
  CacheConfig: '@/lib/types/api.types',
  APIMetrics: '@/lib/types/api.types',
  APIParameters: '@/lib/types/api.types',

  // Game types
  GameApiResponse: '@/lib/types/game.types',
  GameWithStats: '@/lib/types/game.types',
  GameWithDetails: '@/lib/types/game.types',
  SearchGame: '@/lib/types/game.types',
  ExtendedGame: '@/lib/types/game.types',
  TransformedGame: '@/lib/types/game.types',
  ProcessedGameData: '@/lib/types/game.types',
  GameQueryResult: '@/lib/types/game.types',

  // Team types
  ApiTeamResponse: '@/lib/types/consolidated.types',
  ApiTeam: '@/lib/types/consolidated.types',
  TeamDisplayStats: '@/lib/types/consolidated.types',
  TeamCounts: '@/lib/types/consolidated.types',

  // User types
  ClerkUserData: '@/lib/types/user.types',
  ClerkDeletedUserData: '@/lib/types/user.types',
  UserSearchProps: '@/lib/types/user.types',
  UserProfileProps: '@/lib/types/user.types',
  UserPageProps: '@/lib/types/user.types',
  UsersTableProps: '@/lib/types/user.types',

  // Config types
  REACTION_EMOJIS: '@/lib/types/config.types',
  FRIENDSHIP_STATUS: '@/lib/types/config.types',
  WATCHED_SETTING: '@/lib/types/config.types',
  CLASSIFICATION: '@/lib/types/config.types',
  GAME_STATUS_VALUES: '@/lib/types/config.types',
  ReactionEmojiType: '@/lib/types/config.types',
  ReactionEmojiValue: '@/lib/types/config.types',

  // Notification types
  AppNotification: '@/lib/types/notification.types',
  NotificationContextType: '@/lib/types/notification.types',

  // Auth types
  AuthContextType: '@/lib/types/auth.types',

  // Activity types
  ActivityTimelineProps: '@/lib/types/activity.types',
  TimeFilter: '@/lib/types/activity.types',
  ActivityType: '@/lib/types/activity.types',
  FriendActivityProps: '@/lib/types/activity.types',

  // Friend types
  Friend: '@/lib/types/friend.types',
  FriendGroup: '@/lib/types/friend.types',
  FriendGroupsProps: '@/lib/types/friend.types',
  FriendProfileProps: '@/lib/types/friend.types',
  FriendRequestButtonProps: '@/lib/types/friend.types',
  GetFriendshipsForUserResponse: '@/lib/types/friend.types',

  // GameLog types
  GameLogFormData: '@/lib/types/game-log.types',
  GameLogFormProps: '@/lib/types/game-log.types',
  GameLogViewProps: '@/lib/types/game-log.types',
  GameLogResponse: '@/lib/types/game-log.types',
  GameLogModalProps: '@/lib/types/game-log.types',
  CommentResponse: '@/lib/types/gamelog.types',

  // Comment types
  EditingComment: '@/lib/types/comment.types',
  CommentsSectionProps: '@/lib/types/comment.types',

  // Reaction types
  ReactionPickerProps: '@/lib/types/reaction.types',

  // Form types
  FormFieldContextValue: '@/lib/types/form.types',
  FormItemContextValue: '@/lib/types/form.types',

  // Toast types
  ToastProps: '@/lib/types/toast.types',
  ToastActionElement: '@/lib/types/toast.types',
  ToasterToast: '@/lib/types/toast.types',
  State: '@/lib/types/toast.types',
  Action: '@/lib/types/toast.types',

  // Consolidated types
  PlayerApiResponse: '@/lib/types/consolidated.types',
  GameCardProps: '@/lib/types/consolidated.types',
  GamesListProps: '@/lib/types/consolidated.types',
  NavItem: '@/lib/types/consolidated.types',

  // GraphQL types
  CommentRecord: '@/lib/types/graphql.types',
  ReactionRecord: '@/lib/types/graphql.types',
  DataLoaders: '@/lib/types/graphql.types',

  // Database types
  DatabaseClient: '@/lib/types/db.types',
  DatabaseConfig: '@/lib/types/db.types',
  BaseDatabaseClient: '@/lib/types/db.types',
  envSchema: '@/lib/types/db.types',

  // Cache types
  CACHE_TTL: '@/lib/types/cache.types',
  RedisClient: '@/lib/types/redis.types',
  RedisClientType: '@/lib/types/redis.types',

  // Validation types
  teamSchema: '@/lib/types/validation.types',
  TeamInput: '@/lib/types/validation.types',

  // Enum values
  GAME_TYPE: '@/lib/db/schema/enum-values',
  USER_ROLE: '@/lib/db/schema/enum-values',
  NOTIFICATION_TYPE: '@/lib/db/schema/enum-values',
  REACTION_TYPE: '@/lib/db/schema/enum-values',
  GameStatusValue: '@/lib/db/schema/enum-values',
  NotificationTypeValue: '@/lib/db/schema/enum-values',
  ReactionTypeValue: '@/lib/db/schema/enum-values',
};

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file imports from @/lib/types
    if (!content.includes("from '@/lib/types'")) {
      return false;
    }

    console.log(`Updating imports in: ${filePath}`);

    // Replace the import
    const updatedContent = content.replace(
      /from ['"]@\/lib\/types['"];?/g,
      "from '@/lib/types/generated/graphql';"
    );

    fs.writeFileSync(filePath, updatedContent);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = findTsFiles(srcDir);

  let updatedCount = 0;

  for (const file of tsFiles) {
    if (updateImportsInFile(file)) {
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} files`);
}

if (require.main === module) {
  main();
}
