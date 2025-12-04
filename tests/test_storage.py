"""
Tests for storage repositories.
"""

import pytest
from everloop.models import Story, Writer, CanonRule, StoryStatus
from everloop.storage import (
    StoryRepository, WriterRepository, CanonRepository, WorldRepository
)


def test_story_repository_create():
    """Test creating a story in the repository."""
    repo = StoryRepository()
    
    story = Story(
        id="",
        title="Test Story",
        writer_id="writer-1",
        content="Test content"
    )
    
    created = repo.create(story)
    
    assert created.id != ""
    assert created.title == "Test Story"
    assert created.created_at is not None


def test_story_repository_get():
    """Test retrieving a story from the repository."""
    repo = StoryRepository()
    
    story = Story(
        id="story-1",
        title="Test Story",
        writer_id="writer-1",
        content="Test content"
    )
    
    repo.create(story)
    retrieved = repo.get("story-1")
    
    assert retrieved is not None
    assert retrieved.title == "Test Story"


def test_story_repository_update():
    """Test updating a story in the repository."""
    repo = StoryRepository()
    
    story = Story(
        id="story-1",
        title="Original Title",
        writer_id="writer-1",
        content="Original content"
    )
    
    repo.create(story)
    
    story.title = "Updated Title"
    updated = repo.update(story)
    
    assert updated.title == "Updated Title"
    assert updated.updated_at is not None


def test_story_repository_list_by_writer():
    """Test listing stories by writer."""
    repo = StoryRepository()
    
    story1 = Story(id="s1", title="Story 1", writer_id="w1", content="C1")
    story2 = Story(id="s2", title="Story 2", writer_id="w1", content="C2")
    story3 = Story(id="s3", title="Story 3", writer_id="w2", content="C3")
    
    repo.create(story1)
    repo.create(story2)
    repo.create(story3)
    
    w1_stories = repo.list_by_writer("w1")
    
    assert len(w1_stories) == 2
    assert all(s.writer_id == "w1" for s in w1_stories)


def test_writer_repository_create():
    """Test creating a writer in the repository."""
    repo = WriterRepository()
    
    writer = Writer(
        id="",
        username="test_user",
        email="test@example.com"
    )
    
    created = repo.create(writer)
    
    assert created.id != ""
    assert created.username == "test_user"


def test_writer_repository_get_by_username():
    """Test retrieving a writer by username."""
    repo = WriterRepository()
    
    writer = Writer(
        id="w1",
        username="test_user",
        email="test@example.com"
    )
    
    repo.create(writer)
    retrieved = repo.get_by_username("test_user")
    
    assert retrieved is not None
    assert retrieved.id == "w1"


def test_canon_repository_create():
    """Test creating a canon rule in the repository."""
    repo = CanonRepository()
    
    rule = CanonRule(
        id="",
        title="Test Rule",
        description="Test description",
        category="magic_system",
        content="Test content"
    )
    
    created = repo.create(rule)
    
    assert created.id != ""
    assert created.title == "Test Rule"


def test_canon_repository_list_by_category():
    """Test listing canon rules by category."""
    repo = CanonRepository()
    
    rule1 = CanonRule(id="r1", title="R1", description="D1", category="magic", content="C1")
    rule2 = CanonRule(id="r2", title="R2", description="D2", category="magic", content="C2")
    rule3 = CanonRule(id="r3", title="R3", description="D3", category="geography", content="C3")
    
    repo.create(rule1)
    repo.create(rule2)
    repo.create(rule3)
    
    magic_rules = repo.list_by_category("magic")
    
    assert len(magic_rules) == 2
    assert all(r.category == "magic" for r in magic_rules)


def test_world_repository_get_world():
    """Test getting world lore."""
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    
    # Add some canon rules
    rule = CanonRule(id="r1", title="R1", description="D1", category="history", content="C1")
    canon_repo.create(rule)
    
    world = world_repo.get_world()
    
    assert world.name == "Everloop"
    assert len(world.canon_rules) == 1
