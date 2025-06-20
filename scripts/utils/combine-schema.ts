import fs from 'fs';
import path from 'path';

import { logger } from '@lib/core/logger';

import { parseScriptArgs } from '../shared/script-utils';

const SCHEMA_DIR = path.join(process.cwd(), 'src/lib/graphql/schema');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/graphql/schema.graphql');

function combineSchemaFiles() {
  try {
    const options = parseScriptArgs();
    logger.info(`🔍 Combining schema files in ${options.environment} environment...`);

    const schemaFiles = [
      'common.graphql',
      'user.graphql',
      'game.graphql',
      'team.graphql',
      'root.graphql',
    ];

    // Check if schema directory exists
    if (!fs.existsSync(SCHEMA_DIR)) {
      throw new Error(`Schema directory not found: ${SCHEMA_DIR}`);
    }

    // Check if all schema files exist
    const missingFiles = schemaFiles.filter(file => !fs.existsSync(path.join(SCHEMA_DIR, file)));
    if (missingFiles.length > 0) {
      throw new Error(`Missing schema files: ${missingFiles.join(', ')}`);
    }

    const combinedSchema = schemaFiles
      .map(file => {
        const filePath = path.join(SCHEMA_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content.trim()) {
          logger.warn(`Warning: Empty schema file: ${file}`);
        }
        return content;
      })
      .join('\n\n');

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, combinedSchema);
    logger.info('✅ Schema files combined successfully!');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error combining schema files:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error combining schema files:', String(error));
    }
    process.exit(1);
  }
}

combineSchemaFiles();
