# Upload Helper

A secure file upload service with Redis-based temporary upload IDs and S3-compatible storage. This service is designed to handle file uploads with enhanced security, validation, and proper error handling.

## Features

- 🔐 **Secure Authentication**: Token-based authentication for upload ID creation
- ⏱️ **Temporary Upload IDs**: Redis-backed temporary upload tokens (15-minute expiration)
- 🛡️ **File Validation**: Magic byte validation to ensure file types match extensions
- 🚦 **Rate Limiting**: Built-in rate limiting to prevent abuse
- 🔒 **Security Headers**: Comprehensive security headers (helmet-like functionality)
- 📝 **Request Tracking**: UUID-based request tracking for better debugging
- ☁️ **S3-Compatible**: Works with any S3-compatible object storage (AWS S3, MinIO, Arvan, etc.)
- 🐳 **Docker Ready**: Includes optimized Dockerfile for easy deployment

## Prerequisites

- Node.js 18+ (or use Docker)
- Redis instance
- S3-compatible object storage

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd upload-helper
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment file and configure:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Docker Deployment

1. Build the image:
```bash
docker build -t upload-helper .
```

2. Run the container:
```bash
docker run -d \
  --name upload-helper \
  -p 3000:3000 \
  --env-file .env \
  upload-helper
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `ACCESS_TOKEN` | Yes | - | Authentication token for creating upload IDs |
| `REDIS_HOST` | Yes | - | Redis server host |
| `REDIS_PORT` | Yes | - | Redis server port |
| `REDIS_PASSWORD` | Yes | - | Redis password |
| `REDIS_KEY_PREFIX` | Yes | - | Prefix for Redis keys (e.g., `upload:`) |
| `OBJECT_STORAGE_ENDPOINT` | Yes | - | S3-compatible endpoint URL |
| `OBJECT_STORAGE_REGION` | No | `us-east-1` | Storage region |
| `OBJECT_STORAGE_ACCESS_KEY` | Yes | - | Storage access key |
| `OBJECT_STORAGE_SECRET_KEY` | Yes | - | Storage secret key |
| `OBJECT_STORAGE_BUCKET` | Yes | - | Storage bucket name |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Maximum file size in MB |
| `JSON_BODY_LIMIT_MB` | No | `10` | Maximum JSON body size in MB |
| `CORS_ALLOWED_ORIGINS` | No | All | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `STRICT_FILE` | No | - | Strict file type validation |

See `.env.example` for a complete example configuration.

## API Documentation

### GET /health

Health check endpoint that returns system metrics and dependency status. Useful for monitoring, load balancers, and container orchestration.

**Response (200 - Healthy):**
```json
{
  "failedMetrics": [],
  "testResponse": {
    "redis": true,
    "s3": true,
    "timestamp": "2025-01-01T12:00:00.000Z",
    "config": {
      "port": 3000,
      "maxUploadSizeMB": 10,
      "jsonLimitMB": 10,
      "corsConfigured": true
    }
  },
  "uptime": 123.45,
  "mem_usage": {
    "rss": 23456789,
    "heapTotal": 12345678,
    "heapUsed": 9876543,
    "external": 456789
  },
  "node_resourceusage": { },
  "cpu_usage": { "user": 12345, "system": 6789 }
}
```

**Response (503 - Unhealthy):**
```json
{
  "testResponse": {
    "redis": false,
    "redisError": "Connection refused",
    "s3": true,
    "timestamp": "2025-01-01T12:00:00.000Z"
  }
}
```

**Metrics Included:**
- `redis`: Redis connectivity status
- `s3`: S3/Object storage connectivity status
- `uptime`: Server uptime in seconds
- `mem_usage`: Memory usage statistics
- `cpu_usage`: CPU usage statistics
- `node_resourceusage`: Node.js resource usage

**Example:**
```bash
curl https://upload.example.com/health
```

---

### POST /upload

Creates a temporary upload ID for file upload. Requires authentication.

**Headers:**
- `X-Access-Token`: Your access token
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "filename": "example.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Created Upload ID",
  "id": "39cfd164-cd8d-405f-9692-ceace5700678"
}
```

**Error Responses:**
- `403`: Invalid or missing access token
- `400`: Invalid filename format
- `429`: Rate limit exceeded
- `500`: Internal server error

**Example:**
```bash
curl -X POST https://upload.example.com/upload \
  -H "X-Access-Token: your-token-here" \
  -H "Content-Type: application/json" \
  -d '{"filename": "photo.jpg"}'
```

---

### POST /user-upload/:uploadId

Upload a file using a previously created upload ID. CORS-enabled for browser uploads.

**URL Parameters:**
- `uploadId`: The UUID from the `/upload` endpoint

**Form Data:**
- `file`: The file to upload (must match the extension specified in the upload ID creation)

**Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "https://bucket.s3.region.provider.com/uploads/example.png"
}
```

**Error Responses:**
- `400`: Invalid or expired upload ID, file type mismatch, or validation failure
- `429`: Rate limit exceeded
- `500`: Internal server error

**Example:**
```bash
curl -X POST https://upload.example.com/user-upload/39cfd164-cd8d-405f-9692-ceace5700678 \
  -F "file=@/path/to/photo.jpg"
```

## File Type Validation

The service validates files using magic bytes (file signatures) to ensure the content matches the declared extension. Supported file types:

**Images:** jpg, jpeg, png, gif, webp, bmp, svg  
**Documents:** pdf  
**Archives:** zip  
**Video:** mp4, webm  
**Audio:** mp3

## Security Features

- **Authentication**: Token-based auth for upload ID creation
- **Rate Limiting**: Prevents abuse with configurable limits
- **File Validation**: Magic byte checking to prevent file type spoofing
- **CORS Control**: Configurable allowed origins
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, CSP, etc.
- **Request Tracking**: Every request gets a unique ID for auditing
- **Temporary IDs**: Upload IDs expire after 15 minutes

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **No semicolons** code style
- 2-space indentation

## Architecture

```
src/
├── app.js                 # Application entry point
├── config/
│   ├── index.js          # Centralized configuration
│   └── env.js            # Environment validation
├── constants.js          # Application constants
├── middlewares/
│   ├── auth.js           # Authentication middleware
│   ├── rateLimit.js      # Rate limiting
│   ├── security.js       # Security headers
│   ├── upload.js         # Multer configuration
│   └── validate.js       # Zod validation middleware
├── routes/
│   └── index/
│       ├── handlers.js   # Route handlers
│       ├── index.js      # Route definitions
│       └── validators.js # Request validators
├── utils/
│   ├── fileValidator.js  # File type validation
│   ├── logger.js         # Logging utility
│   └── requestId.js      # Request ID middleware
├── redis.js              # Redis client
└── s3.js                 # S3 client
```

## Health Monitoring

The `/health` endpoint provides comprehensive health checks for production monitoring:

### Kubernetes Integration

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Docker Health Check

The Dockerfile includes a built-in health check that uses this endpoint.

### Monitoring Tools

Compatible with:
- Prometheus/Grafana
- Datadog
- New Relic
- AWS ELB/ALB health checks
- Any monitoring tool that supports HTTP health checks

## Troubleshooting

### Redis Connection Issues
Ensure Redis is running and credentials are correct. Check logs for connection errors. Use `/health` endpoint to verify connectivity.

### File Upload Fails
- Verify file size is within limit
- Check file type is supported
- Ensure upload ID hasn't expired (15 min limit)
- Check `/health` endpoint for S3 connectivity

### CORS Errors
Add your frontend origin to `CORS_ALLOWED_ORIGINS` in `.env`

## License

MIT