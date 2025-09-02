#!/bin/bash

# Script to toggle between mock and real data modes for development
# Now uses consolidated MOCK_MODE variable (with backward compatibility)

# Check if MOCK_MODE is currently set (new consolidated variable)
if [ "$MOCK_MODE" = "true" ]; then
    echo "🔄 Switching to REAL data mode..."
    unset MOCK_MODE
    echo "✅ MOCK_MODE unset - using real API data"
    echo ""
    echo "To start the development server with real data:"
    echo "  npm run dev"
    echo ""
    echo "To switch back to mock data:"
    echo "  ./scripts/toggle-mock-mode.sh"
else
    echo "🔄 Switching to MOCK data mode..."
    export MOCK_MODE=true
    echo "✅ MOCK_MODE=true - using mock data"
    echo ""
    echo "To start the development server with mock data:"
    echo "  MOCK_MODE=true npm run dev"
    echo "  # or (legacy): API_MOCK_MODE=true npm run dev"
    echo ""
    echo "To switch back to real data:"
    echo "  ./scripts/toggle-mock-mode.sh"
fi

echo ""
echo "Current environment:"
echo "  MOCK_MODE: ${MOCK_MODE:-'not set'}"
echo "  NODE_ENV: ${NODE_ENV:-'not set'}"
