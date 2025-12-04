"""
Data models for the Everloop Story Engine.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum


class StoryStatus(Enum):
    """Status of a story in the system."""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class CanonLevel(Enum):
    """Canon level indicates how official/canonical a story is."""
    CORE = "core"  # Official canon, foundational lore
    EXPANDED = "expanded"  # Official but supplementary
    COMMUNITY = "community"  # Community-contributed, verified
    SANDBOX = "sandbox"  # Experimental, not yet verified


@dataclass
class Writer:
    """Represents a writer in the Everloop universe."""
    id: str
    username: str
    email: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    stories_count: int = 0
    reputation: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
            "stories_count": self.stories_count,
            "reputation": self.reputation
        }


@dataclass
class CanonRule:
    """Represents a canonical rule or fact in the Everloop universe."""
    id: str
    title: str
    description: str
    category: str  # e.g., "magic_system", "geography", "history", "culture"
    content: str
    references: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "content": self.content,
            "references": self.references,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


@dataclass
class Story:
    """Represents a story in the Everloop universe."""
    id: str
    title: str
    writer_id: str
    content: str
    summary: str = ""
    status: StoryStatus = StoryStatus.DRAFT
    canon_level: CanonLevel = CanonLevel.SANDBOX
    tags: List[str] = field(default_factory=list)
    referenced_canon: List[str] = field(default_factory=list)  # IDs of canon rules referenced
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "writer_id": self.writer_id,
            "content": self.content,
            "summary": self.summary,
            "status": self.status.value,
            "canon_level": self.canon_level.value,
            "tags": self.tags,
            "referenced_canon": self.referenced_canon,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "published_at": self.published_at.isoformat() if self.published_at else None
        }


@dataclass
class WorldLore:
    """Represents the overarching world lore and setting."""
    id: str = "everloop_world"
    name: str = "Everloop"
    description: str = "A fantasy universe where time loops and reality bends."
    setting: str = ""
    themes: List[str] = field(default_factory=list)
    canon_rules: List[CanonRule] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "setting": self.setting,
            "themes": self.themes,
            "canon_rules": [rule.to_dict() for rule in self.canon_rules]
        }
