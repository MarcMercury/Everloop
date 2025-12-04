# Everloop - Shared Story Engine

A collaborative story universe where writers build within a living world — guided by AI, grounded in canon.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the demo
python -m everloop.cli

# Or start the API server
python -m everloop.api
```

## What is Everloop?

Everloop is a platform for collaborative storytelling in a shared fantasy universe. Writers contribute stories while an AI assistant helps them:

- Write faster with intelligent suggestions
- Stay consistent with established world lore (canon)
- Check for contradictions with the universe's rules
- Discover relevant lore for their stories

### The Universe

In the Everloop universe, time moves in cycles called "Loops." Each Loop lasts ~1000 years before reality resets. Certain individuals called "Loopers" retain memories across cycles, allowing them to influence future iterations.

## Features

✨ **AI-Powered Writing Assistant** - Get suggestions and continue writing faster  
📚 **Canon Management** - Define and maintain world rules and lore  
✅ **Consistency Checking** - Automatically validate stories against canon  
🤝 **Collaborative Universe** - Multiple writers building in the same world  
🏆 **Reputation System** - Earn recognition for quality contributions  

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for complete documentation including:
- Installation instructions
- API reference
- Architecture overview
- Development guide

## Project Structure

```
everloop/
├── everloop/
│   ├── __init__.py
│   ├── models.py          # Data models (Story, Writer, Canon, etc.)
│   ├── storage.py         # Repository layer
│   ├── ai_assistant.py    # AI writing assistance
│   ├── services.py        # Business logic
│   ├── api.py            # Flask REST API
│   ├── cli.py            # Command-line interface
│   └── initialize.py     # World initialization
├── tests/                # Test suite
├── requirements.txt      # Dependencies
└── DOCUMENTATION.md     # Full documentation
```

## Testing

```bash
pip install -r requirements-dev.txt
pytest
```

## License

MIT License - Built with ❤️ for collaborative storytelling
