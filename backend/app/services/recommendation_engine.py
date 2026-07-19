"""Creates personalized study recommendations from evaluation signals."""


class RecommendationEngine:
    def generate(self, scores: dict[str, int]) -> dict:
        weak_complexity = scores["complexity_analysis"] < 70
        weak_edges = scores["edge_case_awareness"] < 70
        weak_code = scores["code_quality"] < 70

        topics = ["Hash maps", "Complexity analysis", "Edge cases"]
        if weak_code:
            topics.append("Clean implementation practice")

        return {
            "leetcode_patterns": ["Hash Map Lookup", "Two Pointers", "Sliding Window", "Prefix Sum"],
            "topics": topics,
            "difficulty_progression": "Easy -> Easy timed drills -> Medium pattern recognition -> Medium mock interviews",
            "suggested_next_problems": [
                "Contains Duplicate",
                "Valid Anagram",
                "Group Anagrams",
                "Top K Frequent Elements",
                "Longest Substring Without Repeating Characters",
            ],
            "four_week_roadmap": [
                {"week": "Week 1", "focus": "Hash maps and clean explanation", "goal": "Solve 8 easy problems while narrating approach aloud."},
                {"week": "Week 2", "focus": "Complexity and edge cases", "goal": "Add time/space analysis and edge-case checklist to every solution."},
                {"week": "Week 3", "focus": "Medium pattern transfer", "goal": "Practice 6 medium problems across hash map and sliding window patterns."},
                {"week": "Week 4", "focus": "Mock interview pacing", "goal": "Run 3 timed mock interviews and review communication gaps."},
            ],
            "priority": "Review complexity claims first." if weak_complexity else "Keep building consistency through timed mocks.",
            "edge_case_focus": weak_edges,
        }


recommendation_engine = RecommendationEngine()
