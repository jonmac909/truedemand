# C2 Export System

## Overview

The C2 Export System provides Markdown export functionality for blueprints and marketing plans. It enables users to download validated, cited documentation with full metadata and version tracking.

✅ **Blueprint → Markdown** - Full implementation plan with citations
✅ **Marketing Plan → Markdown** - Derived GTM-focused export (no separate storage)
✅ **Source Citations** - All validation sources included
✅ **Metadata Tracking** - Timestamps, versions, export type
✅ **No Database Changes** - Works with existing schema

---

## Architecture Principles

### 1. Blueprints are Canonical

**Blueprints** are the only stored artifacts. They contain:
- Executive Summary
- Target Market Analysis
- Feature Roadmap
- Positioning Strategy
- GTM Recommendations
- Risk Assessment

### 2. Marketing Plans are Derived

**Marketing plans are NOT stored separately**. They are generated on-demand by:
1. Fetching blueprint data
2. Extracting GTM-related fields (`gtm_recommendations`, `positioning_strategy`, `target_market_analysis`)
3. Reformatting as standalone marketing document
4. Including export metadata

**No `marketing_plans` table exists** - this keeps the schema clean and avoids data duplication.

### 3. All Exports Include Metadata

Every export contains:
```typescript
{
  generated_at: string;        // ISO timestamp
  app_version: string;          // TrueDemand version
  export_version: string;       // Export format version
  export_type: 'blueprint' | 'marketing_plan';
}
```

This enables:
- Reproducibility (know exactly when export was created)
- Backward compatibility (track format changes)
- Audit trails (version tracking for compliance)

---

## Implementation

### File Structure

```
lib/exports/
  ├── types.ts                          # Export types and interfaces
  ├── blueprint-to-markdown.ts          # Blueprint → Markdown converter
  ├── marketing-plan-to-markdown.ts     # Marketing Plan → Markdown converter
  └── index.ts                          # Barrel exports + version constants

app/api/blueprints/[id]/
  ├── export/route.ts                   # GET blueprint Markdown
  └── export-marketing/route.ts         # GET marketing plan Markdown

components/blueprint/
  ├── export-buttons.tsx                # Client-side export UI
  └── index.ts                          # Barrel export

docs/
  └── C2_EXPORT_SYSTEM.md               # This file
```

---

## Usage

### API Endpoints

#### Export Full Blueprint

```http
GET /api/blueprints/{id}/export
```

**Response**:
- Status: `200 OK`
- Content-Type: `text/markdown; charset=utf-8`
- Content-Disposition: `attachment; filename="{sanitized-title}-blueprint.md"`

**Example**:
```bash
curl http://localhost:3000/api/blueprints/abc-123/export \
  --output my-blueprint.md
```

#### Export Marketing Plan (Derived)

```http
GET /api/blueprints/{id}/export-marketing
```

**Response**:
- Status: `200 OK`
- Content-Type: `text/markdown; charset=utf-8`
- Content-Disposition: `attachment; filename="{sanitized-title}-marketing-plan.md"`

**Example**:
```bash
curl http://localhost:3000/api/blueprints/abc-123/export-marketing \
  --output my-marketing-plan.md
```

---

### React Component

Use the `ExportButtons` component in blueprint views:

```tsx
import { ExportButtons } from '@/components/blueprint';

export default function BlueprintView({ blueprintId }: { blueprintId: string }) {
  return (
    <div>
      <h1>My Blueprint</h1>

      {/* Export buttons */}
      <ExportButtons blueprintId={blueprintId} />

      {/* Blueprint content */}
    </div>
  );
}
```

**Features**:
- Download full blueprint as Markdown
- Download marketing plan (derived) as Markdown
- Loading states during export
- Error handling with user feedback
- Sanitized filenames based on product title

---

## Export Formats

### Blueprint Markdown Structure

```markdown
# {Product Title} — Implementation Blueprint

**Generated**: December 22, 2025 at 2:30 PM
**Market**: {Market Name}
**Validation Score**: {Score}/100

> {Value Proposition}

---

## Executive Summary

[Full executive summary...]

---

## Market Validation Summary

**Overall Score**: 78/100

[Validation explanation...]

### Score Breakdown

| Signal | Score | Description |
|--------|-------|-------------|
| Search Trends | 75/100 | Market search volume and growth trajectory |
| Social Proof | 82/100 | Community discussions and engagement |
| Competition | 70/100 | Market saturation and differentiation opportunities |
| Financial | 85/100 | Monetization potential and willingness to pay |

---

## Target Market Analysis

[Full target market analysis...]

---

## Feature Roadmap

### MVP (Minimum Viable Product)
**Timeline**: 4-6 weeks

- Core workflow automation
- Simple dashboard
- Essential integrations

### Phase 2: Growth Features
**Timeline**: 2-3 months post-launch

- Advanced analytics
- Additional integrations
- Mobile app

### Phase 3: Scale & Enterprise
**Timeline**: 4-6 months post-launch

- AI-powered recommendations
- White-label capabilities
- Enterprise features

---

## Positioning Strategy

[Full positioning strategy...]

---

## Go-to-Market Recommendations

[Full GTM recommendations...]

---

## Risk Assessment & Mitigation

[Full risk assessment...]

---

## Data Sources & Citations

This blueprint is built on the following validation sources:

### Search Trends

**Google Trends: "AI meal planning" (12-month analysis + 5-year)**
12-month trend: rising (15% growth). Average interest: 65.

### Social Proof

**Reddit search: "AI meal planning" (50 posts, 120 comments)**
Analyzed discussions across 8 subreddits. Top subreddits: r/mealprep, r/eatCheapAndHealthy.

### Other Sources

**LLM Pain Analysis (Claude): 5 pain points identified**
Identified pain points with high overall intensity through analysis of Reddit discussions.

*All data sources were collected and analyzed as of December 22, 2025.*

---

## About This Document

**Export Details:**
- Generated: December 22, 2025 at 2:30 PM
- Export Version: 1.0.0
- App Version: 1.0.0

**Disclaimer:**
This blueprint is based on automated market analysis and should be validated with additional research and customer interviews before making significant investment decisions.

---

*Generated by [TrueDemand](https://truedemand.app) — Market Validation for Product Builders*
```

