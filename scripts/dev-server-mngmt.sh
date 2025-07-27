#!/bin/bash

# Unified development server script
# Handles all scenarios: simple, interactive, logging, port management
# Usage: ./scripts/dev-server-mngmt.sh [OPTIONS]
# Options:
#   --simple, -s          Simple mode (show info and exit if server running)
#   --interactive, -i     Interactive mode (attach to existing server)
#   --logs, -l           Start with logging enabled
#   --follow-logs, -f    Follow logs of existing server
#   --kill-port, -k      Kill all processes on port
#   --port PORT, -p PORT Specify port (default: 3000)

set -e

# Default values
DEFAULT_PORT=3000
PORT=$DEFAULT_PORT
MODE="simple"  # simple, interactive, logs, follow-logs, kill-port
LOG_FILE="/tmp/nextjs-dev-${PORT}.log"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --simple|-s)
            MODE="simple"
            shift
            ;;
        --interactive|-i)
            MODE="interactive"
            shift
            ;;
        --logs|-l)
            MODE="logs"
            shift
            ;;
        --follow-logs|-f)
            MODE="follow-logs"
            shift
            ;;
        --kill-port|-k)
            MODE="kill-port"
            shift
            ;;
        --port|-p)
            PORT="$2"
            LOG_FILE="/tmp/nextjs-dev-${PORT}.log"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --simple, -s          Simple mode (show info and exit if server running)"
            echo "  --interactive, -i     Interactive mode (attach to existing server)"
            echo "  --logs, -l           Start with logging enabled"
            echo "  --follow-logs, -f    Follow logs of existing server"
            echo "  --kill-port, -k      Kill all processes on port"
            echo "  --port PORT, -p PORT Specify port (default: 3000)"
            echo "  --help, -h           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Simple mode (default)"
            echo "  $0 --interactive      # Interactive mode"
            echo "  $0 --logs             # Start with logging"
            echo "  $0 --follow-logs      # Follow existing logs"
            echo "  $0 --kill-port        # Kill all processes on port"
            echo "  $0 --port 3001        # Use port 3001"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    lsof -ti:$port >/dev/null 2>&1
}

# Function to check if a process is listening on a port (server process)
is_listening_on_port() {
    local port=$1
    lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1
}

# Function to check if a process is a Next.js server
is_nextjs_server() {
    local pid=$1
    ps -p $pid -o command= 2>/dev/null | grep -q "next"
}

# Function to find Next.js server PIDs on a port
find_nextjs_servers() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || echo "")

    for pid in $pids; do
        if is_nextjs_server $pid; then
            echo $pid
        fi
    done
}

# Function to start server normally
start_server() {
    local port=$1
    echo "🚀 Starting Next.js server on port $port"
    exec pnpm next dev --turbo -p $port
}

# Function to start server with logging
start_server_with_logs() {
    local port=$1
    echo "🚀 Starting Next.js server on port $port with logging..."
    echo "📁 Log file: $LOG_FILE"
    echo ""

    # Start the server and redirect output to log file
    pnpm next dev --turbo -p $port 2>&1 | tee -a "$LOG_FILE" &
    local server_pid=$!

    # Wait a moment for server to start
    sleep 2

    # Check if server started successfully
    if ps -p $server_pid >/dev/null 2>&1; then
        echo "✅ Server started successfully (PID: $server_pid)"
        echo "📋 Following server logs..."
        echo ""

        # Follow the log file
        tail -f "$LOG_FILE"
    else
        echo "❌ Failed to start server"
        exit 1
    fi
}

# Function to show server info and exit (simple mode)
show_server_info() {
    local pid=$1
    local port=$2

    echo "ℹ️  Next.js development server is already running on port $port"
    echo "📁 Working directory: $(pwdx $pid 2>/dev/null | cut -d: -f2- | xargs || echo 'Unknown')"
    echo "🌐 Server URL: http://localhost:$port"
    echo "🆔 Process ID: $pid"
    echo ""
    echo "✅ No new server started - using existing server"
    echo ""
    echo "🔗 How to access the running server:"
    echo "   • Open in browser: http://localhost:$port"
    echo "   • API endpoints: http://localhost:$port/api/*"
    echo ""
    echo "🛠️  Server management:"
    echo "   • Stop server: kill $pid"
    echo "   • Restart server: kill $pid && pnpm dev"
    echo "   • Kill all on port: pnpm dev:kill:port"
    echo ""
    echo "📋 How to see server logs:"
    echo "   • Follow logs: pnpm dev:logs"
    echo "   • Interactive mode: pnpm dev:interactive"
    echo "   • Start with logging: kill $pid && pnpm dev:logs"
    echo ""
    echo "💡 Tip: Use 'pnpm dev:logs' to see real-time server activity!"
    exit 0
}

