import { REACTION_EMOJIS, isReactionEmojiKey } from '@src/lib/types/config.types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from 'lib/core/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate the ReactionEmojiType enum from REACTION_EMOJIS
const generateReactionEmojiTypeEnum = () => {
  // Validate that all keys are valid
  const keys = Object.keys(REACTION_EMOJIS);
  const invalidKeys = keys.filter(key => !isReactionEmojiKey(key));

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid reaction emoji keys found: ${invalidKeys.join(', ')}`);
  }

  const enumValues = keys.map(key => `  ${key}`).join('\n');

  return `enum ReactionEmojiType {\n${enumValues}\n}`;
};

// Validate the generated schema
const validateGeneratedSchema = (schema: string) => {
  // Check if the enum is properly formatted
  const enumRegex = /enum ReactionEmojiType \{[\s\S]*?\}/;
  if (!enumRegex.test(schema)) {
    throw new Error('Generated schema is missing ReactionEmojiType enum');
  }

  // Check if all REACTION_EMOJIS keys are present in the enum
  const enumValues = schema.match(/enum ReactionEmojiType \{([\s\S]*?)\}/)?.[1] || '';
  const definedKeys = Object.keys(REACTION_EMOJIS);
  const missingKeys = definedKeys.filter(key => !enumValues.includes(key));

  if (missingKeys.length > 0) {
    throw new Error(`Missing reaction emoji keys in schema: ${missingKeys.join(', ')}`);
  }
};

// Read the root schema file
const rootSchemaPath = path.join(__dirname, 'root.graphql');
const rootSchema = fs.readFileSync(rootSchemaPath, 'utf-8');

try {
  // Generate the new enum
  const newEnum = generateReactionEmojiTypeEnum();

  // Replace the existing ReactionEmojiType enum with the generated one
  const updatedSchema = rootSchema.replace(/enum ReactionEmojiType \{[\s\S]*?\}/, newEnum);

  // Validate the updated schema
  validateGeneratedSchema(updatedSchema);

  // Write the updated schema back to the file
  fs.writeFileSync(rootSchemaPath, updatedSchema);

  logger.log('Successfully updated ReactionEmojiType enum in schema');
} catch (error) {
  logger.error('Error updating schema:', error);
  process.exit(1);
}
