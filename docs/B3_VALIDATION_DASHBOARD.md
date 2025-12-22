# B3 Validation Dashboard

## Overview

The B3 Validation Dashboard is a user-facing UI that displays comprehensive market validation results. It consumes data from B1 (validation) and B2 (scoring) to present entrepreneurs with actionable insights about their market opportunities.

### Key Features

✅ **Prominent Opportunity Score** - Color-coded circular indicator (0-100)
✅ **Score Breakdown** - Four factors with detailed explanations
✅ **Data Quality Transparency** - Clear warnings when data is insufficient
✅ **Source Citations** - Full transparency of Reddit, TikTok, and Trends data
✅ **Tabbed Interface** - Organized view of different data sources
✅ **Responsive States** - Loading, error, and empty states

---

## Architecture

### Page Structure

```
app/validation/[id]/page.tsx        # Main dashboard page (dynamic route)
```

### Components

```
components/validation/
├── opportunity-score.tsx            # Circular score indicator
├── score-factor.tsx                 # Individual factor card
├── collapsible-section.tsx          # Expandable sections
├── tabs.tsx                         # Tab navigation
├── source-card.tsx                  # Data source display
└── index.ts                         # Component exports
```

---

## Component Details

### 1. OpportunityScore

Circular progress indicator showing the overall validation score.

**Props:**
```typescript
{
  score: number;           // 0-100
  size?: 'default' | 'large';
  className?: string;
}
```

