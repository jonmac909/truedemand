# TrueDemand — User Flows

## Primary Flow: Market to Blueprint

### Step 1: Market Selection
**User Action**: Selects a broad market or enters custom category
- Example: "SaaS for Small Businesses" or "Health & Wellness Apps"

**System Response**: Confirms selection, initiates sub-niche analysis

**UI State**: Shows loading state, job running in background

---

### Step 2: Sub-niche Discovery
**System Action**: Analyzes market and surfaces 3-5 underserved sub-niches

**User Sees**:
- List of sub-niches with demand scores
- Brief explanation for each score
- "Insufficient data" if signals are weak

**User Action**: Selects one sub-niche to validate

**Example Output**:
```
1. "Inventory management for restaurants" — Score: 78/100
   → High search volume, low competition, growing trend
2. "Employee scheduling for healthcare" — Score: 65/100
   → Moderate demand, fragmented solutions
```

---

### Step 3: Validation
**System Action**: Runs multi-signal validation on selected sub-niche

**Validation Signals**:
- Search trends (volume, growth trajectory)
- Social proof (Reddit discussions, forum activity)
- Competition gaps (feature requests, pain points)
- Financial indicators (market size estimates, willingness to pay)

**User Sees**:
- Overall validation score (0-100)
- Breakdown by signal category
- Supporting evidence with citations
- Red flags or caution indicators

**User Action**: Reviews validation, proceeds to idea generation

---

### Step 4: Idea Generation
**System Action**: Generates 3-5 specific product ideas targeting validated gaps

**User Sees**:
- Product concept titles
- Target user persona
- Core value proposition
- Key differentiators

**User Action**: Selects one idea for blueprint

**Example**:
```
"TableTurn — Smart Inventory for Independent Restaurants"
→ Targets: Independent restaurant owners (1-3 locations)
→ Value: Reduce food waste by 30% with predictive ordering
→ Differentiator: Integrated with existing POS systems
```

---

### Step 5: Blueprint Creation
**System Action**: Generates detailed implementation blueprint

**Blueprint Includes**:
- Executive summary
- Target market analysis (with citations)
- Feature roadmap (MVP vs. future)
- Positioning strategy
- Go-to-market recommendations
- Risk assessment

**User Sees**: Full blueprint rendered in-app

**User Action**: Reviews content, clicks "Export"

---

### Step 6: Export
**User Action**: Clicks export button, chooses format (PDF or Markdown)

**System Response**: Downloads file immediately

**Success State**: User has actionable, cited blueprint for validated product idea

---

## Error States

### Insufficient Data
If any step lacks sufficient signals:
- Display "Insufficient data to generate reliable score"
- Explain what data is missing
- Offer option to try different market/sub-niche

### Job Failure
If background job fails:
- Show friendly error message
- Offer retry option
- Never leave user in loading state indefinitely

---

## Non-Interactive Elements (v1)

- No editing of generated content
- No saving or revisiting previous sessions
- No user accounts or history
- No sharing or collaboration
- Linear flow only (no jumping between steps)
