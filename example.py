"""
Example script demonstrating the Everloop Story Engine API.
"""

from everloop.models import WorldLore
from everloop.storage import (
    StoryRepository,
    WriterRepository,
    CanonRepository,
    WorldRepository
)
from everloop.ai_assistant import AIWritingAssistant
from everloop.services import StoryService, WriterService, CanonService
from everloop.initialize import initialize_world


def main():
    """Demonstrate the Everloop Story Engine."""
    
    # Set up repositories
    story_repo = StoryRepository()
    writer_repo = WriterRepository()
    canon_repo = CanonRepository()
    world_repo = WorldRepository(canon_repo)
    
    # Initialize world with base canon
    initialize_world(canon_repo)
    
    # Set up services
    world = world_repo.get_world()
    ai_assistant = AIWritingAssistant(world)
    story_service = StoryService(story_repo, writer_repo, world_repo, ai_assistant)
    writer_service = WriterService(writer_repo)
    canon_service = CanonService(canon_repo)
    
    print("=" * 70)
    print("Everloop Story Engine - Example Usage")
    print("=" * 70)
    print()
    
    # 1. Register a writer
    print("1. Registering a new writer...")
    writer = writer_service.register_writer(
        username="example_writer",
        email="writer@everloop.world"
    )
    print(f"   ✓ Created writer: {writer['username']} (ID: {writer['id']})")
    print()
    
    # 2. View world lore
    print("2. Exploring the world lore...")
    print(f"   World: {world.name}")
    print(f"   Description: {world.description}")
    print(f"   Available canon rules: {len(world.canon_rules)}")
    for rule in world.canon_rules[:3]:
        print(f"     - {rule.title} ({rule.category})")
    print()
    
    # 3. Create a story
    print("3. Creating a new story...")
    story_result = story_service.create_story(
        title="Echoes in the Void",
        writer_id=writer['id'],
        content="""
        The Void Between stretched endlessly, a space of infinite nothing and everything
        at once. Sera, a seasoned Looper with memories spanning seven cycles, floated in
        the emptiness, searching for answers.
        
        She had violated the Weaver's Code. In her desperation to prevent a catastrophic
        war in the previous Loop, she had revealed the truth to a non-Looper. Now, the
        consequences rippled through the fabric of reality itself.
        
        Around her, Echoes of past events flickered like distant stars—fragments of 
        previous Loops, remnants of choices made and unmade. She reached out to touch one,
        and memories flooded her mind: a kingdom falling, a hero rising, a love lost and
        found again across countless iterations.
        
        But something was different this time. The Echoes were changing, merging, creating
        something new. The Loop cycle itself was evolving, and Sera realized with growing
        horror that she might have triggered the end of the cycle entirely.
        
        Or perhaps, she thought, gazing into the swirling chaos of possibility, this was
        the beginning of something better.
        """,
        tags=["void", "loopers", "philosophy"]
    )
    
    story = story_result['story']
    print(f"   ✓ Created story: {story['title']}")
    print(f"   Summary: {story['summary'][:100]}...")
    print(f"   Auto-suggested tags: {', '.join(story['tags'])}")
    print()
    
    # 4. Check canon consistency
    print("4. Checking canon consistency...")
    consistency = story_result['consistency']
    print(f"   Consistent with canon: {consistency['consistent']}")
    if consistency['suggestions']:
        print("   AI Suggestions:")
        for suggestion in consistency['suggestions'][:2]:
            print(f"     - {suggestion}")
    print()
    
    # 5. Get AI writing assistance
    print("5. Getting AI writing assistance...")
    assistance = story_service.get_writing_assistance(
        partial_content="In the Fractured Realm, where timelines overlap,",
        context={"theme": "temporal anomaly", "tone": "mysterious"}
    )
    print(f"   AI Suggestion: {assistance['suggestion'][:150]}...")
    print()
    
    # 6. Publish the story
    print("6. Publishing the story...")
    publish_result = story_service.publish_story(story['id'])
    if publish_result['published']:
        print(f"   ✓ Story published successfully!")
        print(f"   Status: {publish_result['story']['status']}")
        print(f"   Canon level: {publish_result['story']['canon_level']}")
        
        # Check writer reputation
        updated_writer = writer_service.get_writer(writer['id'])
        print(f"   Writer reputation increased: {updated_writer['reputation']} points")
    print()
    
    # 7. List all stories
    print("7. Listing all stories in the universe...")
    all_stories = story_service.list_stories()
    print(f"   Total stories: {len(all_stories)}")
    for s in all_stories:
        print(f"     - {s['title']} by writer {s['writer_id'][:8]}...")
    print()
    
    # 8. View canon by category
    print("8. Viewing canon rules by category...")
    magic_rules = canon_service.list_canon_rules(category="magic_system")
    print(f"   Magic System rules: {len(magic_rules)}")
    for rule in magic_rules:
        print(f"     - {rule['title']}")
    print()
    
    print("=" * 70)
    print("Example complete! The Everloop Story Engine is ready for collaboration.")
    print("=" * 70)


if __name__ == '__main__':
    main()