# Function to attach to existing server (interactive mode)
attach_to_server() {
    local pid=$1
    local port=$2

    echo "🔗 Attaching to existing Next.js server (PID: $pid) on port $port"
    echo "📁 Working directory: $(pwdx $pid 2>/dev/null | cut -d: -f2- | xargs || echo 'Unknown')"
    echo "🌐 Server URL: http://localhost:$port"
    echo ""
    echo "💡 Press Ctrl+C to detach from the server (server will continue running in background)"
    echo "💡 To stop the server completely, use: kill $pid"
    echo ""

    # Since we can't easily attach to the stdout/stderr of an already running process,
    # we'll show the current status and provide options to restart with logging
    echo "📋 Server is running but logs are not available in this terminal"
    echo "💡 To see real-time logs, you can:"
    echo "   1. Stop the current server: kill $pid"
    echo "   2. Restart with logging: $0 --logs"
    echo "   3. Or follow existing logs: $0 --follow-logs"
    echo ""

    show_process_status $pid $port
}

# Function to attach to existing server with logs
attach_to_server_with_logs() {
    local pid=$1
    local port=$2

    echo "🔗 Attaching to existing Next.js server (PID: $pid) on port $port"
    echo "📁 Working directory: $(pwdx $pid 2>/dev/null | cut -d: -f2- | xargs || echo 'Unknown')"
    echo "🌐 Server URL: http://localhost:$port"
    echo ""

        if [ -f "$LOG_FILE" ]; then
        # Check if the file was modified recently (within last 60 seconds)
        file_age=$(($(date +%s) - $(stat -f%m "$LOG_FILE" 2>/dev/null || stat -c%Y "$LOG_FILE" 2>/dev/null || echo "0")))

        if [ "$file_age" -gt 60 ]; then
            echo "⚠️  Log file exists but was last updated $file_age seconds ago"
            echo "📁 Log file: $LOG_FILE (last updated: $(stat -f%Sm "$LOG_FILE" 2>/dev/null || stat -c%y "$LOG_FILE" 2>/dev/null || echo 'unknown'))"
            echo ""
            echo "💡 The current server was not started with logging enabled."
            echo "💡 To see real-time logs, restart the server with:"
            echo "   1. Stop current server: kill $pid"
            echo "   2. Start with logging: $0 --logs"
            echo ""
            echo "📊 Current server status:"
            ps -p $pid -o pid,ppid,command
            echo ""
            echo "💡 Press Ctrl+C to exit"
            while true; do
                if ! ps -p $pid >/dev/null 2>&1; then
                    echo "❌ Server process $pid has stopped"
                    exit 1
                fi
                sleep 5
            done
        else
            echo "📋 Found log file: $LOG_FILE (last updated $file_age seconds ago)"
            echo "📋 Following server logs..."
            echo ""
            tail -f "$LOG_FILE"
        fi
    else
        echo "📋 No log file found. Server was not started with logging."
        echo "💡 To see real-time logs, restart the server with:"
        echo "   1. Stop current server: kill $pid"
        echo "   2. Start with logging: $0 --logs"
        echo ""
        echo "📊 Current server status:"
        ps -p $pid -o pid,ppid,command
        echo ""
        echo "💡 Press Ctrl+C to exit"
        while true; do
            if ! ps -p $pid >/dev/null 2>&1; then
                echo "❌ Server process $pid has stopped"
                exit 1
            fi
            sleep 5
        done
    fi
}

# Function to show process status when we can't attach to logs
show_process_status() {
    local pid=$1
    local port=$2

    echo "✅ Server is running. Use 'kill $pid' to stop it."
    echo "🔗 Open http://localhost:$port in your browser"
    echo ""
    echo "📊 Server status:"
    ps -p $pid -o pid,ppid,command
    echo ""
    echo "💡 Press Ctrl+C to exit this script (server will continue running)"
    echo "💡 To see real-time logs, restart the server with: kill $pid && $0 --logs"
    echo ""

    # Keep the script running and show periodic status updates
    while true; do
        if ! ps -p $pid >/dev/null 2>&1; then
            echo "❌ Server process $pid has stopped"
            exit 1
        fi
        sleep 5
    done
}

