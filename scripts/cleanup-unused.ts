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
    const [filePath, lineNumber, exportName] = line.split(' - ');
    if (!filePath || !exportName) continue;

    const exports = result.get(filePath) || [];
    exports.push(exportName);
    result.set(filePath, exports);
  }

  return result;
}

// Function to remove unused exports from a file
function removeUnusedExports(filePath: string, unusedExports: string[]): void {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove unused exports
    for (const exportName of unusedExports) {
      // Match export statements
      const exportRegex = new RegExp(
        `export\\s+(?:const|function|type|interface|class|enum)\\s+${exportName}\\b[^;]*;?`,
        'g'
      );
      content = content.replace(exportRegex, '');

      // Match named exports in export lists
      const namedExportRegex = new RegExp(`export\\s*{[^}]*\\b${exportName}\\b[^}]*}`, 'g');
      content = content.replace(namedExportRegex, match => {
        return match.replace(`,?\\s*${exportName}\\b`, '');
      });
    }

    // Clean up empty lines and multiple newlines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(filePath, content);
    console.log(`Cleaned up ${unusedExports.length} unused exports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
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

    // Remove unused imports
    for (const importName of unusedImports) {
      // Match named imports in import lists
      const namedImportRegex = new RegExp(`import\\s*{[^}]*\\b${importName}\\b[^}]*}`, 'g');
      content = content.replace(namedImportRegex, match => {
        const cleaned = match.replace(`,?\\s*${importName}\\b`, '');
        // If the import list is now empty, remove the entire import statement
        return cleaned.match(/import\s*{\s*}\s*from/) ? '' : cleaned;
      });

      // Match default imports
      const defaultImportRegex = new RegExp(`import\\s+${importName}\\s+from`, 'g');
      content = content.replace(defaultImportRegex, '');
    }

    // Clean up empty lines and multiple newlines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(filePath, content);
    console.log(`Cleaned up ${unusedImports.length} unused imports in ${filePath}`);
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
