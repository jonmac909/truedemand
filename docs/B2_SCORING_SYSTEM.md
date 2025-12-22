# B2 Explainable Scoring System

## Overview

The B2 Explainable Scoring System is a configurable, auditable scoring layer that computes the final **Opportunity Score** (0-100) from B1 validation outputs.

### Key Features

✅ **Explainable**: Every score includes a human-readable explanation with per-factor breakdown
✅ **Configurable**: Adjust weights to emphasize different validation dimensions
✅ **Auditable**: All scoring runs store the weights used, timestamp, and confidence level
✅ **Reproducible**: Re-score validations with different weights using the same validation data
✅ **Insufficient Data Handling**: Explicit warnings when data is missing or unreliable

---

## Architecture

### Input (from B1 Validation)

The scoring system consumes four canonical sub-scores computed by B1:

| Field | Description | Range |
|-------|-------------|-------|
| `search_score` | Search trend stability (Google Trends) | 0-100 |
| `social_score` | Pain intensity (Reddit analysis) | 0-100 |
| `competition_score` | Market saturation (inverse competition) | 0-100 |
| `financial_score` | Monetization likelihood | 0-100 |

Plus a context signal:
- `audience_clarity` (stored in `analysis_data.audience_clarity`) - Used as a modifier, not a top-level score

### Scoring Formula

```
Opportunity Score = (
  search_score × trend_weight +
  social_score × pain_weight +
  competition_score × competition_weight +
  financial_score × monetization_weight
)
```

Where weights sum to 1.0 (100%).

### Default Weights

```typescript
{
  pain: 0.30,          // 30% - Most important (validates real need)
  monetization: 0.25,  // 25% - Critical for viability
  trend: 0.25,         // 25% - Important for timing
  competition: 0.20    // 20% - Can be overcome with differentiation
}
```

**Rationale:**
- **Pain** is weighted highest because strong user need is the foundation of product-market fit
- **Monetization** and **Trend** are equally weighted as critical success factors
- **Competition** is weighted lowest because it can be overcome with strong differentiation

---

## Usage

### 1. Automatic Scoring (B1 → B2 Integration)

Every new validation is automatically scored after B1 completes:

```typescript
// In worker/handlers/validation.ts
const validation = await createValidation(...);
const scoringResult = await scoreValidationInitial(validation.id);
// ✓ Score stored in validations.overall_score
// ✓ Explanation stored in validations.overall_explanation
// ✓ Details stored in validations.analysis_data.explanation
```

### 2. Re-scoring with Custom Weights

Re-score an existing validation with different weights:

```typescript
import { rescoreValidation } from '@/lib/scoring';

const result = await rescoreValidation('validation-uuid', {
  weights: {
    pain: 0.40,        // Increase pain weight to 40%
    trend: 0.30,       // Increase trend weight to 30%
    monetization: 0.20,
    competition: 0.10
  },
  persist: true  // Update database with new score
});

console.log(result.overallScore);  // 0-100
console.log(result.summary);       // Human-readable explanation
console.log(result.confidence);    // 'high' | 'medium' | 'low'
```

### 3. API Endpoint

**POST `/api/validations/{id}/rescore`**

Re-score a validation via HTTP:

```bash
curl -X POST http://localhost:3000/api/validations/{id}/rescore \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "pain": 0.35,
      "monetization": 0.30,
      "trend": 0.20,
      "competition": 0.15
    },
    "persist": true
  }'
```

**GET `/api/validations/{id}/rescore`**

Get current scoring details (without persisting):

```bash
curl http://localhost:3000/api/validations/{id}/rescore
```

---

## Output Format

### ScoringResult

```typescript
{
  overallScore: 83,              // Final opportunity score (0-100)
  confidence: 'high',            // 'high' | 'medium' | 'low'
  summary: 'Strong opportunity with an overall score of 83/100...',

  breakdown: {
    trend: 85,
    pain: 90,
    competition: 75,
    monetization: 80,
    audienceClarity: 85
  },

  factorExplanations: [
    {
      factor: 'trend',
      score: 85,
      weight: 0.25,
      contribution: 21,           // Points contributed to final score
      explanation: 'Strong upward search trend...',
      dataQuality: 'strong',      // 'strong' | 'moderate' | 'weak' | 'insufficient'
      warnings: []                // Optional data quality warnings
    },
    // ... other factors
  ],

  weightsUsed: {
    trend: 0.25,
    pain: 0.30,
    competition: 0.20,
    monetization: 0.25
  },

  dataQuality: {
    strongFactors: 4,             // Number of factors with strong data (out of 4)
    insufficientFactors: 0,       // Number of factors with missing data
    gaps: []                      // List of data quality issues
  },

  scoredAt: '2023-12-21T10:30:00.000Z'
}
```

---

## Data Quality & Confidence

### Data Quality Thresholds

