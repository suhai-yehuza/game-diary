import { REACTION_EMOJIS } from '@src/lib/types/config.types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate the ReactionEmojiType enum from REACTION_EMOJIS
const generateReactionEmojiTypeEnum = () => {
  const enumValues = Object.keys(REACTION_EMOJIS)
    .map(key => `  ${key}`)
    .join('\n');

  return `enum ReactionEmojiType {\n${enumValues}\n}`;
};

// Read the root schema file
const rootSchemaPath = path.join(__dirname, 'root.graphql');
const rootSchema = fs.readFileSync(rootSchemaPath, 'utf-8');

// Replace the existing ReactionEmojiType enum with the generated one
const updatedSchema = rootSchema.replace(
  /enum ReactionEmojiType \{[\s\S]*?\}/,
  generateReactionEmojiTypeEnum()
);

// Write the updated schema back to the file
fs.writeFileSync(rootSchemaPath, updatedSchema);
