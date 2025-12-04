"""
Service layer for the Everloop Story Engine.
Coordinates between repositories and AI assistant.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from everloop.models import Story, Writer, CanonRule, WorldLore, StoryStatus, CanonLevel
from everloop.storage import StoryRepository, WriterRepository, CanonRepository, WorldRepository
from everloop.ai_assistant import AIWritingAssistant


class StoryService:
    """Service for managing stories with AI assistance."""
    
    def __init__(
        self,
        story_repo: StoryRepository,
        writer_repo: WriterRepository,
        world_repo: WorldRepository,
        ai_assistant: AIWritingAssistant
    ):
        self.story_repo = story_repo
        self.writer_repo = writer_repo
        self.ai_assistant = ai_assistant
        self.world_repo = world_repo
    
    def create_story(
        self,
        title: str,
        writer_id: str,
        content: str,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a new story with AI assistance.
        
        Returns the created story along with AI suggestions.
        """
        # Verify writer exists
        writer = self.writer_repo.get(writer_id)
        if not writer:
            raise ValueError(f"Writer {writer_id} not found")
        
        # Create story
        story = Story(
            id="",
            title=title,
            writer_id=writer_id,
            content=content,
            tags=tags or []
        )
        
        # Generate summary
        story.summary = self.ai_assistant.generate_summary(story)
        
        # Suggest tags if none provided
        if not story.tags:
            story.tags = self.ai_assistant.suggest_tags(story)
        
        # Save story
        story = self.story_repo.create(story)
        
        # Update writer stats
        writer.stories_count += 1
        self.writer_repo.update(writer)
        
        # Check consistency
        consistency_check = self.ai_assistant.check_canon_consistency(story)
        
        return {
            "story": story.to_dict(),
            "consistency": consistency_check,
            "suggested_tags": self.ai_assistant.suggest_tags(story)
        }
    
    def update_story(
        self,
        story_id: str,
        **updates
    ) -> Dict[str, Any]:
        """Update a story and re-check consistency."""
        story = self.story_repo.get(story_id)
        if not story:
            raise ValueError(f"Story {story_id} not found")
        
        # Update fields
        for key, value in updates.items():
            if hasattr(story, key):
                setattr(story, key, value)
        
        # Regenerate summary if content changed
        if "content" in updates:
            story.summary = self.ai_assistant.generate_summary(story)
        
        # Save
        story = self.story_repo.update(story)
        
        # Check consistency
        consistency_check = self.ai_assistant.check_canon_consistency(story)
        
        return {
            "story": story.to_dict(),
            "consistency": consistency_check
        }
    
    def get_story(self, story_id: str) -> Optional[Dict[str, Any]]:
        """Get a story by ID."""
        story = self.story_repo.get(story_id)
        if story:
            return story.to_dict()
        return None
    
    def publish_story(self, story_id: str) -> Dict[str, Any]:
        """
        Publish a story after validating canon consistency.
        """
        story = self.story_repo.get(story_id)
        if not story:
            raise ValueError(f"Story {story_id} not found")
        
        # Check consistency before publishing
        consistency = self.ai_assistant.check_canon_consistency(story)
        
        if not consistency["consistent"]:
            return {
                "published": False,
                "story": story.to_dict(),
                "consistency": consistency,
                "message": "Cannot publish story with canon inconsistencies"
            }
        
        # Update status
        story.status = StoryStatus.PUBLISHED
        story.published_at = datetime.utcnow()
        
        # Increase canon level if high quality
        if story.canon_level == CanonLevel.SANDBOX:
            story.canon_level = CanonLevel.COMMUNITY
        
        story = self.story_repo.update(story)
        
        # Increase writer reputation
        writer = self.writer_repo.get(story.writer_id)
        if writer:
            writer.reputation += 10
            self.writer_repo.update(writer)
        
        return {
            "published": True,
            "story": story.to_dict(),
            "consistency": consistency
        }
    
    def get_writing_assistance(
        self,
        partial_content: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get AI writing assistance for content in progress.
        """
        suggestion = self.ai_assistant.suggest_continuation(
            partial_content,
            context or {}
        )
        
        return {
            "suggestion": suggestion,
            "world_context": self.world_repo.get_world().to_dict()
        }
    
    def list_stories(
        self,
        writer_id: Optional[str] = None,
        status: Optional[StoryStatus] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List stories with filters."""
        if writer_id:
            stories = self.story_repo.list_by_writer(writer_id)
        elif status:
            stories = self.story_repo.list_by_status(status)
        else:
            stories = self.story_repo.list_all(limit, offset)
        
        return [s.to_dict() for s in stories]


class WriterService:
    """Service for managing writers."""
    
    def __init__(self, writer_repo: WriterRepository):
        self.writer_repo = writer_repo
    
    def register_writer(self, username: str, email: str) -> Dict[str, Any]:
        """Register a new writer."""
        # Check if username exists
        existing = self.writer_repo.get_by_username(username)
        if existing:
            raise ValueError(f"Username {username} already exists")
        
        writer = Writer(
            id="",
            username=username,
            email=email
        )
        
        writer = self.writer_repo.create(writer)
        return writer.to_dict()
    
    def get_writer(self, writer_id: str) -> Optional[Dict[str, Any]]:
        """Get writer by ID."""
        writer = self.writer_repo.get(writer_id)
        if writer:
            return writer.to_dict()
        return None
    
    def list_writers(self) -> List[Dict[str, Any]]:
        """List all writers."""
        writers = self.writer_repo.list_all()
        return [w.to_dict() for w in writers]


class CanonService:
    """Service for managing canon rules."""
    
    def __init__(self, canon_repo: CanonRepository):
        self.canon_repo = canon_repo
    
    def create_canon_rule(
        self,
        title: str,
        description: str,
        category: str,
        content: str,
        references: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Create a new canon rule."""
        rule = CanonRule(
            id="",
            title=title,
            description=description,
            category=category,
            content=content,
            references=references or []
        )
        
        rule = self.canon_repo.create(rule)
        return rule.to_dict()
    
    def get_canon_rule(self, rule_id: str) -> Optional[Dict[str, Any]]:
        """Get a canon rule by ID."""
        rule = self.canon_repo.get(rule_id)
        if rule:
            return rule.to_dict()
        return None
    
    def list_canon_rules(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """List canon rules, optionally filtered by category."""
        if category:
            rules = self.canon_repo.list_by_category(category)
        else:
            rules = self.canon_repo.list_all()
        
        return [r.to_dict() for r in rules]
