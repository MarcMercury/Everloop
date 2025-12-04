# Everloop API Reference

Complete API documentation for the Everloop Shared Story Engine.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "Everloop Story Engine"
}
```

---

## Writers

### Register Writer

#### POST /api/writers

Register a new writer in the system.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "created_at": "ISO-8601 timestamp",
  "stories_count": 0,
  "reputation": 0
}
```

**Errors:**
- 400: Username already exists

### Get Writer

#### GET /api/writers/{writer_id}

Get details of a specific writer.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "created_at": "ISO-8601 timestamp",
  "stories_count": 0,
  "reputation": 0
}
```

**Errors:**
- 404: Writer not found

### List Writers

#### GET /api/writers

List all registered writers.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "username": "string",
    ...
  }
]
```

---

## Stories

### Create Story

#### POST /api/stories

Create a new story with AI assistance.

**Request Body:**
```json
{
  "title": "string (required)",
  "writer_id": "uuid (required)",
  "content": "string (required)",
  "tags": ["string"] (optional)
}
```

**Response (201 Created):**
```json
{
  "story": {
    "id": "uuid",
    "title": "string",
    "writer_id": "uuid",
    "content": "string",
    "summary": "string (auto-generated)",
    "status": "draft",
    "canon_level": "sandbox",
    "tags": ["string"],
    "referenced_canon": ["uuid"],
    "created_at": "ISO-8601 timestamp",
    "updated_at": "ISO-8601 timestamp",
    "published_at": null
  },
  "consistency": {
    "consistent": true,
    "issues": [],
    "suggestions": ["string"]
  },
  "suggested_tags": ["string"]
}
```

**Errors:**
- 400: Invalid writer_id or missing required fields

### Get Story

#### GET /api/stories/{story_id}

Get details of a specific story.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "string",
  "writer_id": "uuid",
  "content": "string",
  "summary": "string",
  "status": "draft|in_review|published|archived",
  "canon_level": "core|expanded|community|sandbox",
  "tags": ["string"],
  "referenced_canon": ["uuid"],
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp",
  "published_at": "ISO-8601 timestamp or null"
}
```

**Errors:**
- 404: Story not found

### Update Story

#### PUT /api/stories/{story_id}

Update an existing story.

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "tags": ["string"] (optional),
  "referenced_canon": ["uuid"] (optional)
}
```

**Response (200 OK):**
```json
{
  "story": { ... },
  "consistency": { ... }
}
```

**Errors:**
- 404: Story not found

### Publish Story

#### POST /api/stories/{story_id}/publish

Publish a story after validating canon consistency.

**Response (200 OK):**
```json
{
  "published": true,
  "story": { ... },
  "consistency": { ... }
}
```

If consistency check fails:
```json
{
  "published": false,
  "story": { ... },
  "consistency": {
    "consistent": false,
    "issues": ["string"],
    ...
  },
  "message": "Cannot publish story with canon inconsistencies"
}
```

**Errors:**
- 404: Story not found

### List Stories

#### GET /api/stories

List stories with optional filtering.

**Query Parameters:**
- `writer_id` (optional): Filter by writer
- `status` (optional): Filter by status (draft, in_review, published, archived)
- `limit` (optional, default: 100): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "string",
    ...
  }
]
```

---

## Canon

### Create Canon Rule

#### POST /api/canon

Create a new canon rule.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "content": "string (required)",
  "references": ["string"] (optional)
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "content": "string",
  "references": ["string"],
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

### Get Canon Rule

#### GET /api/canon/{rule_id}

Get details of a specific canon rule.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "content": "string",
  "references": ["string"],
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

**Errors:**
- 404: Canon rule not found

### List Canon Rules

#### GET /api/canon

List all canon rules, optionally filtered by category.

**Query Parameters:**
- `category` (optional): Filter by category (magic_system, geography, history, culture, etc.)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "category": "string",
    ...
  }
]
```

---

## World

### Get World Lore

#### GET /api/world

Get the complete world lore including all canon rules.

**Response (200 OK):**
```json
{
  "id": "everloop_world",
  "name": "Everloop",
  "description": "A fantasy universe where time loops and reality bends.",
  "setting": "string",
  "themes": ["string"],
  "canon_rules": [
    {
      "id": "uuid",
      "title": "string",
      ...
    }
  ]
}
```

---

## AI Assistance

### Get Writing Assistance

#### POST /api/assist

Get AI-powered writing assistance and suggestions.

**Request Body:**
```json
{
  "content": "string (required)",
  "context": {
    "theme": "string (optional)",
    "tone": "string (optional)",
    ...
  } (optional)
}
```

**Response (200 OK):**
```json
{
  "suggestion": "string",
  "world_context": {
    "id": "everloop_world",
    "name": "Everloop",
    ...
  }
}
```

---

## Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Examples

### Complete Story Creation Flow

1. **Register a writer:**
```bash
curl -X POST http://localhost:5000/api/writers \
  -H "Content-Type: application/json" \
  -d '{"username": "storyteller", "email": "storyteller@example.com"}'
```

2. **Create a story:**
```bash
curl -X POST http://localhost:5000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Endless Loop",
    "writer_id": "<writer_id_from_step_1>",
    "content": "In the beginning, there was only the loop...",
    "tags": ["time_loop", "origin_story"]
  }'
```

3. **Check world lore:**
```bash
curl http://localhost:5000/api/world
```

4. **Get AI assistance:**
```bash
curl -X POST http://localhost:5000/api/assist \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Looper discovered a hidden realm where",
    "context": {"theme": "discovery"}
  }'
```

5. **Publish the story:**
```bash
curl -X POST http://localhost:5000/api/stories/<story_id>/publish
```

---

## Rate Limiting

Currently, there are no rate limits. This may change in production deployments.

## Authentication

Currently, the API does not require authentication. This is suitable for development but should be secured for production use.
