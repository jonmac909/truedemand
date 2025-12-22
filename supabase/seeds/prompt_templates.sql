-- Seed initial prompt templates for the Prompt Pack system

-- ============================================================
-- 1. Market Tree Expander
-- ============================================================
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  prompt_template,
  input_schema,
  output_schema,
  model,
  temperature,
  max_tokens
) VALUES (
  'market_tree_expander',
  'Market Tree Expander',
  'Expands a market category into 3-5 focused sub-niches with demand scores',
  'You are analyzing the market category: "{{market_name}}"

Your task is to identify 3-5 distinct sub-niches within this market. For each sub-niche:
1. Provide a clear, specific name
2. Write a concise description (1-2 sentences)
3. Estimate demand score (0-100) based on market size and growth potential
4. Explain the score briefly

Focus on sub-niches that are:
- Specific and well-defined (not too broad)
- Potentially underserved or growing
- Distinct from each other

Return your analysis as a JSON object with this structure:
{
  "sub_niches": [
    {
      "name": "Sub-niche name",
      "description": "Brief description of the sub-niche",
      "demand_score": 75,
      "score_explanation": "Why this score was assigned"
    }
  ]
}

Return ONLY valid JSON, no markdown or explanation.',
  '{
    "type": "object",
    "required": ["market_name"],
    "properties": {
      "market_name": {
        "type": "string",
        "description": "The market category to expand"
      }
    }
  }',
  '{
    "type": "object",
    "required": ["sub_niches"],
    "properties": {
      "sub_niches": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name", "description", "demand_score", "score_explanation"],
          "properties": {
            "name": {"type": "string"},
            "description": {"type": "string"},
            "demand_score": {"type": "number"},
            "score_explanation": {"type": "string"}
          }
        }
      }
    }
  }',
  'claude-3-5-sonnet-20241022',
  0.3,
  1500
);

-- ============================================================
-- 2. Pain Point Extractor
-- ============================================================
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  prompt_template,
  input_schema,
  output_schema,
  model,
  temperature,
  max_tokens
) VALUES (
  'pain_point_extractor',
  'Pain Point Extractor',
  'Extracts and analyzes pain points from user discussions',
  'You are analyzing discussions about "{{niche}}" to identify pain points and unmet needs.

Here is a sample of posts and comments:

{{content_sample}}

Analyze this content and extract the top pain points. For each pain point:
1. Describe the specific problem or frustration
2. Count approximate frequency (how many times mentioned)
3. Rate intensity (low, medium, high, critical)
4. Provide evidence IDs (post/comment references)
5. Extract relevant keywords

Return your analysis as a JSON object with this structure:
{
  "pain_points": [
    {
      "description": "Clear description of the pain point",
      "frequency": 5,
      "intensity": "high",
      "evidence": ["POST[id1]", "COMMENT[id2]"],
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "overall_pain_intensity": "high",
  "pain_score": 75,
  "explanation": "Summary of findings"
}

Return ONLY valid JSON, no markdown or explanation.',
  '{
    "type": "object",
    "required": ["niche", "content_sample"],
    "properties": {
      "niche": {
        "type": "string",
        "description": "The niche or market being analyzed"
      },
      "content_sample": {
        "type": "string",
        "description": "Sample of posts and comments to analyze"
      }
    }
  }',
  '{
    "type": "object",
    "required": ["pain_points", "overall_pain_intensity", "pain_score", "explanation"],
    "properties": {
      "pain_points": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["description", "frequency", "intensity", "evidence", "keywords"],
          "properties": {
            "description": {"type": "string"},
            "frequency": {"type": "number"},
            "intensity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
            "evidence": {"type": "array", "items": {"type": "string"}},
            "keywords": {"type": "array", "items": {"type": "string"}}
          }
        }
      },
      "overall_pain_intensity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
      "pain_score": {"type": "number"},
      "explanation": {"type": "string"}
    }
  }',
  'claude-3-5-sonnet-20241022',
  0.2,
  2000
);

