#!/bin/bash

echo "🔍 Monitoring webhook activity..."
echo "📡 ngrok URL: https://cuddly-unduly-zebra.ngrok-free.app/api/webhooks"
echo "📋 Configure this URL in your Clerk Dashboard webhooks section"
echo ""

# Monitor server logs for webhook activity
echo "📊 Server logs (webhook-related):"
echo "=================================="

# Use tail to follow the logs and grep for webhook-related entries
# This will show webhook activity in real-time
tail -f logs/nightly-update.log 2>/dev/null | grep -i webhook || echo "No webhook logs found. Make sure your development server is running."
