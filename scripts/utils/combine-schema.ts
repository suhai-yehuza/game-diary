import fs from 'fs';
import path from 'path';

import { logger } from 'lib/core/logger';

const SCHEMA_DIR = path.join(process.cwd(), 'src/lib/graphql/schema');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/graphql/schema.graphql');

function combineSchemaFiles() {
  const schemaFiles = [
    'common.graphql',
    'user.graphql',
    'game.graphql',
    'team.graphql',
    'root.graphql',
  ];

  const combinedSchema = schemaFiles
    .map(file => {
      const filePath = path.join(SCHEMA_DIR, file);
      return fs.readFileSync(filePath, 'utf-8');
    })
    .join('\n\n');

  fs.writeFileSync(OUTPUT_FILE, combinedSchema);
  logger.info('Schema files combined successfully!');
}

combineSchemaFiles();
