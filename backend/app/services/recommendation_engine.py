"""Creates personalized study recommendations from evaluation signals."""

from app.models.interview_session import InterviewSession


class RecommendationEngine:
    def generate(self, scores: dict[str, int], session: InterviewSession | None = None) -> dict:
        weak_complexity = scores["complexity_analysis"] < 70
        weak_edges = scores["edge_case_awareness"] < 70
        weak_code = scores["code_quality"] < 70
        problem_family = self._problem_family(session)
        pattern_plan = self._pattern_plan(problem_family)

        topics = [*pattern_plan["topics"], "Complexity analysis", "Edge cases"]
        if weak_code:
            topics.append("Clean implementation practice")

        return {
            "problem_focus": problem_family,
            "leetcode_patterns": pattern_plan["patterns"],
            "topics": topics,
            "difficulty_progression": pattern_plan["difficulty_progression"],
            "suggested_next_problems": pattern_plan["next_problems"],
            "four_week_roadmap": pattern_plan["roadmap"],
            "priority": "Review complexity claims first." if weak_complexity else "Keep building consistency through timed mocks.",
            "edge_case_focus": weak_edges,
        }

    def _problem_family(self, session: InterviewSession | None) -> str:
        if session is None:
            return "general data structures"

        evidence = " ".join(
            [
                session.problem_title,
                session.problem_url,
                session.current_code,
                session.transcript,
                " ".join(message.content for message in session.conversation_history),
            ]
        ).lower()

        if any(token in evidence for token in ("tree", "root", "preorder", "inorder", "postorder", "binary-tree", "dfs")):
            return "binary tree traversal"
        if any(token in evidence for token in ("graph", "node", "edge", "bfs", "visited")):
            return "graph traversal"
        if any(token in evidence for token in ("dynamic programming", " dp ", "memo", "tabulation")):
            return "dynamic programming"
        if any(token in evidence for token in ("sliding", "window", "substring", "subarray")):
            return "sliding window"
        if any(token in evidence for token in ("two pointer", "two-pointer", "left pointer", "right pointer")):
            return "two pointers"
        if any(token in evidence for token in ("hash", "map", "set", "dictionary")):
            return "hash map lookup"
        return "general data structures"

    def _pattern_plan(self, problem_family: str) -> dict:
        plans = {
            "binary tree traversal": {
                "topics": ["Tree traversal", "DFS recursion", "Iterative stack traversal"],
                "patterns": ["Recursive DFS", "Iterative Stack", "Preorder Traversal", "Tree Edge Cases"],
                "difficulty_progression": "Easy tree traversal -> Iterative DFS -> Tree recursion invariants -> Medium tree mocks",
                "next_problems": [
                    "Binary Tree Inorder Traversal",
                    "Binary Tree Postorder Traversal",
                    "Maximum Depth of Binary Tree",
                    "Validate Binary Search Tree",
                    "Binary Tree Level Order Traversal",
                ],
                "roadmap": [
                    {"week": "Week 1", "focus": "Traversal fundamentals", "goal": "Solve preorder, inorder, and postorder recursively while explaining base cases aloud."},
                    {"week": "Week 2", "focus": "Iterative DFS with stack", "goal": "Convert recursive traversals into stack-based versions and compare space complexity."},
                    {"week": "Week 3", "focus": "Tree invariants", "goal": "Practice problems that require preserving node-order or subtree constraints."},
                    {"week": "Week 4", "focus": "Mock tree interviews", "goal": "Run timed tree interviews and explicitly discuss null roots, skewed trees, and complexity."},
                ],
            },
            "graph traversal": {
                "topics": ["Graph traversal", "Visited sets", "BFS/DFS trade-offs"],
                "patterns": ["DFS", "BFS", "Visited Set", "Adjacency Modeling"],
                "difficulty_progression": "Easy graph reachability -> BFS/DFS variants -> Medium graph state problems",
                "next_problems": ["Number of Islands", "Clone Graph", "Course Schedule", "Rotting Oranges", "Pacific Atlantic Water Flow"],
                "roadmap": [
                    {"week": "Week 1", "focus": "DFS/BFS basics", "goal": "Solve reachability problems and narrate visited-state decisions."},
                    {"week": "Week 2", "focus": "Grid graphs", "goal": "Practice boundary checks and multi-source traversal."},
                    {"week": "Week 3", "focus": "Directed graphs", "goal": "Study cycle detection and topological ordering."},
                    {"week": "Week 4", "focus": "Graph mock interviews", "goal": "Run timed graph interviews with explicit complexity analysis."},
                ],
            },
            "dynamic programming": {
                "topics": ["DP state definition", "Transitions", "Memoization"],
                "patterns": ["Top-down Memoization", "Bottom-up DP", "State Transition", "Base Cases"],
                "difficulty_progression": "Easy memoization -> 1D DP -> 2D state design -> Medium DP mocks",
                "next_problems": ["Climbing Stairs", "House Robber", "Coin Change", "Longest Increasing Subsequence", "Word Break"],
                "roadmap": [
                    {"week": "Week 1", "focus": "State definition", "goal": "Write DP state and recurrence before coding each solution."},
                    {"week": "Week 2", "focus": "Memoization", "goal": "Convert brute force recursion into cached recursion."},
                    {"week": "Week 3", "focus": "Bottom-up DP", "goal": "Practice table order and base-case initialization."},
                    {"week": "Week 4", "focus": "DP mock interviews", "goal": "Run timed DP interviews and justify state-space complexity."},
                ],
            },
        }
        return plans.get(
            problem_family,
            {
                "topics": ["Pattern recognition"],
                "patterns": ["Hash Map Lookup", "Two Pointers", "Sliding Window", "Prefix Sum"],
                "difficulty_progression": "Easy timed drills -> Medium pattern recognition -> Medium mock interviews",
                "next_problems": [
                    "Contains Duplicate",
                    "Valid Anagram",
                    "Group Anagrams",
                    "Top K Frequent Elements",
                    "Longest Substring Without Repeating Characters",
                ],
                "roadmap": [
                    {"week": "Week 1", "focus": "Core patterns and clean explanation", "goal": "Solve 8 easy problems while narrating approach aloud."},
                    {"week": "Week 2", "focus": "Complexity and edge cases", "goal": "Add time/space analysis and edge-case checklist to every solution."},
                    {"week": "Week 3", "focus": "Medium pattern transfer", "goal": "Practice 6 medium problems across common interview patterns."},
                    {"week": "Week 4", "focus": "Mock interview pacing", "goal": "Run 3 timed mock interviews and review communication gaps."},
                ],
            },
        )


recommendation_engine = RecommendationEngine()
