"""
Flask API for the Everloop Story Engine.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, Any

from everloop.models import StoryStatus, WorldLore
from everloop.storage import (
    StoryRepository,
    WriterRepository,
    CanonRepository,
    WorldRepository
)
from everloop.ai_assistant import AIWritingAssistant
from everloop.services import StoryService, WriterService, CanonService


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app)
    
    # Initialize repositories
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    
    # Initialize world and AI assistant
    world = world_repo.get_world()
    ai_assistant = AIWritingAssistant(world)
    
    # Initialize services
    story_service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    writer_service = WriterService(writer_repo)
    canon_service = CanonService(canon_repo)
    
    # Store services in app context for access in routes
    app.config['story_service'] = story_service
    app.config['writer_service'] = writer_service
    app.config['canon_service'] = canon_service
    app.config['world_repo'] = world_repo
    
    @app.route('/health', methods=['GET'])
    def health():
        """Health check endpoint."""
        return jsonify({"status": "healthy", "service": "Everloop Story Engine"})
    
    # Writer endpoints
    @app.route('/api/writers', methods=['POST'])
    def register_writer():
        """Register a new writer."""
        data = request.get_json()
        try:
            writer = writer_service.register_writer(
                username=data['username'],
                email=data['email']
            )
            return jsonify(writer), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/writers/<writer_id>', methods=['GET'])
    def get_writer(writer_id: str):
        """Get a writer by ID."""
        writer = writer_service.get_writer(writer_id)
        if writer:
            return jsonify(writer)
        return jsonify({"error": "Writer not found"}), 404
    
    @app.route('/api/writers', methods=['GET'])
    def list_writers():
        """List all writers."""
        writers = writer_service.list_writers()
        return jsonify(writers)
    
    # Story endpoints
    @app.route('/api/stories', methods=['POST'])
    def create_story():
        """Create a new story."""
        data = request.get_json()
        try:
            result = story_service.create_story(
                title=data['title'],
                writer_id=data['writer_id'],
                content=data['content'],
                tags=data.get('tags')
            )
            return jsonify(result), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/stories/<story_id>', methods=['GET'])
    def get_story(story_id: str):
        """Get a story by ID."""
        story = story_service.get_story(story_id)
        if story:
            return jsonify(story)
        return jsonify({"error": "Story not found"}), 404
    
    @app.route('/api/stories/<story_id>', methods=['PUT'])
    def update_story(story_id: str):
        """Update a story."""
        data = request.get_json()
        try:
            result = story_service.update_story(story_id, **data)
            return jsonify(result)
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
    
    @app.route('/api/stories/<story_id>/publish', methods=['POST'])
    def publish_story(story_id: str):
        """Publish a story."""
        try:
            result = story_service.publish_story(story_id)
            return jsonify(result)
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
    
    @app.route('/api/stories', methods=['GET'])
    def list_stories():
        """List stories with optional filters."""
        writer_id = request.args.get('writer_id')
        status_str = request.args.get('status')
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        status = None
        if status_str:
            status = StoryStatus(status_str)
        
        stories = story_service.list_stories(
            writer_id=writer_id,
            status=status,
            limit=limit,
            offset=offset
        )
        return jsonify(stories)
    
    # AI assistance endpoint
    @app.route('/api/assist', methods=['POST'])
    def get_assistance():
        """Get AI writing assistance."""
        data = request.get_json()
        result = story_service.get_writing_assistance(
            partial_content=data['content'],
            context=data.get('context')
        )
        return jsonify(result)
    
    # Canon endpoints
    @app.route('/api/canon', methods=['POST'])
    def create_canon_rule():
        """Create a new canon rule."""
        data = request.get_json()
        try:
            rule = canon_service.create_canon_rule(
                title=data['title'],
                description=data['description'],
                category=data['category'],
                content=data['content'],
                references=data.get('references')
            )
            return jsonify(rule), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    @app.route('/api/canon/<rule_id>', methods=['GET'])
    def get_canon_rule(rule_id: str):
        """Get a canon rule by ID."""
        rule = canon_service.get_canon_rule(rule_id)
        if rule:
            return jsonify(rule)
        return jsonify({"error": "Canon rule not found"}), 404
    
    @app.route('/api/canon', methods=['GET'])
    def list_canon_rules():
        """List canon rules."""
        category = request.args.get('category')
        rules = canon_service.list_canon_rules(category=category)
        return jsonify(rules)
    
    # World endpoint
    @app.route('/api/world', methods=['GET'])
    def get_world():
        """Get the world lore."""
        world = world_repo.get_world()
        return jsonify(world.to_dict())
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
