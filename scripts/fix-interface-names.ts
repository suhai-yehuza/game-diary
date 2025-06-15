import * as fs from 'fs/promises';

import { glob } from 'glob';
import * as ts from 'typescript';

import { logger } from '@lib/core/logger';

async function fixInterfaceNames() {
  // Find all TypeScript files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

    const interfaceMap = new Map<string, string>();
    const changes: { start: number; end: number; newText: string }[] = [];

    // First pass: collect all interfaces and their new names
    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;
        if (!interfaceName.startsWith('I')) {
          const newName = `I${interfaceName}`;
          interfaceMap.set(interfaceName, newName);
          changes.push({
            start: node.name.getStart(sourceFile),
            end: node.name.getEnd(),
            newText: newName,
          });
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Second pass: update all references to these interfaces
    function updateReferences(node: ts.Node) {
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        const typeName = node.typeName.text;
        const newName = interfaceMap.get(typeName);
        if (newName) {
          changes.push({
            start: node.typeName.getStart(sourceFile),
            end: node.typeName.getEnd(),
            newText: newName,
          });
        }
      }
      ts.forEachChild(node, updateReferences);
    }

    updateReferences(sourceFile);

    // Apply changes in reverse order to maintain correct positions
    if (changes.length > 0) {
      let newContent = content;
      changes
        .sort((a, b) => b.start - a.start)
        .forEach(change => {
          newContent =
            newContent.slice(0, change.start) + change.newText + newContent.slice(change.end);
        });

      await fs.writeFile(file, newContent);
      logger.info(`Updated ${changes.length} interfaces in ${file}`);
    }
  }
}

fixInterfaceNames().catch(logger.error);