-- ============================================================
-- 3. Idea Generator
-- ============================================================
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  prompt_template,
  input_schema,
  output_schema,
  model,
  temperature,
  max_tokens
) VALUES (
  'idea_generator',
  'Idea Generator',
  'Generates product ideas from validated market gaps',
  'You are generating product ideas for the following validated market opportunity:

**Market/Niche:** {{niche_name}}

**Validation Data:**
- Trend Score: {{trend_score}}/100
- Pain Score: {{pain_score}}/100
- Competition Score: {{competition_score}}/100
- Monetization Score: {{monetization_score}}/100

**Key Pain Points:**
{{pain_points}}

**Target Audience:**
{{target_audience}}

Generate 3-5 product ideas that address these pain points. For each idea:
1. Provide a compelling product title
2. Define the target persona (who it''s for)
3. Write a clear value proposition (what problem it solves)
4. List 3-5 key differentiators (what makes it unique)
5. Suggest a monetization model

Return your ideas as a JSON object with this structure:
{
  "ideas": [
    {
      "title": "Product title",
      "target_persona": "Who this is for",
      "value_proposition": "What problem it solves and how",
      "differentiators": ["Unique aspect 1", "Unique aspect 2", "Unique aspect 3"],
      "monetization_model": "How to make money from this"
    }
  ]
}

Return ONLY valid JSON, no markdown or explanation.',
  '{
    "type": "object",
    "required": ["niche_name", "trend_score", "pain_score", "competition_score", "monetization_score", "pain_points", "target_audience"],
    "properties": {
      "niche_name": {"type": "string"},
      "trend_score": {"type": "number"},
      "pain_score": {"type": "number"},
      "competition_score": {"type": "number"},
      "monetization_score": {"type": "number"},
      "pain_points": {"type": "string"},
      "target_audience": {"type": "string"}
    }
  }',
  '{
    "type": "object",
    "required": ["ideas"],
    "properties": {
      "ideas": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["title", "target_persona", "value_proposition", "differentiators", "monetization_model"],
          "properties": {
            "title": {"type": "string"},
            "target_persona": {"type": "string"},
            "value_proposition": {"type": "string"},
            "differentiators": {"type": "array", "items": {"type": "string"}},
            "monetization_model": {"type": "string"}
          }
        }
      }
    }
  }',
  'claude-3-5-sonnet-20241022',
  0.5,
  2500
);

-- ============================================================
-- 4. Blueprint Generator
-- ============================================================
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  prompt_template,
  input_schema,
  output_schema,
  model,
  temperature,
  max_tokens
) VALUES (
  'blueprint_generator',
  'Blueprint Generator',
  'Creates detailed implementation blueprints for product ideas',
  'You are creating a detailed implementation blueprint for the following product idea:

**Product:** {{product_title}}

**Target Persona:** {{target_persona}}

**Value Proposition:** {{value_proposition}}

**Differentiators:** {{differentiators}}

**Market Context:**
- Niche: {{niche_name}}
- Validation Score: {{validation_score}}/100

Create a comprehensive blueprint with the following sections:

1. **Executive Summary** (2-3 paragraphs)
2. **Target Market Analysis** (who, where, how to reach them)
3. **Feature Roadmap** (MVP features → Phase 2 → Phase 3)
4. **Positioning Strategy** (how to position vs. competitors)
5. **Go-to-Market Recommendations** (launch strategy, channels)
6. **Risk Assessment** (top 3-5 risks and mitigations)

Return your blueprint as a JSON object with this structure:
{
  "executive_summary": "2-3 paragraph overview",
  "target_market_analysis": "Detailed analysis",
  "feature_roadmap": {
    "mvp": ["Feature 1", "Feature 2"],
    "phase_2": ["Feature 1", "Feature 2"],
    "phase_3": ["Feature 1", "Feature 2"]
  },
  "positioning_strategy": "How to position the product",
  "gtm_recommendations": "Go-to-market strategy",
  "risk_assessment": [
    {
      "risk": "Description of risk",
      "mitigation": "How to mitigate it"
    }
  ]
}

Return ONLY valid JSON, no markdown or explanation.',
  '{
    "type": "object",
    "required": ["product_title", "target_persona", "value_proposition", "differentiators", "niche_name", "validation_score"],
    "properties": {
      "product_title": {"type": "string"},
      "target_persona": {"type": "string"},
      "value_proposition": {"type": "string"},
      "differentiators": {"type": "string"},
      "niche_name": {"type": "string"},
      "validation_score": {"type": "number"}
    }
  }',
  '{
    "type": "object",
    "required": ["executive_summary", "target_market_analysis", "feature_roadmap", "positioning_strategy", "gtm_recommendations", "risk_assessment"],
    "properties": {
      "executive_summary": {"type": "string"},
      "target_market_analysis": {"type": "string"},
      "feature_roadmap": {
        "type": "object",
        "properties": {
          "mvp": {"type": "array", "items": {"type": "string"}},
          "phase_2": {"type": "array", "items": {"type": "string"}},
          "phase_3": {"type": "array", "items": {"type": "string"}}
        }
      },
      "positioning_strategy": {"type": "string"},
      "gtm_recommendations": {"type": "string"},
      "risk_assessment": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "risk": {"type": "string"},
            "mitigation": {"type": "string"}
          }
        }
      }
    }
  }',
  'claude-3-5-sonnet-20241022',
  0.4,
  3500
);