**Color Coding:**
- 0-39: Red (#EF4444) - Low Opportunity
- 40-69: Amber (#F59E0B) - Medium Opportunity
- 70-100: Green (#10B981) - High Opportunity

**Features:**
- Animated SVG progress ring
- Large, readable score display
- Automatic label generation

---

### 2. ScoreFactor

Individual factor card displaying score, explanation, and data quality.

**Props:**
```typescript
{
  icon: string;                      // Emoji icon
  title: string;                     // Factor name
  score: number | null;              // 0-100 or null
  explanation: string;               // Human-readable description
  dataQuality: 'strong' | 'moderate' | 'weak' | 'insufficient';
  warnings?: string[];               // Data quality warnings
  weight: number;                    // 0-1 (percentage)
}
```

**Features:**
- Color-coded score display
- Horizontal progress bar
- Data quality badge
- Warning callouts for insufficient data
- Weight percentage display

---

### 3. CollapsibleSection

Expandable section for additional details.

**Props:**
```typescript
{
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}
```

**Use Cases:**
- "Why This Score" explanations
- Scoring weights display
- Additional metadata

---

### 4. Tabs

Tab navigation for switching between data source views.

**Props:**
```typescript
{
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    count?: number;              // Badge count
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}
```

**Tabs:**
- Overview - Complete summary
- Reddit - Social discussions
- TikTok - Video content analysis
- Trends - Search trend data

---

### 5. SourceCard

Display individual validation data sources.

**Props:**
```typescript
{
  platform: 'reddit' | 'tiktok' | 'google_trends' | 'llm_claude' | string;
  citation: string;
  evidence: string;
  metadata?: {
    query?: string;
    fetched_at?: string;
    reproducible?: boolean;
  };
  className?: string;
}
```

**Features:**
- Platform-specific badges with icons
- Timestamp display
- Search query visibility
- Reproducibility indicator

---

## Data Flow

### 1. Validation Data (from B1 + B2)

```typescript
interface ValidationData {
  id: string;
  overall_score: number;                    // Final score from B2
  overall_explanation: string;
  search_score: number | null;              // B1 trend score
  social_score: number | null;              // B1 pain score
  competition_score: number | null;         // B1 competition score
  financial_score: number | null;           // B1 monetization score
  analysis_data: {
    confidence?: 'high' | 'medium' | 'low';
    weights_used?: {                        // B2 weights
      trend: number;
      pain: number;
      competition: number;
      monetization: number;
    };
    explanation?: {                         // B2 detailed explanation
      summary: string;
      breakdown: {...};
      factorExplanations: [...];
      dataQuality: {...};
    };
    data_sources_available?: {
      reddit: boolean;
      trends: boolean;
      tiktok: boolean;
    };
  };
  market_node?: {
    name: string;
    description: string;
  };
}
```

### 2. Validation Sources

```typescript
interface ValidationSource {
  id: string;
  source_type: 'search' | 'social' | 'competition' | 'financial' | 'other';
  citation: string;
  evidence: string;
  metadata: {
    platform: string;
    query?: string;
    fetched_at?: string;
    reproducible?: boolean;
    raw?: any;
  };
}
```

---

## Page States

### Loading State

```typescript
<Loader2 className="h-12 w-12 text-[#2563EB] animate-spin" />
<p>Loading validation data...</p>
```

### Error State

```typescript
<AlertCircle className="h-12 w-12 text-[#EF4444]" />
<h3>Unable to Load Validation</h3>
<p>{errorMessage}</p>
<Button onClick={goBack}>Go Back</Button>
```

### Empty State (No Sources)

```typescript
<Card>
  <CardContent>
    <p>No Reddit data available</p>
  </CardContent>
</Card>
```

---

## Design System Compliance

### Colors

All components use the locked blue design system:

- **Primary:** `#2563EB` (trustworthy blue)
- **Success:** `#10B981` (high opportunity)
- **Warning:** `#F59E0B` (medium opportunity)
- **Error:** `#EF4444` (low opportunity)
- **Neutrals:** Slate scale for text and backgrounds

### Typography

- **Headings:** 20-32px, font-bold/semibold
- **Body:** 14-15px, font-normal
- **Small text:** 12-13px for labels and metadata
- **Font:** Inter (from design system)

### Spacing

- **Section gaps:** 24px (gap-6)
- **Card padding:** 20-24px (p-5, p-6)
- **Grid gaps:** 16px (gap-4) or 24px (gap-6)

### Components Used

✅ Card, CardHeader, CardTitle, CardDescription, CardContent
✅ Badge (primary, success, warning, error, secondary)
✅ Button (primary, secondary)
✅ Existing design tokens and utilities

---

## Usage Examples

### Accessing the Dashboard

```
URL: /validation/{validation_id}
Example: /validation/abc-123-def-456
```

### Mock Data (Current Implementation)

The dashboard currently uses mock data for demonstration. To connect to real data:

1. Replace mock data fetch in `useEffect`
2. Add API call to `/api/validations/{id}` and `/api/validations/{id}/sources`
3. Handle loading and error states from API

```typescript
// TODO: Replace with actual API
const response = await fetch(`/api/validations/${validationId}`);
const data = await response.json();
setValidation(data);

const sourcesResponse = await fetch(`/api/validations/${validationId}/sources`);
const sourcesData = await sourcesResponse.json();
setSources(sourcesData);
```

---

## API Integration (TODO)

### Required Endpoints

**GET `/api/validations/{id}`**

Returns complete validation data including:
- B1 sub-scores
- B2 overall score and explanations
- Analysis metadata

**GET `/api/validations/{id}/sources`**

Returns array of validation sources from `validation_sources` table.

---

## Performance Considerations

### Optimizations

1. **Lazy Loading**: Tab content only renders when active
2. **Memoization**: Large lists should use React.memo
3. **SVG Animations**: CSS-only transitions for smooth 60fps
4. **Image Loading**: Platform icons use emoji (no HTTP requests)

### Bundle Size

- No heavy chart libraries
- Minimal dependencies (lucide-react for icons)
- Reuses existing UI components

---

## Future Enhancements (Post-B3)

The following are **NOT** implemented in B3 but could be added:

- Weight adjustment UI (sliders)
- Re-scoring controls
- Export/download functionality
- Historical comparisons
- Advanced charts and visualizations
- Real-time job progress tracking
- Collaborative annotations

---

## Testing Checklist

- [ ] Score displays correctly for all ranges (0-39, 40-69, 70-100)
- [ ] Tab switching works smoothly
- [ ] Loading state displays during fetch
- [ ] Error state handles missing validations
- [ ] Empty states show when no sources available
- [ ] Warnings display for insufficient data
- [ ] Source cards render all platforms correctly
- [ ] Collapsible sections expand/collapse
- [ ] Responsive layout works on mobile
- [ ] Color coding matches design system

---

## Files Created

```
app/validation/[id]/page.tsx                      # Main dashboard page
components/validation/opportunity-score.tsx       # Circular score indicator
components/validation/score-factor.tsx            # Factor breakdown cards
components/validation/collapsible-section.tsx     # Expandable sections
components/validation/tabs.tsx                    # Tab navigation
components/validation/source-card.tsx             # Source display
components/validation/index.ts                    # Component exports
docs/B3_VALIDATION_DASHBOARD.md                   # This documentation
```

---

## Questions?

For implementation details, see:
- `components/validation/` - All dashboard components
- `app/validation/[id]/page.tsx` - Main page implementation
- `DESIGN_SYSTEM.md` - Design system specifications
- `docs/B2_SCORING_SYSTEM.md` - Scoring system documentation
