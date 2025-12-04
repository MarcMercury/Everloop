"""
Tests for AI assistant functionality.
"""

import pytest
from everloop.models import Story, CanonRule, WorldLore
from everloop.ai_assistant import AIWritingAssistant


def test_ai_assistant_initialization():
    """Test initializing the AI assistant."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    assert assistant.world_lore == world
    assert len(assistant.canon_rules) == 0


def test_check_canon_consistency_valid():
    """Test checking canon consistency for a valid story."""
    rule = CanonRule(
        id="r1",
        title="Test Rule",
        description="Test",
        category="magic_system",
        content="magic spell enchant"
    )
    
    world = WorldLore(canon_rules=[rule])
    assistant = AIWritingAssistant(world)
    
    story = Story(
        id="s1",
        title="Test",
        writer_id="w1",
        content="A simple story without issues",
        referenced_canon=[]
    )
    
    result = assistant.check_canon_consistency(story)
    
    assert result['consistent'] is True
    assert len(result['issues']) == 0


def test_check_canon_consistency_missing_reference():
    """Test checking consistency when referenced canon doesn't exist."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    story = Story(
        id="s1",
        title="Test",
        writer_id="w1",
        content="Test content",
        referenced_canon=["nonexistent-rule"]
    )
    
    result = assistant.check_canon_consistency(story)
    
    assert result['consistent'] is False
    assert len(result['issues']) > 0


def test_generate_summary_short_content():
    """Test summary generation for short content."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    story = Story(
        id="s1",
        title="Short Story",
        writer_id="w1",
        content="This is a short story."
    )
    
    summary = assistant.generate_summary(story)
    
    assert summary == "This is a short story."


def test_generate_summary_long_content():
    """Test summary generation for long content."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    long_content = "A" * 300
    story = Story(
        id="s1",
        title="Long Story",
        writer_id="w1",
        content=long_content
    )
    
    summary = assistant.generate_summary(story)
    
    assert len(summary) <= 203  # 200 chars + "..."
    assert summary.endswith("...")


def test_suggest_tags():
    """Test tag suggestion based on content."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    story = Story(
        id="s1",
        title="Test",
        writer_id="w1",
        content="The wizard cast a powerful spell that created a magical loop in time, "
                "starting a new quest for the brave adventurer."
    )
    
    tags = assistant.suggest_tags(story)
    
    assert isinstance(tags, list)
    # Should suggest magic and adventure based on keywords
    assert "magic" in tags or "adventure" in tags


def test_suggest_continuation():
    """Test getting writing continuation suggestions."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    suggestion = assistant.suggest_continuation(
        "The hero walked into the forest",
        {}
    )
    
    assert isinstance(suggestion, str)
    assert len(suggestion) > 0


def test_validate_world_rules():
    """Test validating content against world rules."""
    world = WorldLore()
    assistant = AIWritingAssistant(world)
    
    result = assistant.validate_world_rules("Test content")
    
    assert 'valid' in result
    assert 'violations' in result
    assert 'warnings' in result
