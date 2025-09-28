# OpenAPI Integration Guide

This document provides comprehensive information about the OpenAPI integration in the Game Diary application.

## 🎯 Overview

The Game Diary API now includes comprehensive OpenAPI 3.0 documentation with interactive Swagger UI, making it easier for developers to understand and integrate with the API.

## 📚 Available Endpoints

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/openapi.json`

### Production URLs

- **Swagger UI**: `https://www.game-diary.io/api/docs`
- **OpenAPI JSON**: `https://www.game-diary.io/api/openapi.json`

## 🛠️ Implementation Details

### Dependencies Added

```json
{
  "swagger-jsdoc": "^6.2.8",
  "@types/swagger-jsdoc": "^6.0.4"
}
```

**Note**: We use Swagger UI via CDN instead of `swagger-ui-express` for better Next.js compatibility.

### Configuration Files

- **OpenAPI Config**: `src/lib/openapi/config.ts`
- **Swagger UI Route**: `src/app/api/docs/route.ts`
- **OpenAPI JSON Route**: `src/app/api/openapi.json/route.ts`

## 📝 Documenting API Endpoints

### Basic Documentation Pattern

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     tags:
 *       - Category
 *     summary: Brief description
 *     description: Detailed description
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseModel'
 *       400:
 *         description: Error response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

### Authentication Documentation

```typescript
/**
 * @swagger
 * /api/protected-endpoint:
 *   get:
 *     security:
 *       - bearerAuth: []
 *       - clerkAuth: []
 *     tags:
 *       - Protected
 *     summary: Protected endpoint
 *     description: Requires authentication
 */
```

## 🏗️ Schema Definitions

The OpenAPI specification includes comprehensive schema definitions for:

### Core Models

- **User**: User profile and authentication data
- **GameLog**: Game logging entries
- **Comment**: User comments and interactions
- **Reaction**: Emoji reactions and engagement
- **Error**: Standardized error responses
- **Success**: Standardized success responses
- **Pagination**: Pagination metadata

### Security Schemes

- **bearerAuth**: JWT token authentication
- **clerkAuth**: Clerk session authentication

## 🎨 Customization

### Swagger UI Customization

The Swagger UI is customized with:

- Custom CSS for Game Diary branding
- Hidden top bar for cleaner interface
- Custom favicon and site title
- Responsive design for mobile devices

### OpenAPI Specification Features

- **Multiple Environments**: Development, staging, and production servers
- **Comprehensive Tags**: Organized by functionality
- **Detailed Schemas**: Complete data models
- **Security Definitions**: Multiple authentication methods
- **Contact Information**: Developer support details

## 🚀 Usage Examples

### Viewing Documentation

```bash
# Start development server
pnpm dev

# Open Swagger UI
open http://localhost:3000/api/docs

# Access OpenAPI JSON
curl http://localhost:3000/api/openapi.json
```

### Using Package Scripts

```bash
# Show API documentation URLs
pnpm api:docs

# Show OpenAPI JSON URL
pnpm api:openapi
```

### Client Generation

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api/openapi.json \
  -g typescript-fetch \
  -o ./generated-client

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api/openapi.json \
  -g python \
  -o ./generated-client
```

## 🔧 Development Workflow

### Adding New Endpoints

1. Create the API route in `src/app/api/`
2. Add OpenAPI documentation using JSDoc comments
3. Test the endpoint in Swagger UI
4. Update schemas if needed in `src/lib/openapi/config.ts`

### Updating Schemas

1. Modify schema definitions in `src/lib/openapi/config.ts`
2. Restart the development server
3. Verify changes in Swagger UI

### Testing Documentation

1. Start development server: `pnpm dev`
2. Open Swagger UI: `http://localhost:3000/api/docs`
3. Test endpoints directly from the interface
4. Verify request/response schemas

## 📊 Benefits

### For Developers

- **Interactive Testing**: Test APIs directly from the browser
- **Code Generation**: Generate client SDKs automatically
- **Type Safety**: TypeScript definitions for all models
- **Documentation**: Always up-to-date API documentation

### For API Consumers

- **Clear Examples**: Request/response examples for all endpoints
- **Authentication Guide**: Clear authentication requirements
- **Error Handling**: Comprehensive error response documentation
- **Schema Validation**: Complete data model definitions

### For Maintenance

- **Auto-Documentation**: Documentation stays in sync with code
- **Version Control**: API changes tracked in git
- **Consistency**: Standardized documentation format
- **Collaboration**: Team members can easily understand API changes

## 🔍 Monitoring and Analytics

### Usage Tracking

- Monitor API usage through Swagger UI analytics
- Track endpoint popularity and usage patterns
- Identify documentation gaps and improvements

### Quality Assurance

- Validate API responses against OpenAPI schemas
- Ensure documentation accuracy
- Test API contracts automatically

## 🚀 Future Enhancements

### Planned Features

- **API Versioning**: Support for multiple API versions
- **Rate Limiting Documentation**: Include rate limit information
- **Webhook Documentation**: Document webhook endpoints
- **GraphQL Integration**: Include GraphQL schema in OpenAPI
- **Performance Metrics**: Add response time documentation

### Advanced Features

- **Mock Server**: Generate mock responses from OpenAPI spec
- **Contract Testing**: Automated API contract validation
- **Client SDKs**: Auto-generated SDKs for multiple languages
- **API Gateway Integration**: Deploy with API gateway solutions

## 📞 Support

For questions about OpenAPI integration:

- **Documentation**: Check this guide and inline comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Examples**: See existing API routes for documentation patterns
- **Community**: Join discussions for best practices and tips

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: Game Diary Development Team