---

### Marketing Plan Markdown Structure

```markdown
# Marketing Plan: {Product Title}

**Generated**: December 22, 2025 at 2:30 PM
**Market**: {Market Name}
**Validation Score**: 78/100

> {Value Proposition}

---

## Product Overview

**Product Name**: TableTurn — Smart Inventory for Restaurants

**Value Proposition**: Reduce food waste by 30% with predictive ordering

**Target Customer**: Independent restaurant owners (1-3 locations)

**Market Opportunity**: This marketing plan is based on validated market demand with a 78/100 validation score...

---

## Market Context

**Target Market**: Restaurant Inventory Management

**Validation Score**: 78/100

**Assessment**: Strong validation signals indicate a high-demand market with clear opportunities for differentiation.

---

## Positioning Strategy

[Full positioning strategy from blueprint...]

---

## Go-to-Market Recommendations

[Full GTM recommendations from blueprint...]

---

## Target Audience Summary

**Primary Persona**: Independent restaurant owners (1-3 locations)

For detailed target market segmentation, demographics, psychographics, and buying behavior analysis, refer to the full implementation blueprint.

---

## About This Document

**Export Details:**
- Generated: December 22, 2025 at 2:30 PM
- Export Type: Marketing Plan (derived from Implementation Blueprint)
- Export Version: 1.0.0
- App Version: 1.0.0

**Note:** This marketing plan is derived from the comprehensive implementation blueprint. For complete feature roadmap, technical requirements, and detailed risk assessment, refer to the full blueprint export.

---

*Generated by [TrueDemand](https://truedemand.app) — Market Validation for Product Builders*
```

---

## Data Flow

### Blueprint Export Flow

1. **Client Initiates** - User clicks "Export Blueprint" button
2. **API Request** - `GET /api/blueprints/{id}/export`
3. **Fetch Blueprint** - Query Supabase for blueprint + related data:
   - Blueprint fields
   - Idea details
   - Validation scores
   - Market node info
4. **Fetch Sources** - Query `validation_sources` for citations
5. **Assemble Data** - Create `BlueprintExportData` object
6. **Generate Metadata** - Create `ExportMetadata` with timestamp + versions
7. **Convert to Markdown** - Use `blueprintToMarkdown()` utility
8. **Return File** - Send as downloadable Markdown file

### Marketing Plan Export Flow (Derived)

1. **Client Initiates** - User clicks "Export Marketing Plan" button
2. **API Request** - `GET /api/blueprints/{id}/export-marketing`
3. **Fetch Blueprint** - Query Supabase for GTM-related fields:
   - `gtm_recommendations`
   - `positioning_strategy`
   - `target_market_analysis`
   - Idea + validation context
4. **Assemble Derived Data** - Create `MarketingPlanExportData` object
5. **Generate Metadata** - Create `ExportMetadata` with `export_type: 'marketing_plan'`
6. **Convert to Markdown** - Use `marketingPlanToMarkdown()` utility
7. **Return File** - Send as downloadable Markdown file

**Key Point**: No marketing plan is stored in the database. It's assembled on-demand from existing blueprint data.

---

## Version Management

### Export Version (`EXPORT_VERSION`)

Current: `1.0.0`

**Purpose**: Track Markdown format changes for backward compatibility.

**When to Increment**:
- **Patch** (1.0.x): Fix typos, minor formatting tweaks
- **Minor** (1.x.0): Add new sections, change structure
- **Major** (x.0.0): Breaking changes to format

### App Version (`APP_VERSION`)

Current: `1.0.0` (read from `package.json` or hardcoded)

**Purpose**: Track which version of TrueDemand generated the export.

**Use Cases**:
- Debugging export issues
- Understanding feature availability at time of export
- Support and troubleshooting

---

## Error Handling

### Blueprint Not Found

```json
{
  "error": "Blueprint not found"
}
```

Status: `404 Not Found`

**Cause**: Invalid blueprint ID or blueprint deleted.

### Export Failure

