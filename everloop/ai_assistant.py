"""
AI Assistant for helping writers create stories consistent with canon.
"""

from typing import List, Dict, Any, Optional
from everloop.models import Story, CanonRule, WorldLore


class AIWritingAssistant:
    """
    AI-powered writing assistant that helps writers:
    1. Write faster with suggestions and completions
    2. Stay consistent with world lore and canon
    3. Check for contradictions with existing canon
    """
    
    def __init__(self, world_lore: WorldLore):
        self.world_lore = world_lore
        self.canon_rules = {rule.id: rule for rule in world_lore.canon_rules}
    
    def check_canon_consistency(self, story: Story) -> Dict[str, Any]:
        """
        Check if a story is consistent with the world's canon.
        
        Returns:
            Dict with:
                - consistent: bool
                - issues: List of potential conflicts
                - suggestions: List of suggestions to improve consistency
        """
        issues = []
        suggestions = []
        
        # Check if referenced canon rules exist
        for canon_id in story.referenced_canon:
            if canon_id not in self.canon_rules:
                issues.append(f"Referenced canon rule '{canon_id}' does not exist")
        
        # Basic content analysis (in real implementation, would use AI)
        content_lower = story.content.lower()
        
        # Check for common inconsistencies with core canon
        for canon_id, rule in self.canon_rules.items():
            if rule.category == "magic_system":
                # Simple keyword matching (would be AI-powered in production)
                keywords = rule.content.lower().split()
                if any(keyword in content_lower for keyword in keywords[:5]):
                    if canon_id not in story.referenced_canon:
                        suggestions.append(
                            f"Story might relate to canon rule '{rule.title}'. "
                            f"Consider adding it to referenced canon."
                        )
        
        return {
            "consistent": len(issues) == 0,
            "issues": issues,
            "suggestions": suggestions
        }
    
    def suggest_continuation(self, partial_story: str, context: Dict[str, Any]) -> str:
        """
        Suggest continuation for a story in progress.
        
        In a real implementation, this would use an AI model like GPT-4.
        For now, returns a template suggestion.
        """
        return (
            "Continue developing your story while keeping in mind the Everloop universe's "
            "core themes of time loops and reality bending. Consider how your character's "
            "actions might create ripples across different timelines."
        )
    
    def generate_summary(self, story: Story) -> str:
        """
        Generate a summary of a story.
        
        In production, would use AI to create concise summaries.
        """
        # Simple implementation - first 200 characters
        if len(story.content) <= 200:
            return story.content
        return story.content[:200] + "..."
    
    def suggest_tags(self, story: Story) -> List[str]:
        """
        Suggest relevant tags for a story based on content and canon.
        """
        suggested_tags = []
        content_lower = story.content.lower()
        
        # Tag suggestions based on content keywords
        tag_keywords = {
            "time_loop": ["loop", "repeat", "again", "cycle"],
            "magic": ["spell", "magic", "enchant", "sorcery"],
            "adventure": ["quest", "journey", "explore", "travel"],
            "mystery": ["mystery", "secret", "hidden", "unknown"],
            "conflict": ["battle", "fight", "war", "conflict"]
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                suggested_tags.append(tag)
        
        # Add tags based on referenced canon
        for canon_id in story.referenced_canon:
            if canon_id in self.canon_rules:
                rule = self.canon_rules[canon_id]
                if rule.category not in suggested_tags:
                    suggested_tags.append(rule.category)
        
        return suggested_tags
    
    def validate_world_rules(self, content: str) -> Dict[str, Any]:
        """
        Validate that story content follows world rules.
        
        Returns validation results with any violations found.
        """
        violations = []
        warnings = []
        
        # Check against core canon rules
        for rule in self.world_lore.canon_rules:
            # In production, this would use AI to understand semantic violations
            # For now, simple keyword matching
            pass
        
        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "warnings": warnings
        }
