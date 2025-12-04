# Everloop - Shared Story Engine

A collaborative story universe where writers build within a living world — guided by AI, grounded in canon.

## Overview

Everloop is a platform that enables collaborative storytelling within a shared fantasy universe. It combines:

- **Collaborative Writing**: Multiple writers can contribute stories to the same universe
- **AI-Powered Assistance**: AI helps writers write faster and provides suggestions
- **Canon Consistency**: Automated checking ensures stories align with established world lore
- **Living World**: A rich fantasy setting with time loops and reality-bending mechanics

## The Everloop Universe

In the Everloop universe, time does not flow linearly. Instead, it moves in cycles called "Loops," each lasting approximately 1000 years before reality resets. Certain individuals called "Loopers" retain memories across cycles, allowing them to influence future iterations.

### Core Concepts

- **The Loop Cycle**: Time moves in repeating cycles
- **Loopers**: Individuals who remember across loops
- **Three Realms**: The Eternal Realm, Fractured Realm, and Void Between
- **The Weaver's Code**: Ethical guidelines for Loopers

## Features

### For Writers

1. **Story Creation**: Write stories set in the Everloop universe
2. **AI Writing Assistant**: Get suggestions and help writing faster
3. **Canon Checking**: Automatically validate stories against world lore
4. **Collaborative Universe**: Build on other writers' stories
5. **Reputation System**: Earn reputation as you contribute quality stories

### For World Builders

1. **Canon Management**: Define and maintain world rules and lore
2. **Category Organization**: Organize canon by magic systems, geography, history, etc.
3. **Reference Tracking**: Track which stories reference which canon rules

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/MarcMercury/Everloop.git
cd Everloop
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. For development (includes testing tools):
```bash
pip install -r requirements-dev.txt
```

## Usage

### Command-Line Interface

Run the CLI to see the system in action:

```bash
python -m everloop.cli
```

This will:
- Initialize the world with base canon
- Create example writers
- Generate a sample story
- Display canon consistency checks

### API Server

Start the Flask API server:

```bash
python -m everloop.api
```

The API will be available at `http://localhost:5000`

### API Endpoints

#### Writers

- `POST /api/writers` - Register a new writer
- `GET /api/writers/<id>` - Get writer details
- `GET /api/writers` - List all writers

#### Stories

- `POST /api/stories` - Create a new story
- `GET /api/stories/<id>` - Get story details
- `PUT /api/stories/<id>` - Update a story
- `POST /api/stories/<id>/publish` - Publish a story
- `GET /api/stories` - List stories (with filters)

#### Canon

- `POST /api/canon` - Create a canon rule
- `GET /api/canon/<id>` - Get canon rule details
- `GET /api/canon` - List canon rules

#### World

- `GET /api/world` - Get world lore and all canon

#### AI Assistance

- `POST /api/assist` - Get AI writing assistance

### Example API Usage

Create a writer:
```bash
curl -X POST http://localhost:5000/api/writers \
  -H "Content-Type: application/json" \
  -d '{"username": "my_username", "email": "me@example.com"}'
```

Create a story:
```bash
curl -X POST http://localhost:5000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Loop",
    "writer_id": "<writer_id>",
    "content": "Once upon a time in the Eternal Realm...",
    "tags": ["time_loop", "adventure"]
  }'
```

Get AI assistance:
```bash
curl -X POST http://localhost:5000/api/assist \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Looper walked through the Fractured Realm",
    "context": {"theme": "exploration"}
  }'
```

## Testing

Run the test suite:

```bash
pytest
```

Run tests with coverage:

```bash
pytest --cov=everloop --cov-report=html
```

## Architecture

### Components

1. **Models** (`everloop/models.py`): Data structures for Stories, Writers, Canon, etc.
2. **Storage** (`everloop/storage.py`): In-memory repositories for data persistence
3. **AI Assistant** (`everloop/ai_assistant.py`): AI-powered writing help and canon checking
4. **Services** (`everloop/services.py`): Business logic layer
5. **API** (`everloop/api.py`): Flask REST API
6. **CLI** (`everloop/cli.py`): Command-line interface

### Data Flow

```
User Request → API → Services → Repositories → Models
                  ↓
            AI Assistant (for writing help and validation)
```

## Development

### Code Quality

Format code with Black:
```bash
black everloop/ tests/
```

Lint with flake8:
```bash
flake8 everloop/ tests/
```

Type check with mypy:
```bash
mypy everloop/
```

### Adding New Canon

Canon rules can be added programmatically or through the API. Each rule should have:

- **Title**: Short, descriptive name
- **Description**: Brief explanation
- **Category**: Type of lore (magic_system, geography, history, culture, etc.)
- **Content**: Detailed explanation of the rule
- **References**: Links to related canon (optional)

### Extending the AI Assistant

The AI assistant in `everloop/ai_assistant.py` can be extended to:

- Integrate with OpenAI GPT models for better suggestions
- Add semantic analysis for deeper canon checking
- Implement more sophisticated tag suggestions
- Add style consistency checking

## Roadmap

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] OpenAI GPT integration for enhanced AI assistance
- [ ] Web frontend for writers
- [ ] Story versioning and revision history
- [ ] Collaborative editing features
- [ ] Story review and rating system
- [ ] Advanced search and discovery
- [ ] Export stories to various formats (PDF, EPUB, etc.)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for collaborative storytelling
