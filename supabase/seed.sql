-- TrueDemand Seed Data
-- Creates a demo project with partial data to demonstrate the workflow

-- Clean up existing seed data if re-running
TRUNCATE TABLE projects CASCADE;

-- ============================================================
-- DEMO PROJECT
-- Shows a user partway through the validation workflow
-- ============================================================

-- Insert demo project
INSERT INTO projects (id, market_input, current_step, metadata, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SaaS for Small Businesses',
  'validation',
  '{"demo": true, "note": "Example project for testing"}'::jsonb,
  NOW() - INTERVAL '2 hours'
);

-- ============================================================
-- MARKET NODES
-- Root market + 3 discovered sub-niches
-- ============================================================

-- Root market node
INSERT INTO market_nodes (id, project_id, parent_id, node_type, name, description, demand_score, score_explanation, analysis_data, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'market',
  'SaaS for Small Businesses',
  'Broad market category for business software targeting SMBs',
  NULL,
  NULL,
  '{}'::jsonb,
  NOW() - INTERVAL '2 hours'
);

-- Sub-niche 1: Inventory Management for Restaurants (selected for validation)
INSERT INTO market_nodes (id, project_id, parent_id, node_type, name, description, demand_score, score_explanation, analysis_data, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0001-000000000001',
  'sub_niche',
  'Inventory management for independent restaurants',
  'Specialized inventory and ordering tools for single-location and small chain restaurants (1-3 locations)',
  78,
  'High search volume (12K monthly), growing 23% YoY. Low competition with fragmented solutions. Strong social proof with frequent pain point discussions on Reddit r/restaurateur',
  '{
    "search_volume": 12000,
    "growth_rate": 0.23,
    "competition_level": "low",
    "social_signals": ["reddit_r/restaurateur", "restaurant_owner_forums"],
    "market_gap": "No integrated solution for small independents"
  }'::jsonb,
  NOW() - INTERVAL '1 hour 45 minutes'
);

-- Sub-niche 2: Employee Scheduling for Healthcare
INSERT INTO market_nodes (id, project_id, parent_id, node_type, name, description, demand_score, score_explanation, analysis_data, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0001-000000000001',
  'sub_niche',
  'Employee scheduling for small healthcare clinics',
  'Shift scheduling and coverage management for medical practices with 5-50 staff',
  65,
  'Moderate search volume (8.5K monthly), stable trend. Existing solutions are enterprise-focused and expensive for small clinics',
  '{
    "search_volume": 8500,
    "growth_rate": 0.05,
    "competition_level": "moderate",
    "market_gap": "Enterprise solutions too complex/expensive for small practices"
  }'::jsonb,
  NOW() - INTERVAL '1 hour 45 minutes'
);

-- Sub-niche 3: Client Portal for Service Businesses
INSERT INTO market_nodes (id, project_id, parent_id, node_type, name, description, demand_score, score_explanation, analysis_data, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0001-000000000001',
  'sub_niche',
  'Client portals for home service businesses',
  'Customer communication and job tracking for plumbers, electricians, HVAC contractors',
  52,
  'Lower search volume (4.2K monthly) but very specific intent. Market is underserved but willingness to pay is uncertain',
  '{
    "search_volume": 4200,
    "growth_rate": 0.08,
    "competition_level": "low",
    "concerns": "Uncertain willingness to pay, price-sensitive segment"
  }'::jsonb,
  NOW() - INTERVAL '1 hour 45 minutes'
);

-- ============================================================
-- VALIDATION
-- User selected sub-niche #1 for validation, job completed
-- ============================================================

INSERT INTO validations (id, project_id, market_node_id, overall_score, overall_explanation, search_score, social_score, competition_score, financial_score, analysis_data, created_at)
VALUES (
  '00000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0001-000000000002',
  74,
  'Strong validation signals across search, social, and competition dimensions. Restaurant inventory management shows consistent demand growth with clear pain points. Financial indicators suggest good willingness to pay ($100-300/mo range). Primary risk: fragmented market with varied POS integrations required.',
  82,
  71,
  68,
  75,
  '{
    "search_trend": "growing",
    "reddit_mentions": 47,
    "pain_points": ["food waste", "manual ordering", "poor forecasting", "POS integration"],
    "market_size_estimate": "$2.1B addressable market",
    "avg_willingness_to_pay": "$150-250/month",
    "key_competitors": ["Toast Inventory", "MarketMan", "BlueCart"],
    "competitor_gaps": ["Too expensive for independents", "Poor UX", "Lack of predictive features"]
  }'::jsonb,
  NOW() - INTERVAL '30 minutes'
);

-- ============================================================
-- VALIDATION SOURCES
-- Citations supporting the validation scores
-- ============================================================

-- Search signal sources
INSERT INTO validation_sources (validation_id, source_type, citation, evidence, metadata)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'search',
    'Google Trends: "restaurant inventory software" 2023-2024',
    'Search volume grew 23% year-over-year with consistent interest. Peak searches in Q4 (budget planning season)',
    '{"data_range": "2023-01-01 to 2024-12-01", "trend": "rising"}'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000001',
    'search',
    'Ahrefs keyword analysis: restaurant + inventory related terms',
    'Combined monthly search volume of 47,000 for related terms. Low competition keywords with high commercial intent',
    '{"total_volume": 47000, "competition": "low", "cpc_avg": "$8.50"}'::jsonb
  );

