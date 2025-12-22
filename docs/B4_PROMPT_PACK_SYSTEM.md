# B4 Prompt Pack System

## Overview

The B4 Prompt Pack System is a reusable, auditable framework for managing LLM prompts. It provides:

✅ **Reusable Templates** - Store prompts with variable placeholders
✅ **Structured Outputs** - Enforce JSON schemas for consistent results
✅ **Full Logging** - Track all inputs/outputs for reproducibility
✅ **User Editable** - Templates can be customized without code changes
✅ **Version Control** - Track template changes over time

---

## Architecture

### Database Tables

**`prompt_templates`**
```
- id (UUID)
- name (TEXT, unique) - e.g., "pain_point_extractor"
- display_name (TEXT) - Human-readable name
- description (TEXT) - What the template does
- prompt_template (TEXT) - Template with {{variable}} placeholders
- input_schema (JSONB) - Defines required input variables
- output_schema (JSONB) - Defines expected JSON output structure
- model (TEXT) - Default: "claude-3-5-sonnet-20241022"
- temperature (NUMERIC) - Default: 0.2
- max_tokens (INTEGER) - Default: 2000
- version (INTEGER) - Template version number
- is_active (BOOLEAN) - Enable/disable templates
- created_at, updated_at (TIMESTAMPTZ)
```

**`prompt_runs`**
```
- id (UUID)
- prompt_template_id (UUID) - References prompt_templates
- project_id (UUID, nullable) - Optional link to project
- input_variables (JSONB) - Actual values provided
- full_prompt (TEXT) - The rendered prompt sent to LLM
- output (JSONB) - Parsed JSON output
- raw_output (TEXT) - Raw LLM response
- model, temperature, max_tokens - Config used
- tokens_used (INTEGER) - Actual tokens consumed
- duration_ms (INTEGER) - Execution time
- status (TEXT) - 'success' | 'failed'
- error_message (TEXT, nullable)
- created_at (TIMESTAMPTZ)
```

---

## Template System

### Variable Interpolation

Templates use `{{variable}}` syntax:

```
You are analyzing "{{niche}}" to identify pain points.

Content:
{{content_sample}}

Return your analysis as JSON...
```

### Rendering

```typescript
import { renderTemplate } from '@/lib/prompts/template-engine';

const template = "Analyze {{niche}} for pain points.";
const variables = { niche: "AI meal planning" };

const rendered = renderTemplate(template, variables);
// "Analyze AI meal planning for pain points."
```

---

## Execution System

### Basic Usage

```typescript
import { executePrompt, PromptTemplateName } from '@/lib/prompts';

const result = await executePrompt({
  template_name: PromptTemplateName.PAIN_POINT_EXTRACTOR,
  variables: {
    niche: 'AI-powered meal planning',
    content_sample: 'POST[1]: I spend 2 hours planning meals...',
  },
  project_id: 'project-uuid', // Optional
});

console.log(result.output); // Parsed JSON
console.log(result.run_id); // For reproducibility
console.log(result.tokens_used); // Token consumption
```

### With Overrides

```typescript
const result = await executePrompt({
  template_name: 'pain_point_extractor',
  variables: { ... },
  override_model: 'claude-opus-4-5-20251101',
  override_temperature: 0.5,
  override_max_tokens: 3000,
});
```

---

## Initial Prompt Templates

### 1. Market Tree Expander (`market_tree_expander`)

Expands a market category into 3-5 focused sub-niches.

**Input:**
```typescript
{ market_name: string }
```

**Output:**
```typescript
{
  sub_niches: Array<{
    name: string;
    description: string;
    demand_score: number; // 0-100
    score_explanation: string;
  }>;
}
```

---

### 2. Pain Point Extractor (`pain_point_extractor`)

Extracts pain points from user discussions.

**Input:**
```typescript
{
  niche: string;
  content_sample: string; // Reddit/TikTok content
}
```

**Output:**
```typescript
{
  pain_points: Array<{
    description: string;
    frequency: number;
    intensity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string[];
    keywords: string[];
  }>;
  overall_pain_intensity: string;
  pain_score: number;
  explanation: string;
}
```

