import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import * as ts from 'typescript';

// Function to read ts-prune output
function getUnusedExports(): string[] {
  try {
    const output = execSync('pnpm ts-prune', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error running ts-prune:', error);
    return [];
  }
}

// Function to parse ts-prune output into a structured format
function parseUnusedExports(unusedExports: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const line of unusedExports) {
    const [filePath, , exportName] = line.split(' - ');
    if (!filePath || !exportName) continue;

    const exports = result.get(filePath) || [];
    exports.push(exportName);
    result.set(filePath, exports);
  }

  return result;
}

// Function to check if an export is used in type definitions
function isTypeExport(filePath: string, exportName: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for type/interface declarations
  const typePattern = new RegExp(`(type|interface)\\s+${exportName}\\b`);
  const exportPattern = new RegExp(`export\\s+(type|interface)\\s+${exportName}\\b`);

  return lines.some(line => typePattern.test(line) || exportPattern.test(line));
}

// Function to check if a file is a barrel export file
function isBarrelExportFile(filePath: string): boolean {
  return filePath.endsWith('index.ts') || filePath.endsWith('index.tsx');
}

// Function to check if an export is used in a barrel export
function isUsedInBarrelExport(filePath: string, exportName: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for re-exports
  const exportPattern = new RegExp(`export\\s+{[^}]*\\b${exportName}\\b[^}]*}`);
  return lines.some(line => exportPattern.test(line));
}

// Function to check if a file is a UI component
function isUIComponent(filePath: string): boolean {
  return filePath.includes('/components/ui/') || filePath.includes('/components/features/');
}

// Function to check if a file is a GraphQL resolver
function isGraphQLResolver(filePath: string): boolean {
  return filePath.includes('/graphql/resolvers/');
}

// Function to check if a file is a type definition
function isTypeDefinition(filePath: string): boolean {
  return filePath.includes('/types/') || filePath.endsWith('.d.ts');
}

// Function to check if an export should be skipped
function shouldSkipExport(filePath: string, exportName: string): boolean {
  // Skip UI components
  if (isUIComponent(filePath)) {
    console.log(`Skipping UI component export: ${exportName} in ${filePath}`);
    return true;
  }

  // Skip GraphQL resolvers
  if (isGraphQLResolver(filePath)) {
    console.log(`Skipping GraphQL resolver export: ${exportName} in ${filePath}`);
    return true;
  }

  // Skip type definitions
  if (isTypeDefinition(filePath)) {
    console.log(`Skipping type definition export: ${exportName} in ${filePath}`);
    return true;
  }

  // Skip type exports
  if (isTypeExport(filePath, exportName)) {
    console.log(`Skipping type export: ${exportName} in ${filePath}`);
    return true;
  }

  // Skip barrel exports
  if (isBarrelExportFile(filePath)) {
    console.log(`Skipping barrel export: ${exportName} in ${filePath}`);
    return true;
  }

  return false;
}

// Function to remove unused exports from a file
function removeUnusedExports(filePath: string, unusedExports: string[]): boolean {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Filter out exports that should be skipped
  const exportsToRemove = unusedExports.filter(
    exportName => !shouldSkipExport(filePath, exportName)
  );

  if (exportsToRemove.length === 0) {
    return false;
  }

  // Remove named exports
  exportsToRemove.forEach(exportName => {
    const exportPattern = new RegExp(`export\\s+{[^}]*\\b${exportName}\\b[^}]*}`, 'g');
    const newContent = content.replace(exportPattern, match => {
      const exports = match
        .replace(/export\s+{/, '')
        .replace(/}/, '')
        .split(',')
        .map(e => e.trim())
        .filter(e => e !== exportName && e !== '');

      return exports.length > 0 ? `export { ${exports.join(', ')} }` : '';
    });

    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // Remove default exports
  exportsToRemove.forEach(exportName => {
    const defaultExportPattern = new RegExp(`export\\s+default\\s+${exportName}\\b`, 'g');
    const newContent = content.replace(defaultExportPattern, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Removed unused exports from ${filePath}: ${exportsToRemove.join(', ')}`);
  }

  return modified;
}

// Function to find unused imports in a file
function findUnusedImports(filePath: string): string[] {
  try {
    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      skipLibCheck: true,
    });

    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const checker = program.getTypeChecker();
    const unusedImports: string[] = [];

    // Visit each import declaration
    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        const importClause = node.importClause;
        if (!importClause) return;

        // Handle default import
        if (importClause.name) {
          const symbol = checker.getSymbolAtLocation(importClause.name);
          if (symbol && !isSymbolUsed(symbol, sourceFile, checker)) {
            unusedImports.push(importClause.name.text);
          }
        }

        // Handle named imports
        if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          importClause.namedBindings.elements.forEach(element => {
            const symbol = checker.getSymbolAtLocation(element.name);
            if (symbol && !isSymbolUsed(symbol, sourceFile, checker)) {
              unusedImports.push(element.name.text);
            }
          });
        }
      }
    });

    return unusedImports;
  } catch (error) {
    console.error(`Error analyzing imports in ${filePath}:`, error);
    return [];
  }
}

// Helper function to check if a symbol is used in the file
function isSymbolUsed(
  symbol: ts.Symbol,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): boolean {
  let isUsed = false;

  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const nodeSymbol = checker.getSymbolAtLocation(node);
      if (nodeSymbol && nodeSymbol === symbol) {
        isUsed = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return isUsed;
}

// Function to remove unused imports from a file
function removeUnusedImports(filePath: string, unusedImports: string[]): void {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Remove unused imports
    for (const importName of unusedImports) {
      // Match named imports in import lists
      const namedImportRegex = new RegExp(`import\\s*{[^}]*\\b${importName}\\b[^}]*}`, 'g');
      const newContent = content.replace(namedImportRegex, match => {
        const cleaned = match.replace(`,?\\s*${importName}\\b`, '');
        // If the import list is now empty, remove the entire import statement
        return cleaned.match(/import\s*{\s*}\s*from/) ? '' : cleaned;
      });
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }

      // Match default imports
      const defaultImportRegex = new RegExp(`import\\s+${importName}\\s+from`, 'g');
      const newContent2 = content.replace(defaultImportRegex, '');
      if (newContent2 !== content) {
        modified = true;
        content = newContent2;
      }
    }

    // Clean up empty lines and multiple newlines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned up ${unusedImports.length} unused imports in ${filePath}`);
    } else {
      console.log(`No unused imports to remove in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Function to process a file for both unused exports and imports
function processFile(filePath: string, unusedExports: string[]): void {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return;

  // Remove unused exports
  removeUnusedExports(fullPath, unusedExports);

  // Find and remove unused imports
  const unusedImports = findUnusedImports(fullPath);
  if (unusedImports.length > 0) {
    removeUnusedImports(fullPath, unusedImports);
  }
}

// Main function
function main() {
  console.log('Starting cleanup of unused exports and imports...');

  const unusedExports = getUnusedExports();
  const parsedExports = parseUnusedExports(unusedExports);

  // Process each file
  for (const [filePath, exports] of parsedExports) {
    processFile(filePath, exports);
  }

  console.log('Cleanup completed!');
}

main();
