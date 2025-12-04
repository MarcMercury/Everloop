"""
Tests for service layer.
"""

import pytest
from everloop.models import Story, Writer, CanonRule, StoryStatus
from everloop.storage import (
    StoryRepository, WriterRepository, CanonRepository, WorldRepository
)
from everloop.ai_assistant import AIWritingAssistant
from everloop.services import StoryService, WriterService, CanonService


def test_writer_service_register():
    """Test registering a new writer."""
    writer_repo = WriterRepository()
    service = WriterService(writer_repo)
    
    writer_data = service.register_writer("test_user", "test@example.com")
    
    assert writer_data['username'] == "test_user"
    assert writer_data['email'] == "test@example.com"
    assert 'id' in writer_data


def test_writer_service_duplicate_username():
    """Test that duplicate usernames are rejected."""
    writer_repo = WriterRepository()
    service = WriterService(writer_repo)
    
    service.register_writer("test_user", "test1@example.com")
    
    with pytest.raises(ValueError, match="already exists"):
        service.register_writer("test_user", "test2@example.com")


def test_canon_service_create_rule():
    """Test creating a canon rule."""
    canon_repo = CanonRepository()
    service = CanonService(canon_repo)
    
    rule_data = service.create_canon_rule(
        title="Test Rule",
        description="A test rule",
        category="magic_system",
        content="Test content"
    )
    
    assert rule_data['title'] == "Test Rule"
    assert rule_data['category'] == "magic_system"
    assert 'id' in rule_data


def test_story_service_create():
    """Test creating a story with the service."""
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    ai_assistant = AIWritingAssistant(world_repo.get_world())
    
    service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    
    # Create a writer first
    writer = Writer(id="w1", username="test", email="test@example.com")
    writer_repo.create(writer)
    
    # Create story
    result = service.create_story(
        title="Test Story",
        writer_id="w1",
        content="Test content for the story"
    )
    
    assert 'story' in result
    assert 'consistency' in result
    assert result['story']['title'] == "Test Story"
    assert result['story']['writer_id'] == "w1"


def test_story_service_create_invalid_writer():
    """Test creating a story with invalid writer ID."""
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    ai_assistant = AIWritingAssistant(world_repo.get_world())
    
    service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    
    with pytest.raises(ValueError, match="not found"):
        service.create_story(
            title="Test Story",
            writer_id="nonexistent",
            content="Test content"
        )


def test_story_service_publish():
    """Test publishing a story."""
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    ai_assistant = AIWritingAssistant(world_repo.get_world())
    
    service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    
    # Create writer and story
    writer = Writer(id="w1", username="test", email="test@example.com")
    writer_repo.create(writer)
    
    result = service.create_story(
        title="Test Story",
        writer_id="w1",
        content="Test content"
    )
    
    story_id = result['story']['id']
    
    # Publish the story
    publish_result = service.publish_story(story_id)
    
    assert publish_result['published'] is True
    assert publish_result['story']['status'] == StoryStatus.PUBLISHED.value


def test_story_service_get_assistance():
    """Test getting writing assistance."""
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    ai_assistant = AIWritingAssistant(world_repo.get_world())
    
    service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    
    result = service.get_writing_assistance(
        partial_content="The hero began their journey",
        context={"theme": "adventure"}
    )
    
    assert 'suggestion' in result
    assert 'world_context' in result
    assert isinstance(result['suggestion'], str)