---

### 3. Idea Generator (`idea_generator`)

Generates 3-5 product ideas from validated gaps.

**Input:**
```typescript
{
  niche_name: string;
  trend_score: number;
  pain_score: number;
  competition_score: number;
  monetization_score: number;
  pain_points: string;
  target_audience: string;
}
```

**Output:**
```typescript
{
  ideas: Array<{
    title: string;
    target_persona: string;
    value_proposition: string;
    differentiators: string[];
    monetization_model: string;
  }>;
}
```

---

### 4. Blueprint Generator (`blueprint_generator`)

Creates detailed implementation blueprints.

**Input:**
```typescript
{
  product_title: string;
  target_persona: string;
  value_proposition: string;
  differentiators: string;
  niche_name: string;
  validation_score: number;
}
```

**Output:**
```typescript
{
  executive_summary: string;
  target_market_analysis: string;
  feature_roadmap: {
    mvp: string[];
    phase_2: string[];
    phase_3: string[];
  };
  positioning_strategy: string;
  gtm_recommendations: string;
  risk_assessment: Array<{
    risk: string;
    mitigation: string;
  }>;
}
```

---

### 5. Marketing Plan Generator (`marketing_plan_generator`)

Generates comprehensive marketing plans.

**Input:**
```typescript
{
  product_title: string;
  target_persona: string;
  value_proposition: string;
  niche_name: string;
  competition_level: string;
}
```

**Output:**
```typescript
{
  marketing_channels: Array<{ channel, rationale, tactics }>;
  content_strategy: { content_types, frequency, key_topics };
  launch_timeline: { days_0_30, days_31_60, days_61_90 };
  budget_allocation: { paid_ads, content_creation, ... };
  key_metrics: Array<{ metric, why, target }>;
  messaging_framework: { primary_message, ... };
}
```

---

## Reproducibility

Every execution is logged with full inputs/outputs:

```typescript
// Get a previous run
const { data: run } = await supabase
  .from('prompt_runs')
  .select('*')
  .eq('id', 'run-uuid')
  .single();

// Re-run with same inputs
const result = await executePrompt({
  template_name: '...', // Look up from template_id
  variables: run.input_variables,
  override_model: run.model,
  override_temperature: run.temperature,
});

// Compare outputs
console.log('Original:', run.output);
console.log('Reproduced:', result.output);
```

---

## Database Setup

### 1. Run Migration

```bash
# Apply migration
supabase db push

# Or run manually in Supabase SQL editor:
# supabase/migrations/20231222000001_prompt_pack_system.sql
```

### 2. Seed Templates

```bash
# Run in Supabase SQL editor:
# supabase/seeds/prompt_templates.sql
```

This creates the 5 initial templates.

---

## Best Practices

### Template Design

✅ **Clear Instructions** - Be specific
✅ **Output Format** - Specify JSON structure
✅ **Examples** - Show expected output
✅ **Constraints** - Define limits

### Variable Naming

Use descriptive snake_case:
- ✅ `niche_name`, `content_sample`
- ❌ `n`, `content`

### Temperature Settings

- **0.0-0.2**: Deterministic (data extraction)
- **0.3-0.5**: Balanced (idea generation)
- **0.6-1.0**: Creative (brainstorming)

---

## Files Created

```
supabase/migrations/
  └── 20231222000001_prompt_pack_system.sql

supabase/seeds/
  └── prompt_templates.sql

lib/prompts/
  ├── types.ts
  ├── template-engine.ts
  ├── execute.ts
  └── index.ts

docs/
  └── B4_PROMPT_PACK_SYSTEM.md
```

---

## Future Enhancements (Post-B4)

- API endpoints for CRUD operations
- Settings UI for editing templates
- Template versioning with rollback
- A/B testing of prompts
- Cost tracking
- Batch execution
- Prompt chaining

---

## Questions?

For implementation details, see:
- `lib/prompts/` - Core implementation
- `supabase/migrations/` - Database schema
- `supabase/seeds/` - Initial templates
