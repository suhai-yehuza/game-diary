import fs from 'fs';
import path from 'path';

import { REACTION_EMOJIS } from '../src/lib/types/config.types';

const generateMigrationFiles = () => {
  const emojis = Object.values(REACTION_EMOJIS)
    .map(emoji => `'${emoji}'`)
    .join(', ');

  // Read all migration files
  const drizzleDir = path.join(process.cwd(), 'drizzle');
  const files = fs.readdirSync(drizzleDir).filter(file => file.endsWith('.sql'));

  files.forEach(file => {
    const filePath = path.join(drizzleDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the reaction_emoji enum definition if it exists
    const enumRegex = /CREATE TYPE "public"."reaction_emoji" AS ENUM\([^)]+\);/;
    if (enumRegex.test(content)) {
      content = content.replace(
        enumRegex,
        `CREATE TYPE "public"."reaction_emoji" AS ENUM(${emojis});`
      );
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file} successfully!`);
    }
  });
};

generateMigrationFiles();
