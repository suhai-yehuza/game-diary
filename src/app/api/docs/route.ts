import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function GET(_request: NextRequest) {
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Diary API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/favicon.ico" sizes="32x32" />
  <style>
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #1e40af; }
    .swagger-ui .info .description { color: #6b7280; }
    .swagger-ui .scheme-container { background: #f9fafb; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add any custom request headers here
          return request;
        },
        responseInterceptor: function(response) {
          // Handle responses here
          return response;
        }
      });
    };
  </script>
</body>
</html>`;

  return new NextResponse(swaggerHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