# Function to follow logs
follow_logs() {
    echo "📋 Following logs for Next.js server on port $PORT..."

    # Check if there's a Next.js server running on this port
    nextjs_pids=$(find_nextjs_servers $PORT)

    if [ -z "$nextjs_pids" ]; then
        echo "❌ No Next.js server found running on port $PORT"
        echo ""
        echo "💡 To start a server with logging, use: $0 --logs"
        exit 1
    fi

    if [ -f "$LOG_FILE" ]; then
        # Check if the file was modified recently (within last 60 seconds)
        file_age=$(($(date +%s) - $(stat -f%m "$LOG_FILE" 2>/dev/null || stat -c%Y "$LOG_FILE" 2>/dev/null || echo "0")))

        if [ "$file_age" -gt 60 ]; then
            echo "⚠️  Log file exists but was last updated $file_age seconds ago"
            echo "📁 Log file: $LOG_FILE (last updated: $(stat -f%Sm "$LOG_FILE" 2>/dev/null || stat -c%y "$LOG_FILE" 2>/dev/null || echo 'unknown'))"
            echo ""
            echo "💡 The current server was not started with logging enabled."
            echo "💡 To see real-time logs, restart the server with:"
            echo "   1. Stop current server: kill $(echo "$nextjs_pids" | head -n1)"
            echo "   2. Start with logging: $0 --logs"
            echo ""
            echo "📊 Current server status:"
            ps -p $(echo "$nextjs_pids" | head -n1) -o pid,ppid,command
            exit 1
        else
            echo "📁 Log file: $LOG_FILE (last updated $file_age seconds ago)"
            echo "📋 Following server logs (Press Ctrl+C to stop)..."
            echo ""
            tail -f "$LOG_FILE"
        fi
    else
        echo "❌ No log file found at $LOG_FILE"
        echo ""
        echo "💡 The server is running but was not started with logging enabled."
        echo "💡 To see real-time logs, restart the server with:"
        echo "   1. Stop current server: kill $(echo "$nextjs_pids" | head -n1)"
        echo "   2. Start with logging: $0 --logs"
        exit 1
    fi
}

# Function to kill all processes on port
kill_port() {
    if [ "$PORT" != "$DEFAULT_PORT" ]; then
        # If a specific port was provided, use the original behavior
        echo "🔍 Checking for processes on port $PORT..."

        # Get all PIDs using the port
        pids=$(lsof -ti:$PORT 2>/dev/null || echo "")

        if [ -z "$pids" ]; then
            echo "✅ No processes found on port $PORT"
            exit 0
        fi

        echo "📋 Found processes on port $PORT:"
        lsof -i:$PORT
        echo ""

        echo "🆔 Process IDs: $pids"
        echo ""

        # Ask for confirmation
        echo "⚠️  This will kill ALL processes on port $PORT"
        read -p "Are you sure you want to continue? (y/N): " confirm

        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            echo "💀 Killing processes: $pids"
            kill -9 $pids 2>/dev/null || true
            sleep 1

            # Verify processes are killed
            remaining_pids=$(lsof -ti:$PORT 2>/dev/null || echo "")
            if [ -z "$remaining_pids" ]; then
                echo "✅ All processes on port $PORT have been killed"
            else
                echo "⚠️  Some processes may still be running: $remaining_pids"
                echo "💡 You may need to run this script again or manually kill them"
            fi
        else
            echo "❌ Operation cancelled"
            exit 0
        fi
    else
        # Interactive mode - show all ports in use
        echo "🔍 Scanning for ports in use..."
        echo ""

        # Get all listening ports with their processes
        ports_info=$(lsof -i -P -n | grep LISTEN | awk '{print $9, $1, $2}' | sort -u | head -20)

        if [ -z "$ports_info" ]; then
            echo "✅ No ports found in use"
            exit 0
        fi

        echo "📋 Ports currently in use:"
        echo "┌─────────┬──────────────┬─────────┬─────────────────────────────┐"
        echo "│ Port    │ Process      │ PID     │ Description                  │"
        echo "├─────────┼──────────────┼─────────┼─────────────────────────────┤"

        port_options=()
        port_count=0

        while IFS= read -r line; do
            if [ -n "$line" ]; then
                port=$(echo "$line" | awk '{print $1}' | cut -d: -f2)
                process=$(echo "$line" | awk '{print $2}')
                pid=$(echo "$line" | awk '{print $3}')

                # Skip if we already processed this port
                if [[ " ${port_options[@]} " =~ " $port " ]]; then
                    continue
                fi

                port_count=$((port_count + 1))
                port_options+=("$port")

                # Get process description
                description=$(ps -p $pid -o command= 2>/dev/null | head -c 30 | tr -d '\n')
                if [ -z "$description" ]; then
                    description="Unknown process"
                fi

                printf "│ %-7s │ %-12s │ %-7s │ %-27s │\n" "$port" "$process" "$pid" "$description"
            fi
        done <<< "$ports_info"

        echo "└─────────┴──────────────┴─────────┴─────────────────────────────┘"
        echo ""

        if [ $port_count -eq 0 ]; then
            echo "✅ No ports found in use"
            exit 0
        fi

        echo "💡 Select a port to kill all processes on it:"
        echo "   Enter port number (e.g., 3000)"
        echo "   Or enter 'q' to quit"
        echo ""

        read -p "Port to kill: " selected_port

        if [[ "$selected_port" =~ ^[0-9]+$ ]]; then
            # Check if the selected port is in our list
            if [[ " ${port_options[@]} " =~ " $selected_port " ]]; then
                echo ""
                echo "🔍 Checking for processes on port $selected_port..."

                # Get all PIDs using the selected port
                pids=$(lsof -ti:$selected_port 2>/dev/null || echo "")

                if [ -z "$pids" ]; then
                    echo "✅ No processes found on port $selected_port"
                    exit 0
                fi

                echo "📋 Found processes on port $selected_port:"
                lsof -i:$selected_port
                echo ""

                echo "🆔 Process IDs: $pids"
                echo ""

                # Ask for confirmation
                echo "⚠️  This will kill ALL processes on port $selected_port"
                read -p "Are you sure you want to continue? (y/N): " confirm

                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    echo "💀 Killing processes: $pids"
                    kill -9 $pids 2>/dev/null || true
                    sleep 1

                    # Verify processes are killed
                    remaining_pids=$(lsof -ti:$selected_port 2>/dev/null || echo "")
                    if [ -z "$remaining_pids" ]; then
                        echo "✅ All processes on port $selected_port have been killed"
                    else
                        echo "⚠️  Some processes may still be running: $remaining_pids"
                        echo "💡 You may need to run this script again or manually kill them"
                    fi
                else
                    echo "❌ Operation cancelled"
                    exit 0
                fi
            else
                echo "❌ Port $selected_port not found in the list above"
                exit 1
            fi
        elif [[ "$selected_port" =~ ^[Qq]$ ]]; then
            echo "❌ Operation cancelled"
            exit 0
        else
            echo "❌ Invalid input. Please enter a port number or 'q' to quit"
            exit 1
        fi
    fi
}

