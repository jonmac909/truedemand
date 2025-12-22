/**
 * C2 Export System Types
 *
 * Defines metadata and interfaces for exporting blueprints and
 * derived marketing plans to Markdown format.
 */

/**
 * Export metadata included in all exports
 */
export interface ExportMetadata {
  /** Export generation timestamp */
  generated_at: string;
  /** TrueDemand application version */
  app_version: string;
  /** Export format version for backward compatibility */
  export_version: string;
  /** Type of export */
  export_type: 'blueprint' | 'marketing_plan';
}

/**
 * Source citation for validation evidence
 */
export interface SourceCitation {
  source_type: 'search' | 'social' | 'financial' | 'other';
  citation: string;
  evidence: string;
  metadata?: Record<string, any>;
}

/**
 * Blueprint export data structure
 */
export interface BlueprintExportData {
  blueprint_id: string;
  project_id: string;
  idea_id: string;
  idea: {
    title: string;
    target_persona: string;
    value_proposition: string;
    differentiators: string[];
  };
  validation: {
    overall_score: number;
    overall_explanation: string;
    search_score: number;
    social_score: number;
    competition_score: number;
    financial_score: number;
  };
  market_node: {
    name: string;
    description: string;
  };
  executive_summary: string;
  target_market_analysis: string;
  feature_roadmap: any;
  positioning_strategy: string;
  gtm_recommendations: string;
  risk_assessment: string;
  sources: SourceCitation[];
  created_at: string;
}

/**
 * Marketing plan export data (derived from blueprint)
 */
export interface MarketingPlanExportData {
  blueprint_id: string;
  project_id: string;
  product_title: string;
  target_persona: string;
  value_proposition: string;
  market_name: string;
  validation_score: number;
  gtm_recommendations: string;
  positioning_strategy: string;
  target_market_analysis: string;
  created_at: string;
}
