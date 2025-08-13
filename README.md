# Game Diary

A comprehensive sports game logging and tracking application built with Next.js, TypeScript, and modern web technologies.

## Development

### Unified Development Script

The project uses a single, comprehensive development script that handles all scenarios:

```bash
# Basic usage (simple mode - default)
pnpm dev

# Interactive mode (attach to existing server)
pnpm dev:interactive

# Start with logging enabled
pnpm dev:logs

# Follow logs of existing server
pnpm logs

# Kill all processes on a port
pnpm kill:port

# Kill all processes on port 3000
pnpm kill:3000
```

### Advanced Usage

You can also use the unified script directly with options:

```bash
# Show help
./scripts/dev-unified.sh --help

# Use a different port
./scripts/dev-unified.sh --port 3001

# Start with logging on port 3001
./scripts/dev-unified.sh --logs --port 3001

# Follow logs on port 3001
./scripts/dev-unified.sh --follow-logs --port 3001
```

### Script Features

- **Smart port detection**: Automatically detects existing Next.js servers
- **Multiple modes**: Simple, interactive, logging, and port management
- **Real-time logs**: Follow server activity with persistent logging
- **Port conflict resolution**: Handle port conflicts with multiple options
- **Process management**: Kill processes on specific ports

## Quick Start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   # For local development (recommended)
   cp .env.development .env.local

   # Or use the development environment directly
   export NODE_ENV=development
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server (simple mode)
- `pnpm dev:interactive` - Interactive mode with server attachment
- `pnpm dev:logs` - Start server with persistent logging
- `pnpm logs` - Follow logs of existing server
- `pnpm kill:port` - Kill all processes on a port
- `pnpm kill:3000` - Kill all processes on port 3000

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utilities and configurations
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## Technologies

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Package Manager**: pnpm

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## License

This project is licensed under the MIT License.

# Staging deployment trigger - Wed Aug 13 07:58:30 PDT 2025