# Function to handle port conflicts
handle_port_conflict() {
    local port=$1

    echo "⚠️  Port $port is in use by another process"
    echo "🔍 Processes listening on port $port:"
    lsof -i:$port -sTCP:LISTEN

    echo ""
    echo "Would you like to:"
    echo "1) Kill the existing process and start Next.js server"
    echo "2) Kill ALL processes on port $port and start Next.js server"
    echo "3) Start Next.js server on a different port"
    echo "4) Cancel"

    read -p "Choose an option (1-4): " choice

    case $choice in
        1)
            echo "🔄 Killing existing process..."
            kill -9 $(lsof -ti:$port -sTCP:LISTEN) 2>/dev/null || true
            sleep 1
            if [ "$MODE" = "logs" ]; then
                start_server_with_logs $port
            else
                start_server $port
            fi
            ;;
        2)
            echo "🔄 Killing ALL processes on port $port..."
            all_pids=$(lsof -ti:$port 2>/dev/null || echo "")
            if [ -n "$all_pids" ]; then
                echo "📋 Processes to kill:"
                lsof -i:$port
                echo ""
                echo "💀 Killing processes: $all_pids"
                kill -9 $all_pids 2>/dev/null || true
                sleep 2
                echo "✅ All processes killed"
            else
                echo "ℹ️  No processes found on port $port"
            fi
            if [ "$MODE" = "logs" ]; then
                start_server_with_logs $port
            else
                start_server $port
            fi
            ;;
        3)
            # Find next available port
            new_port=$((port + 1))
            while is_listening_on_port $new_port; do
                new_port=$((new_port + 1))
            done
            if [ "$MODE" = "logs" ]; then
                start_server_with_logs $new_port
            else
                start_server $new_port
            fi
            ;;
        4)
            echo "❌ Cancelled"
            exit 0
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
}

# Main script logic
echo "🚀 Starting development server..."

# Handle special modes first
case $MODE in
    "follow-logs")
        follow_logs
        exit 0
        ;;
    "kill-port")
        kill_port
        exit 0
        ;;
esac

# Check if default port is in use
if is_listening_on_port $PORT; then
    # Look for Next.js servers on the port
    nextjs_pids=$(find_nextjs_servers $PORT)

    if [ -n "$nextjs_pids" ]; then
        # Found Next.js server(s) - handle based on mode
        pid=$(echo "$nextjs_pids" | head -n1)

        case $MODE in
            "simple")
                show_server_info $pid $PORT
                ;;
            "interactive")
                attach_to_server $pid $PORT
                ;;
            "logs")
                attach_to_server_with_logs $pid $PORT
                ;;
        esac
    else
        # Port is in use but not by Next.js
        handle_port_conflict $PORT
    fi
else
    echo "✅ Port $PORT is available"
    case $MODE in
        "logs")
            start_server_with_logs $PORT
            ;;
        *)
            start_server $PORT
            ;;
    esac
fi
