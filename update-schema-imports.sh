#!/bin/bash

# Find all TypeScript files and update the schema import path
find src -type f -name "*.ts" -exec sed -i '' 's|@/lib/db/seed/schema|@/lib/db/schema|g' {} + 