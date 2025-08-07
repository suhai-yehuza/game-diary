#!/bin/bash

# Script to toggle between mock and real data modes for development

# Check if API_MOCK_MODE is currently set
if [ "$API_MOCK_MODE" = "true" ]; then
    echo "🔄 Switching to REAL data mode..."
    unset API_MOCK_MODE
    echo "✅ API_MOCK_MODE unset - using real API data"
    echo ""
    echo "To start the development server with real data:"
    echo "  npm run dev"
    echo ""
    echo "To switch back to mock data:"
    echo "  ./scripts/toggle-mock-mode.sh"
else
    echo "🔄 Switching to MOCK data mode..."
    export API_MOCK_MODE=true
    echo "✅ API_MOCK_MODE=true - using mock data"
    echo ""
    echo "To start the development server with mock data:"
    echo "  API_MOCK_MODE=true npm run dev"
    echo ""
    echo "To switch back to real data:"
    echo "  ./scripts/toggle-mock-mode.sh"
fi

echo ""
echo "Current environment:"
echo "  API_MOCK_MODE: ${API_MOCK_MODE:-'not set'}"
echo "  NODE_ENV: ${NODE_ENV:-'not set'}"
