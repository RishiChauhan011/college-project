import unittest
from unittest.mock import patch, MagicMock
from google.genai.errors import ClientError
from llm.gemini_client import generate_roadmap_narrative

class TestGeminiEmptyResponseHandling(unittest.TestCase):
    
    def setUp(self):
        self.sample_data = {
            "target_domain": "AI & Data Science",
            "match_percent": 78.0,
            "resume_skills_recognized": ["Python", "SQL", "Excel"],
            "missing_skills": [
                {"skill": "Data Analysis", "category": "Domain", "demand_count": 177, "estimated_learning_weeks": 4, "roi_score": 44.25},
                {"skill": "Machine Learning", "category": "Domain", "demand_count": 252, "estimated_learning_weeks": 8, "roi_score": 31.5}
            ],
            "recommended_learning_priority": ["Data Analysis", "Machine Learning"],
            "estimated_learning_weeks": 12,
            "companies_you_would_qualify_for": ["Google", "Microsoft", "Amazon"]
        }

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_1_normal_response(self, mock_call, mock_client):
        """Scenario 1: Normal response -> narrative is non-empty, equals stripped text."""
        mock_response = MagicMock()
        mock_response.text = "  Paragraph 1\n\nParagraph 2\n\nParagraph 3  "
        mock_call.return_value = mock_response

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNotNone(result["narrative"])
        self.assertEqual(result["narrative"], "Paragraph 1\n\nParagraph 2\n\nParagraph 3")

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_2_empty_response(self, mock_call, mock_client):
        """Scenario 2: Empty response ("") -> narrative is None (not "")."""
        mock_response = MagicMock()
        mock_response.text = ""
        mock_call.return_value = mock_response

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNone(result["narrative"])
        self.assertIn("All models unavailable", result["warnings"][0])

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_3_whitespace_only_response(self, mock_call, mock_client):
        """Scenario 3: Whitespace-only ("   \n\t   ") -> narrative is None."""
        mock_response = MagicMock()
        mock_response.text = "   \n\t   "
        mock_call.return_value = mock_response

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNone(result["narrative"])
        self.assertIn("All models unavailable", result["warnings"][0])

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_4_missing_text_response(self, mock_call, mock_client):
        """Scenario 4: Missing text (response.text = None) -> narrative is None."""
        mock_response = MagicMock()
        mock_response.text = None
        mock_call.return_value = mock_response

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNone(result["narrative"])
        self.assertIn("All models unavailable", result["warnings"][0])

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_5_gemini_api_failure(self, mock_call, mock_client):
        """Scenario 5: Gemini API failure (ClientError) -> narrative is None."""
        err_resp = MagicMock()
        err_resp.status_code = 429
        mock_call.side_effect = ClientError(429, {"error": {"message": "Quota exceeded"}}, err_resp)

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNone(result["narrative"])
        self.assertTrue(len(result["warnings"]) > 0)

    @patch("llm.gemini_client.GEMINI_API_KEY", "fake_key")
    @patch("llm.gemini_client.genai.Client")
    @patch("llm.gemini_client._call_gemini_with_model")
    def test_6_fallback_chain_continues_on_empty_response(self, mock_call, mock_client):
        """Scenario 6: 1st model returns empty text, 2nd model returns usable text -> returns 2nd model's narrative."""
        empty_resp = MagicMock()
        empty_resp.text = ""
        
        valid_resp = MagicMock()
        valid_resp.text = "Paragraph 1\n\nParagraph 2\n\nParagraph 3"
        
        mock_call.side_effect = [empty_resp, valid_resp]

        result = generate_roadmap_narrative(self.sample_data)
        
        self.assertIsNotNone(result["narrative"])
        self.assertEqual(result["narrative"], "Paragraph 1\n\nParagraph 2\n\nParagraph 3")
        self.assertTrue(any("used fallback" in w for w in result["warnings"]))
        self.assertEqual(mock_call.call_count, 2)

if __name__ == "__main__":
    unittest.main()
