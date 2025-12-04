#!/usr/bin/env python3
"""
Command-line interface for the Everloop Story Engine.
"""

import sys
import json
from everloop.models import StoryStatus
from everloop.storage import (
    StoryRepository,
    WriterRepository,
    CanonRepository,
    WorldRepository
)
from everloop.ai_assistant import AIWritingAssistant
from everloop.services import StoryService, WriterService, CanonService
from everloop.initialize import initialize_world, create_example_data


def main():
    """Main CLI entry point."""
    # Initialize repositories
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    
    # Initialize world
    initialize_world(canon_repo)
    
    # Initialize AI assistant
    world = world_repo.get_world()
    ai_assistant = AIWritingAssistant(world)
    
    # Initialize services
    story_service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    writer_service = WriterService(writer_repo)
    canon_service = CanonService(canon_repo)
    
    # Create example data
    example_data = create_example_data(writer_service)
    
    print("=" * 60)
    print("Everloop - Shared Story Engine")
    print("=" * 60)
    print()
    
    # Display world info
    print("World Lore:")
    print(f"  Name: {world.name}")
    print(f"  Description: {world.description}")
    print(f"  Canon Rules: {len(world.canon_rules)}")
    print()
    
    # Display canon rules
    print("Canon Rules:")
    for i, rule in enumerate(world.canon_rules, 1):
        print(f"  {i}. {rule.title} ({rule.category})")
    print()
    
    # Display example writers
    print("Example Writers:")
    for writer_data in example_data['writers']:
        print(f"  - {writer_data['username']} (ID: {writer_data['id']})")
    print()
    
    # Create an example story
    print("Creating example story...")
    writer_id = example_data['writers'][0]['id']
    
    story_result = story_service.create_story(
        title="The First Awakening",
        writer_id=writer_id,
        content="""
        Kira opened her eyes to a familiar sight - the dawn breaking over the Eternal Realm,
        painting the sky in shades of gold and crimson. But this time was different. This time,
        she remembered.
        
        The memories flooded back like a torrent: the previous Loop, the one before that, and
        countless others stretching back into infinity. She was a Looper now, one of the rare
        few who could remember when the world reset.
        
        She sat up in her bed, her hands trembling. The Weaver's Code echoed in her mind, though
        she couldn't remember learning it. "Each Loop deserves to unfold naturally," she whispered
        to herself.
        
        But how could she let this Loop unfold naturally when she knew what was coming? When she
        remembered the mistakes, the tragedies, the wars that would consume the realm?
        
        Outside her window, the city of Chronos was beginning to wake. Normal people, going about
        their lives, unaware that they had lived these same days a thousand times before. Unaware
        that in 937 years, it would all reset again.
        
        Kira stood and dressed quickly. She had a choice to make: follow the Code and let events
        unfold, or use her knowledge to try and create a better Loop. Either way, she was no longer
        just living in the Everloop - she was part of its eternal dance.
        """
    )
    
    print(f"  Title: {story_result['story']['title']}")
    print(f"  Summary: {story_result['story']['summary']}")
    print(f"  Tags: {', '.join(story_result['story']['tags'])}")
    print(f"  Status: {story_result['story']['status']}")
    print()
    
    # Display consistency check
    consistency = story_result['consistency']
    print("Canon Consistency Check:")
    print(f"  Consistent: {consistency['consistent']}")
    if consistency['issues']:
        print("  Issues:")
        for issue in consistency['issues']:
            print(f"    - {issue}")
    if consistency['suggestions']:
        print("  Suggestions:")
        for suggestion in consistency['suggestions']:
            print(f"    - {suggestion}")
    print()
    
    # Test AI assistance
    print("Testing AI Writing Assistance...")
    assistance = story_service.get_writing_assistance(
        partial_content="Kira walked through the Fractured Realm, where",
        context={"theme": "exploration"}
    )
    print(f"  Suggestion: {assistance['suggestion']}")
    print()
    
    # Display statistics
    print("=" * 60)
    print("System Statistics:")
    print(f"  Total Writers: {len(writer_service.list_writers())}")
    print(f"  Total Stories: {len(story_service.list_stories())}")
    print(f"  Total Canon Rules: {len(canon_service.list_canon_rules())}")
    print("=" * 60)
    print()
    print("Everloop Story Engine is ready!")
    print("Use the API (run with: python -m everloop.api) to interact with the system.")
    print()


if __name__ == '__main__':
    main()
