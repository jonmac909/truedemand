# TrueDemand — Product Requirements Document

## Vision
TrueDemand validates market demand for product ideas before development investment. Users export evidence-based blueprints citing real market signals.

## Problem
Entrepreneurs waste time building products nobody wants. Market research is time-consuming and often based on intuition rather than data.

## Solution
A guided workflow that:
1. Identifies high-demand markets
2. Surfaces underserved sub-niches
3. Validates demand with multi-signal analysis
4. Generates actionable product ideas
5. Creates detailed implementation blueprints
6. Exports cited documentation

## Success Metric (v1)
User completes the full journey and exports a cited blueprint.

## Primary User Journey
```
Market Selection → Sub-niche Discovery → Validation → Idea Generation → Blueprint → Export
```

### Flow Details
1. **Market Selection**: User selects or inputs a broad market category
2. **Sub-niche Discovery**: System identifies underserved sub-niches with demand signals
3. **Validation**: Multi-signal analysis (search trends, social proof, competition gaps, financial indicators)
4. **Idea Generation**: AI generates specific product ideas based on validated gaps
5. **Blueprint Creation**: Detailed implementation plan with features, positioning, MVP scope
6. **Export**: User downloads PDF/Markdown with full analysis and citations

## What v1 IS
- Single-player experience
- Read-only validation data
- Async background processing (non-blocking UI)
- Structured AI outputs with citations
- Exportable blueprints

## What v1 IS NOT (Non-Goals)
- No user accounts or saved projects (stateless session)
- No collaborative features or sharing
- No payment processing or monetization
- No competitor tracking dashboards
- No live data feeds or real-time updates
- No custom data uploads or integrations
- No A/B testing or experiment frameworks

## User Type (v1)
Solo entrepreneur or product manager exploring new market opportunities.

## Technical Constraints
- UI never blocks during analysis
- All heavy work runs as background jobs
- LLM outputs are structured JSON only
- Every score includes human-readable explanation
- Data gaps explicitly labeled "insufficient data"
