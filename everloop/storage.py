"""
Storage layer for the Everloop Story Engine.
In-memory storage for simplicity. Can be extended to use databases.
"""

from typing import List, Optional, Dict
from datetime import datetime
import uuid
from everloop.models import Story, Writer, CanonRule, WorldLore, StoryStatus, CanonLevel


class StoryRepository:
    """Repository for managing stories."""
    
    def __init__(self):
        self._stories: Dict[str, Story] = {}
    
    def create(self, story: Story) -> Story:
        """Create a new story."""
        if not story.id:
            story.id = str(uuid.uuid4())
        story.created_at = datetime.utcnow()
        story.updated_at = datetime.utcnow()
        self._stories[story.id] = story
        return story
    
    def get(self, story_id: str) -> Optional[Story]:
        """Get a story by ID."""
        return self._stories.get(story_id)
    
    def update(self, story: Story) -> Story:
        """Update an existing story."""
        story.updated_at = datetime.utcnow()
        self._stories[story.id] = story
        return story
    
    def delete(self, story_id: str) -> bool:
        """Delete a story."""
        if story_id in self._stories:
            del self._stories[story_id]
            return True
        return False
    
    def list_by_writer(self, writer_id: str) -> List[Story]:
        """List all stories by a specific writer."""
        return [s for s in self._stories.values() if s.writer_id == writer_id]
    
    def list_by_status(self, status: StoryStatus) -> List[Story]:
        """List all stories with a specific status."""
        return [s for s in self._stories.values() if s.status == status]
    
    def list_all(self, limit: int = 100, offset: int = 0) -> List[Story]:
        """List all stories with pagination."""
        all_stories = sorted(
            self._stories.values(),
            key=lambda s: s.created_at,
            reverse=True
        )
        return all_stories[offset:offset + limit]


class WriterRepository:
    """Repository for managing writers."""
    
    def __init__(self):
        self._writers: Dict[str, Writer] = {}
    
    def create(self, writer: Writer) -> Writer:
        """Create a new writer."""
        if not writer.id:
            writer.id = str(uuid.uuid4())
        writer.created_at = datetime.utcnow()
        self._writers[writer.id] = writer
        return writer
    
    def get(self, writer_id: str) -> Optional[Writer]:
        """Get a writer by ID."""
        return self._writers.get(writer_id)
    
    def get_by_username(self, username: str) -> Optional[Writer]:
        """Get a writer by username."""
        for writer in self._writers.values():
            if writer.username == username:
                return writer
        return None
    
    def update(self, writer: Writer) -> Writer:
        """Update an existing writer."""
        self._writers[writer.id] = writer
        return writer
    
    def list_all(self) -> List[Writer]:
        """List all writers."""
        return list(self._writers.values())


class CanonRepository:
    """Repository for managing canon rules."""
    
    def __init__(self):
        self._rules: Dict[str, CanonRule] = {}
    
    def create(self, rule: CanonRule) -> CanonRule:
        """Create a new canon rule."""
        if not rule.id:
            rule.id = str(uuid.uuid4())
        rule.created_at = datetime.utcnow()
        rule.updated_at = datetime.utcnow()
        self._rules[rule.id] = rule
        return rule
    
    def get(self, rule_id: str) -> Optional[CanonRule]:
        """Get a canon rule by ID."""
        return self._rules.get(rule_id)
    
    def update(self, rule: CanonRule) -> CanonRule:
        """Update an existing canon rule."""
        rule.updated_at = datetime.utcnow()
        self._rules[rule.id] = rule
        return rule
    
    def delete(self, rule_id: str) -> bool:
        """Delete a canon rule."""
        if rule_id in self._rules:
            del self._rules[rule_id]
            return True
        return False
    
    def list_by_category(self, category: str) -> List[CanonRule]:
        """List all canon rules in a category."""
        return [r for r in self._rules.values() if r.category == category]
    
    def list_all(self) -> List[CanonRule]:
        """List all canon rules."""
        return list(self._rules.values())


class WorldRepository:
    """Repository for managing world lore."""
    
    def __init__(self, canon_repo: CanonRepository):
        self.canon_repo = canon_repo
        self._world: Optional[WorldLore] = None
    
    def get_world(self) -> WorldLore:
        """Get the world lore."""
        if self._world is None:
            self._world = WorldLore(
                canon_rules=self.canon_repo.list_all()
            )
        else:
            # Update canon rules
            self._world.canon_rules = self.canon_repo.list_all()
        return self._world
    
    def update_world(self, world: WorldLore) -> WorldLore:
        """Update world lore."""
        self._world = world
        return self._world
