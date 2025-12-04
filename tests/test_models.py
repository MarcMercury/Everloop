"""
Tests for data models.
"""

import pytest
from datetime import datetime
from everloop.models import (
    Writer, CanonRule, Story, WorldLore,
    StoryStatus, CanonLevel
)


def test_writer_creation():
    """Test creating a Writer instance."""
    writer = Writer(
        id="writer-1",
        username="test_writer",
        email="test@example.com"
    )
    
    assert writer.id == "writer-1"
    assert writer.username == "test_writer"
    assert writer.email == "test@example.com"
    assert writer.stories_count == 0
    assert writer.reputation == 0
    assert isinstance(writer.created_at, datetime)


def test_writer_to_dict():
    """Test Writer serialization to dictionary."""
    writer = Writer(
        id="writer-1",
        username="test_writer",
        email="test@example.com"
    )
    
    data = writer.to_dict()
    
    assert data['id'] == "writer-1"
    assert data['username'] == "test_writer"
    assert data['email'] == "test@example.com"
    assert 'created_at' in data


def test_canon_rule_creation():
    """Test creating a CanonRule instance."""
    rule = CanonRule(
        id="rule-1",
        title="Test Rule",
        description="A test canon rule",
        category="magic_system",
        content="This is the rule content"
    )
    
    assert rule.id == "rule-1"
    assert rule.title == "Test Rule"
    assert rule.category == "magic_system"
    assert len(rule.references) == 0


def test_story_creation():
    """Test creating a Story instance."""
    story = Story(
        id="story-1",
        title="Test Story",
        writer_id="writer-1",
        content="Once upon a time..."
    )
    
    assert story.id == "story-1"
    assert story.title == "Test Story"
    assert story.status == StoryStatus.DRAFT
    assert story.canon_level == CanonLevel.SANDBOX
    assert len(story.tags) == 0


def test_story_status_enum():
    """Test StoryStatus enum values."""
    assert StoryStatus.DRAFT.value == "draft"
    assert StoryStatus.IN_REVIEW.value == "in_review"
    assert StoryStatus.PUBLISHED.value == "published"
    assert StoryStatus.ARCHIVED.value == "archived"


def test_canon_level_enum():
    """Test CanonLevel enum values."""
    assert CanonLevel.CORE.value == "core"
    assert CanonLevel.EXPANDED.value == "expanded"
    assert CanonLevel.COMMUNITY.value == "community"
    assert CanonLevel.SANDBOX.value == "sandbox"


def test_world_lore_creation():
    """Test creating a WorldLore instance."""
    world = WorldLore()
    
    assert world.id == "everloop_world"
    assert world.name == "Everloop"
    assert "fantasy universe" in world.description.lower()
    assert len(world.canon_rules) == 0
