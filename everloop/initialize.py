"""
Initialize the Everloop world with base canon and example data.
"""

from everloop.models import CanonRule, WorldLore
from everloop.storage import CanonRepository, WriterRepository, WorldRepository
from everloop.services import CanonService, WriterService


def initialize_world(canon_repo: CanonRepository) -> None:
    """Initialize the Everloop world with base canon rules."""
    canon_service = CanonService(canon_repo)
    
    # Core magic system rules
    canon_service.create_canon_rule(
        title="The Loop Cycle",
        description="The fundamental nature of time in Everloop",
        category="magic_system",
        content="""
        In the Everloop universe, time does not flow linearly. Instead, it moves in cycles
        called Loops. Each Loop lasts approximately 1000 years before reality resets to a
        previous state. However, certain individuals called Loopers retain memories across
        cycles, allowing them to influence future iterations.
        """
    )
    
    canon_service.create_canon_rule(
        title="The Three Realms",
        description="The geographical divisions of Everloop",
        category="geography",
        content="""
        The world of Everloop is divided into three distinct realms:
        1. The Eternal Realm - where time flows normally within each Loop
        2. The Fractured Realm - where multiple timeline fragments overlap
        3. The Void Between - the space between Loops, accessible only to powerful Loopers
        """
    )
    
    canon_service.create_canon_rule(
        title="Looper Abilities",
        description="Powers granted to those who remember",
        category="magic_system",
        content="""
        Loopers possess unique abilities:
        - Perfect recall of previous Loops
        - Ability to sense temporal anomalies
        - Limited capacity to create Echoes (shadows of past events)
        - Resistance to timeline alterations
        The more Loops a person has witnessed, the stronger their abilities become.
        """
    )
    
    canon_service.create_canon_rule(
        title="The First Loop",
        description="The origin of the cycle",
        category="history",
        content="""
        According to ancient texts, the First Loop began when the Primordial Weaver
        attempted to create a perfect world. Unable to achieve perfection, the Weaver
        instead created a world that would continually recreate itself, learning and
        evolving with each iteration. The Weaver's final act was to scatter fragments
        of their consciousness across time, creating the first Loopers.
        """
    )
    
    canon_service.create_canon_rule(
        title="The Weaver's Code",
        description="Ethical guidelines for Loopers",
        category="culture",
        content="""
        Loopers are expected to follow the Weaver's Code:
        1. Preserve the integrity of the Loop cycle
        2. Do not reveal the truth of Loops to non-Loopers without cause
        3. Each Loop deserves to unfold naturally
        4. Knowledge from previous Loops should guide, not dictate
        5. The Void Between is sacred and must be respected
        """
    )


def create_example_data(writer_service: WriterService) -> dict:
    """Create example writers and stories."""
    # Create example writers
    writer1 = writer_service.register_writer(
        username="timekeeper_aria",
        email="aria@everloop.world"
    )
    
    writer2 = writer_service.register_writer(
        username="chronicler_vex",
        email="vex@everloop.world"
    )
    
    return {
        "writers": [writer1, writer2]
    }
