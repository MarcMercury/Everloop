# Quick Start Guide

Get started with Everloop in 5 minutes!

## Installation

```bash
# Clone and setup
git clone https://github.com/MarcMercury/Everloop.git
cd Everloop
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Try it Now!

### Option 1: Run the Demo

```bash
python -m everloop.cli
```

This shows the system in action with example data.

### Option 2: Run the Example Script

```bash
python example.py
```

This demonstrates all major features step-by-step.

### Option 3: Start the API Server

```bash
python -m everloop.api
```

Then visit `http://localhost:5000/health` or use the API endpoints.

## Quick API Examples

### 1. Create a Writer

```bash
curl -X POST http://localhost:5000/api/writers \
  -H "Content-Type: application/json" \
  -d '{"username": "my_name", "email": "me@example.com"}'
```

Response includes your `writer_id`.

### 2. Create a Story

```bash
curl -X POST http://localhost:5000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Loop",
    "writer_id": "YOUR_WRITER_ID_HERE",
    "content": "In the Eternal Realm, time began to loop..."
  }'
```

The AI automatically:
- Generates a summary
- Suggests relevant tags
- Checks canon consistency
- Provides improvement suggestions

### 3. Get Writing Help

```bash
curl -X POST http://localhost:5000/api/assist \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Looper discovered that",
    "context": {"theme": "mystery"}
  }'
```

### 4. View World Lore

```bash
curl http://localhost:5000/api/world
```

See all canon rules and world information.

### 5. Publish Your Story

```bash
curl -X POST http://localhost:5000/api/stories/STORY_ID/publish
```

Stories are checked for canon consistency before publishing.

## What's Next?

- Read the [DOCUMENTATION.md](DOCUMENTATION.md) for complete details
- Check [API.md](API.md) for all API endpoints
- Run tests: `pytest`
- Explore the code in `everloop/`

## The Everloop Universe

In Everloop, time moves in ~1000 year cycles called "Loops." When a Loop ends, reality resets. Certain individuals called "Loopers" retain memories across cycles, creating opportunities for rich, interconnected storytelling across time and space.

### Core Concepts

- **Loops**: ~1000 year time cycles that reset reality
- **Loopers**: Those who remember across Loops
- **Three Realms**: Eternal, Fractured, and Void Between
- **The Weaver's Code**: Ethical guidelines for Loopers
- **Echoes**: Shadows of past events that Loopers can sense

## Need Help?

- Check the documentation files
- Run the example scripts
- All code is well-commented
- Tests show usage patterns

Happy writing! 📝✨