-- ============================================================
-- 5. Marketing Plan Generator
-- ============================================================
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  prompt_template,
  input_schema,
  output_schema,
  model,
  temperature,
  max_tokens
) VALUES (
  'marketing_plan_generator',
  'Marketing Plan Generator',
  'Generates marketing plans for validated product ideas',
  'You are creating a marketing plan for the following product:

**Product:** {{product_title}}

**Target Persona:** {{target_persona}}

**Value Proposition:** {{value_proposition}}

**Market Context:**
- Niche: {{niche_name}}
- Competition Level: {{competition_level}}

Create a comprehensive marketing plan with the following:

1. **Marketing Channels** (top 3-5 recommended channels with rationale)
2. **Content Strategy** (types of content, frequency, topics)
3. **Launch Timeline** (30-60-90 day plan)
4. **Budget Allocation** (% breakdown across channels)
5. **Key Metrics** (what to track and why)
6. **Messaging Framework** (key messages for different audiences)

Return your plan as a JSON object with this structure:
{
  "marketing_channels": [
    {
      "channel": "Channel name",
      "rationale": "Why this channel",
      "tactics": ["Tactic 1", "Tactic 2"]
    }
  ],
  "content_strategy": {
    "content_types": ["Type 1", "Type 2"],
    "frequency": "How often to post",
    "key_topics": ["Topic 1", "Topic 2"]
  },
  "launch_timeline": {
    "days_0_30": ["Action 1", "Action 2"],
    "days_31_60": ["Action 1", "Action 2"],
    "days_61_90": ["Action 1", "Action 2"]
  },
  "budget_allocation": {
    "paid_ads": 40,
    "content_creation": 30,
    "tools_software": 20,
    "other": 10
  },
  "key_metrics": [
    {
      "metric": "Metric name",
      "why": "Why track this",
      "target": "Target value"
    }
  ],
  "messaging_framework": {
    "primary_message": "Main value prop",
    "secondary_messages": ["Message 1", "Message 2"],
    "proof_points": ["Proof 1", "Proof 2"]
  }
}

Return ONLY valid JSON, no markdown or explanation.',
  '{
    "type": "object",
    "required": ["product_title", "target_persona", "value_proposition", "niche_name", "competition_level"],
    "properties": {
      "product_title": {"type": "string"},
      "target_persona": {"type": "string"},
      "value_proposition": {"type": "string"},
      "niche_name": {"type": "string"},
      "competition_level": {"type": "string"}
    }
  }',
  '{
    "type": "object",
    "required": ["marketing_channels", "content_strategy", "launch_timeline", "budget_allocation", "key_metrics", "messaging_framework"],
    "properties": {
      "marketing_channels": {"type": "array"},
      "content_strategy": {"type": "object"},
      "launch_timeline": {"type": "object"},
      "budget_allocation": {"type": "object"},
      "key_metrics": {"type": "array"},
      "messaging_framework": {"type": "object"}
    }
  }',
  'claude-3-5-sonnet-20241022',
  0.4,
  3000
);
