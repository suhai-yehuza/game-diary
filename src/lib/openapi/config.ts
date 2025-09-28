import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Diary API',
      version: '1.0.0',
      description:
        'A comprehensive sports game logging and tracking API that allows users to track their game watching experiences, connect with fellow sports fans, and share thoughts on live games across NBA, NFL, MLB, NHL, and MLS.',
      contact: {
        name: 'Game Diary Development Team',
        email: 'dev@gamediary.io',
        url: 'https://www.game-diary.io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://staging.game-diary.io/api',
        description: 'Staging server',
      },
      {
        url: 'https://www.game-diary.io/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from Clerk authentication',
        },
        clerkAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Clerk session token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'VALIDATION_ERROR',
            },
            message: {
              type: 'string',
              example: 'Request validation failed',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 20,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 5,
            },
            hasNext: {
              type: 'boolean',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              example: false,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user_123',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'gameplayer',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/avatar.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        GameLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'gamelog_123',
            },
            userId: {
              type: 'string',
              example: 'user_123',
            },
            gameId: {
              type: 'string',
              example: 'game_456',
            },
            title: {
              type: 'string',
              example: 'Amazing Lakers vs Warriors Game',
            },
            content: {
              type: 'string',
              example: 'What an incredible game! LeBron was on fire...',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['NBA', 'Lakers', 'Warriors'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'comment_123',
            },
            userId: {
              type: 'string',
              example: 'user_123',
            },
            gameLogId: {
              type: 'string',
              example: 'gamelog_456',
            },
            parentId: {
              type: 'string',
              nullable: true,
              example: null,
            },
            content: {
              type: 'string',
              example: 'Great game log! I was there too.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Reaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'reaction_123',
            },
            userId: {
              type: 'string',
              example: 'user_123',
            },
            gameLogId: {
              type: 'string',
              example: 'gamelog_456',
            },
            emoji: {
              type: 'string',
              example: '🔥',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
      {
        name: 'Cache',
        description: 'Cache management and monitoring',
      },
      {
        name: 'Users',
        description: 'User management and profiles',
      },
      {
        name: 'Game Logs',
        description: 'Game logging and tracking',
      },
      {
        name: 'Comments',
        description: 'Comments and social interactions',
      },
      {
        name: 'Reactions',
        description: 'Emoji reactions and engagement',
      },
      {
        name: 'Sports',
        description: 'Sports data and statistics',
      },
      {
        name: 'Search',
        description: 'Global search functionality',
      },
      {
        name: 'Admin',
        description: 'Administrative operations',
      },
    ],
  },
  apis: [
    './src/app/api/**/*.ts', // Path to the API files
    './src/app/api/**/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