| Score Range | Quality Level | Interpretation |
|-------------|---------------|----------------|
| 70-100 | **Strong** | High-quality data, reliable signal |
| 40-69 | **Moderate** | Adequate data, moderate reliability |
| 1-39 | **Weak** | Low-quality data, limited reliability |
| 0 or null | **Insufficient** | No data available |

### Confidence Levels

| Confidence | Criteria |
|------------|----------|
| **High** | 3+ strong factors, 0 insufficient factors |
| **Medium** | 2+ strong factors, ≤1 insufficient factor |
| **Low** | All other cases |

### Insufficient Data Handling

When sub-scores are missing or null:
- ❌ **Never guess** or fabricate data
- ✅ Treat missing scores as 0 for calculation
- ✅ Lower confidence level explicitly
- ✅ Add warnings to factor explanations
- ✅ Include gaps in `dataQuality.gaps` array

**Example:**

```typescript
// Missing trend data
{
  factor: 'trend',
  score: null,
  weight: 0.25,
  contribution: 0,
  explanation: 'Search trend data unavailable. Cannot assess market momentum.',
  dataQuality: 'insufficient',
  warnings: ['No Google Trends data available']
}
```

---

## Audience Clarity Modifier

Audience clarity is **not** included in the overall score calculation. Instead, it's used as a **context signal** that provides additional information:

```typescript
if (audienceClarity >= 70) {
  "Strong audience clarity improves go-to-market confidence"
} else if (audienceClarity >= 40) {
  "Moderate audience clarity - further research recommended"
} else {
  "Weak audience clarity - target market needs refinement"
}
```

This appears in the summary explanation but does not affect the numeric score.

---

## Database Storage

### During Initial Scoring (B1 → B2)

```sql
UPDATE validations
SET
  overall_score = 83,
  overall_explanation = 'Strong opportunity with...',
  analysis_data = jsonb_set(analysis_data, '{weights_used}', '{"pain": 0.30, ...}')
WHERE id = 'validation-uuid';
```

### Stored in `analysis_data` JSONB

```json
{
  "audience_clarity": 85,
  "weights_used": {
    "trend": 0.25,
    "pain": 0.30,
    "competition": 0.20,
    "monetization": 0.25
  },
  "scored_at": "2023-12-21T10:30:00.000Z",
  "confidence": "high",
  "explanation": {
    "summary": "Strong opportunity...",
    "breakdown": { ... },
    "factorExplanations": [ ... ],
    "dataQuality": { ... }
  }
}
```

---

## Testing

Run the test suite to verify scoring logic:

```bash
npx tsx scripts/test-scoring.ts
```

This tests:
1. Strong signals (high opportunity)
2. Mixed signals (moderate opportunity)
3. Insufficient data handling
4. Custom weight configurations

---

## API Reference

### Functions

#### `computeExplainableScore(input, options)`

Compute a score from validation data.

**Parameters:**
- `input: ScoringInput` - Validation data with sub-scores
- `options?: ScoringOptions` - Optional custom weights

**Returns:** `ScoringResult`

---

#### `rescoreValidation(validationId, options)`

Re-score an existing validation from the database.

**Parameters:**
- `validationId: string` - UUID of validation to re-score
- `options?: ScoringOptions` - Optional custom weights and persist flag

**Returns:** `Promise<ScoringResult>`

**Throws:** Error if validation not found or weights invalid

---

#### `scoreValidationInitial(validationId)`

Score a validation for the first time (called from B1).

**Parameters:**
- `validationId: string` - UUID of newly created validation

**Returns:** `Promise<ScoringResult>`

---

## Weight Validation

Weights must satisfy:
1. All weights are numbers between 0 and 1
2. All weights sum to 1.0 (with 1% tolerance for floating point errors)

**Invalid Example:**
```typescript
{
  trend: 0.3,
  pain: 0.3,
  competition: 0.2,
  monetization: 0.1  // Sum = 0.9, not 1.0 ❌
}
```

**Valid Example:**
```typescript
{
  trend: 0.3,
  pain: 0.3,
  competition: 0.2,
  monetization: 0.2  // Sum = 1.0 ✅
}
```

---

## Future Enhancements (Post-B2)

The following are **NOT** implemented in B2 but could be added later:

- UI sliders for weight adjustment (B3)
- Visual charts and scoring dashboards
- Historical scoring comparison
- Score versioning and rollback
- Batch re-scoring operations
- Machine learning weight optimization

---

## Design Principles

1. **Transparency**: Every score is fully explainable with human-readable text
2. **Reproducibility**: Same inputs + same weights = same output
3. **Auditability**: All scoring metadata is stored (weights, timestamp, confidence)
4. **Honesty**: Never hide or downplay insufficient data
5. **Simplicity**: Weighted average is easy to understand and adjust

---

## Questions?

For implementation details, see:
- `lib/scoring/types.ts` - TypeScript definitions
- `lib/scoring/config.ts` - Default weights and thresholds
- `lib/scoring/explainable-score.ts` - Core scoring logic
- `worker/handlers/validation.ts` - B1 → B2 integration
