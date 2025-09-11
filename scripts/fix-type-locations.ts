#!/usr/bin/env tsx

/**
 * Fix Type Location Violations
 *
 * This script automatically fixes type location violations by:
 * 1. Extracting interface definitions from hook files
 * 2. Moving them to the centralized types/custom/hooks.types.ts file
 * 3. Updating imports in the affected files
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const HOOKS_TYPES_FILE = 'types/custom/hooks.types.ts';
const TYPES_INDEX_FILE = 'types/index.ts';

// Files that need to be updated
const HOOK_FILES = [
  'src/hooks/use-optimized-friendships.ts',
  'src/hooks/use-optimized-public-comment-replies.ts',
  'src/hooks/use-game-log-comments.ts',
  'src/hooks/use-optimized-landing-page-data.ts',
  'src/hooks/use-optimized-comment-replies.ts',
  'src/hooks/use-optimized-public-reactions.ts',
  'src/hooks/use-optimized-individual-comments.ts',
  'src/hooks/use-optimized-nba-hub-counts.ts',
  'src/hooks/use-optimized-public-comments.ts',
  'src/hooks/use-optimized-reactions.ts',
];

interface InterfaceInfo {
  name: string;
  content: string;
  file: string;
}

function extractInterfaces(content: string, filePath: string): InterfaceInfo[] {
  const interfaces: InterfaceInfo[] = [];
  const lines = content.split('\n');

  let currentInterface = '';
  let inInterface = false;
  let braceCount = 0;
  let interfaceName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for interface declaration
    const interfaceMatch = line.match(/^\s*interface\s+([A-Z][A-Za-z0-9_]*)/);
    if (interfaceMatch) {
      if (inInterface) {
        // Save previous interface
        interfaces.push({
          name: interfaceName,
          content: currentInterface.trim(),
          file: filePath,
        });
      }

      interfaceName = interfaceMatch[1];
      currentInterface = line;
      inInterface = true;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      continue;
    }

    if (inInterface) {
      currentInterface += '\n' + line;
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      if (braceCount === 0) {
        // Interface complete
        interfaces.push({
          name: interfaceName,
          content: currentInterface.trim(),
          file: filePath,
        });

        currentInterface = '';
        inInterface = false;
        interfaceName = '';
      }
    }
  }

  return interfaces;
}

function updateHookFile(filePath: string, interfaces: InterfaceInfo[]): void {
  let content = readFileSync(filePath, 'utf-8');

  // Remove interface definitions
  for (const iface of interfaces) {
    const lines = content.split('\n');
    const newLines: string[] = [];
    let skipLines = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes(`interface ${iface.name}`)) {
        skipLines = true;
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        continue;
      }

      if (skipLines) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (braceCount === 0) {
          skipLines = false;
        }
        continue;
      }

      newLines.push(line);
    }

    content = newLines.join('\n');
  }

  // Add import for the interfaces
  const importMatch = content.match(/import type \{([^}]+)\} from '@\/types';/);
  if (importMatch) {
    const existingImports = importMatch[1].split(',').map(imp => imp.trim());
    const newImports = interfaces.map(iface => iface.name);
    const allImports = [...new Set([...existingImports, ...newImports])];

    content = content.replace(
      importMatch[0],
      `import type { ${allImports.join(', ')} } from '@/types';`
    );
  } else {
    // Add new import
    const newImports = interfaces.map(iface => iface.name).join(', ');
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      const insertIndex = content.indexOf('\n', firstImportIndex) + 1;
      content =
        content.slice(0, insertIndex) +
        `import type { ${newImports} } from '@/types';\n` +
        content.slice(insertIndex);
    }
  }

  writeFileSync(filePath, content);
}

function updateHooksTypesFile(interfaces: InterfaceInfo[]): void {
  let content = readFileSync(HOOKS_TYPES_FILE, 'utf-8');

  // Add new interfaces
  const newInterfaces = interfaces
    .map(iface => {
      return `// ${iface.name} - from ${iface.file}\n${iface.content}\n`;
    })
    .join('\n');

  content += '\n' + newInterfaces;

  writeFileSync(HOOKS_TYPES_FILE, content);
}

function main() {
  console.log('🔧 Fixing type location violations...');

  const allInterfaces: InterfaceInfo[] = [];

  // Extract interfaces from all hook files
  for (const filePath of HOOK_FILES) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const interfaces = extractInterfaces(content, filePath);
      allInterfaces.push(...interfaces);
      console.log(`📄 Found ${interfaces.length} interfaces in ${filePath}`);
    } catch (error) {
      console.warn(`⚠️  Could not read ${filePath}:`, error);
    }
  }

  console.log(`📊 Total interfaces found: ${allInterfaces.length}`);

  // Update hooks types file
  updateHooksTypesFile(allInterfaces);
  console.log(`✅ Updated ${HOOKS_TYPES_FILE}`);

  // Update individual hook files
  for (const filePath of HOOK_FILES) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const interfaces = extractInterfaces(content, filePath);

      if (interfaces.length > 0) {
        updateHookFile(filePath, interfaces);
        console.log(`✅ Updated ${filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not update ${filePath}:`, error);
    }
  }

  console.log('🎉 Type location violations fixed!');
}

// Run the script
main();