-- Social signal sources
INSERT INTO validation_sources (validation_id, source_type, citation, evidence, metadata)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'social',
    'Reddit r/restaurateur - recurring pain point discussions',
    'Monthly threads about food waste and inventory struggles. Users report losing 15-30% to spoilage and over-ordering',
    '{"subreddit": "restaurateur", "monthly_mentions": 12, "avg_upvotes": 34}'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000001',
    'social',
    'Restaurant Owner Facebook groups analysis',
    'Frequent requests for "simple inventory tools that work with Square/Clover". Dissatisfaction with enterprise solutions',
    '{"platform": "facebook", "group_size": 24000, "weekly_mentions": 8}'::jsonb
  );

-- Competition signal sources
INSERT INTO validation_sources (validation_id, source_type, citation, evidence, metadata)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'competition',
    'G2 Reviews: Toast Inventory & MarketMan',
    'Top complaints: "Too expensive for my single location" (43% of negative reviews), "Steep learning curve" (31%)',
    '{"avg_rating": 3.2, "price_complaints": 0.43, "complexity_complaints": 0.31}'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000001',
    'competition',
    'Capterra competitor feature analysis',
    'Existing solutions lack: predictive ordering (12% have it), simple POS integration (31% have it), mobile-first design (22% have it)',
    '{"feature_gaps": ["predictive_ordering", "easy_pos_integration", "mobile_first"]}'::jsonb
  );

-- Financial signal sources
INSERT INTO validation_sources (validation_id, source_type, citation, evidence, metadata)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'financial',
    'Industry report: Restaurant Technology Market 2024',
    'Independent restaurants (1-3 locations) represent $2.1B software TAM. Average software spend: $400-800/month across all tools',
    '{"tam": "$2.1B", "segment": "independent_restaurants", "avg_monthly_spend": "$400-800"}'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000001',
    'financial',
    'Survey: Restaurant owner software budgets',
    'Willingness to pay $100-300/mo for inventory solution that demonstrably reduces food waste by 20%+',
    '{"sample_size": 284, "wtp_range": "$100-300", "condition": "proven 20%+ waste reduction"}'::jsonb
  );

-- ============================================================
-- JOBS
-- History of jobs run for this project
-- ============================================================

-- Sub-niche discovery job (completed)
INSERT INTO jobs (id, project_id, job_type, status, input_data, result_data, started_at, completed_at, created_at)
VALUES (
  '00000000-0000-0000-0003-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'sub_niche_discovery',
  'completed',
  '{"market_input": "SaaS for Small Businesses"}'::jsonb,
  '{
    "sub_niches": [
      {"id": "00000000-0000-0000-0001-000000000002", "name": "Inventory management for independent restaurants", "score": 78},
      {"id": "00000000-0000-0000-0001-000000000003", "name": "Employee scheduling for small healthcare clinics", "score": 65},
      {"id": "00000000-0000-0000-0001-000000000004", "name": "Client portals for home service businesses", "score": 52}
    ]
  }'::jsonb,
  NOW() - INTERVAL '1 hour 50 minutes',
  NOW() - INTERVAL '1 hour 45 minutes',
  NOW() - INTERVAL '2 hours'
);

-- Validation job (completed)
INSERT INTO jobs (id, project_id, job_type, status, input_data, result_data, started_at, completed_at, created_at)
VALUES (
  '00000000-0000-0000-0003-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'validation',
  'completed',
  '{"market_node_id": "00000000-0000-0000-0001-000000000002"}'::jsonb,
  '{
    "validation_id": "00000000-0000-0000-0002-000000000001",
    "overall_score": 74,
    "signals": {
      "search": 82,
      "social": 71,
      "competition": 68,
      "financial": 75
    }
  }'::jsonb,
  NOW() - INTERVAL '35 minutes',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '40 minutes'
);

-- ============================================================
-- VERIFICATION QUERIES
-- Run these to verify seed data integrity
-- ============================================================

-- Verify project exists
-- SELECT * FROM projects WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify market hierarchy
-- SELECT id, node_type, name, demand_score FROM market_nodes
-- WHERE project_id = '00000000-0000-0000-0000-000000000001'
-- ORDER BY created_at;

-- Verify validation with sources
-- SELECT
--   v.overall_score,
--   v.search_score,
--   v.social_score,
--   COUNT(vs.id) as source_count
-- FROM validations v
-- LEFT JOIN validation_sources vs ON vs.validation_id = v.id
-- WHERE v.project_id = '00000000-0000-0000-0000-000000000001'
-- GROUP BY v.id;

-- Verify job history
-- SELECT job_type, status, completed_at - started_at as duration
-- FROM jobs
-- WHERE project_id = '00000000-0000-0000-0000-000000000001'
-- ORDER BY created_at;