```json
{
  "error": "Failed to export blueprint"
}
```

Status: `500 Internal Server Error`

**Causes**:
- Database query failure
- Supabase connection issue
- Markdown conversion error

**Client Behavior**:
- Display error message to user
- Offer retry option
- Log error to console for debugging

---

## Testing

### Manual Testing

1. **Create Blueprint** - Use blueprint creation flow to generate a blueprint
2. **Export Blueprint** - Click "Export Blueprint" button
3. **Verify Download** - Confirm Markdown file downloads with correct filename
4. **Check Content** - Open file and verify:
   - All sections present
   - Citations included
   - Metadata footer correct
   - Timestamps accurate
5. **Export Marketing Plan** - Click "Export Marketing Plan" button
6. **Verify Derived Export** - Confirm marketing plan contains:
   - GTM recommendations
   - Positioning strategy
   - Target market summary
   - Metadata indicating it's derived

### API Testing

```bash
# Test blueprint export
curl http://localhost:3000/api/blueprints/YOUR_BLUEPRINT_ID/export \
  -v -o test-blueprint.md

# Test marketing plan export
curl http://localhost:3000/api/blueprints/YOUR_BLUEPRINT_ID/export-marketing \
  -v -o test-marketing.md

# Test 404 handling
curl http://localhost:3000/api/blueprints/invalid-id/export -v
```

---

## Future Enhancements (Post-C2)

- **PDF Export** - Convert Markdown to styled PDF
- **Export History** - Track export events in database
- **Custom Templates** - User-configurable export formats
- **Multi-Format Support** - JSON, DOCX, HTML exports
- **Batch Export** - Export multiple blueprints at once
- **Email Delivery** - Send exports via email
- **Collaborative Annotations** - Comments and notes in exports
- **Export Analytics** - Track most popular sections/formats

---

## Best Practices

### Filename Sanitization

Always sanitize product titles for filenames:

```typescript
const sanitizedTitle = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dash
  .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
```

✅ `"AI Meal Planner!"` → `"ai-meal-planner"`
✅ `"SaaS & Co."` → `"saas-co"`

### Citation Quality

Ensure validation sources are:
- **Specific**: Include exact query, date, result count
- **Reproducible**: Provide enough detail to recreate search
- **Timestamped**: Mark when data was fetched
- **Attributed**: Identify platform (Reddit, Google Trends, etc.)

### Markdown Formatting

Use consistent formatting:
- **Headers**: `##` for sections, `###` for subsections
- **Tables**: Use for structured data (score breakdowns)
- **Lists**: Use `-` for unordered, `1.` for ordered
- **Emphasis**: `**bold**` for important terms, `*italic*` sparingly
- **Spacing**: Separate sections with `---`

---

## Troubleshooting

### Export Button Doesn't Work

**Symptoms**: Button click has no effect

**Causes**:
1. Invalid blueprint ID
2. Network error
3. JavaScript error in browser

**Solutions**:
- Check browser console for errors
- Verify blueprint ID is correct
- Test API endpoint directly with cURL
- Check network tab for failed requests

### Downloaded File is Empty

**Symptoms**: Markdown file downloads but has no content

**Causes**:
1. Blueprint has no data
2. Markdown converter returned empty string
3. Database query failed silently

**Solutions**:
- Check blueprint exists in database
- Verify all required fields are populated
- Review server logs for errors
- Test API endpoint with cURL to see raw response

### Wrong Filename

**Symptoms**: File downloads as `download.md` instead of product-specific name

**Causes**:
1. Content-Disposition header not set
2. Browser doesn't support header
3. Filename sanitization stripped all characters

**Solutions**:
- Verify `Content-Disposition` header in API response
- Check browser compatibility
- Review filename sanitization logic
- Provide fallback filename

---

## Files Created

```
lib/exports/
  ├── types.ts                          [NEW] - Export types
  ├── blueprint-to-markdown.ts          [NEW] - Blueprint converter
  ├── marketing-plan-to-markdown.ts     [NEW] - Marketing plan converter
  └── index.ts                          [NEW] - Barrel exports

app/api/blueprints/[id]/
  ├── export/route.ts                   [NEW] - Blueprint API
  └── export-marketing/route.ts         [NEW] - Marketing plan API

components/blueprint/
  ├── export-buttons.tsx                [NEW] - Export UI
  └── index.ts                          [NEW] - Barrel export

docs/
  └── C2_EXPORT_SYSTEM.md               [NEW] - This doc
```

**No database changes required** - C2 works with existing schema.

---

## Summary

C2 Export System provides:

1. **Full Blueprint Exports** with citations, metadata, and version tracking
2. **Derived Marketing Plan Exports** without separate database storage
3. **Markdown Format** for portability and version control compatibility
4. **Client Components** for easy integration into blueprint views
5. **API Endpoints** for programmatic access

**Design Philosophy**:
- Blueprints are canonical, marketing plans are derived
- All exports include reproducibility metadata
- No schema changes required
- Simple, maintainable architecture

**Next Steps**:
- Integrate `ExportButtons` into blueprint UI pages
- Test with real blueprint data
- Consider PDF export in future iterations
