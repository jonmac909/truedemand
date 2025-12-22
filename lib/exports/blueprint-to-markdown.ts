import type { BlueprintExportData, ExportMetadata, SourceCitation } from './types';

/**
 * Convert blueprint to Markdown format with full citations and metadata.
 *
 * @param data - Blueprint export data
 * @param metadata - Export metadata
 * @returns Markdown string
 */
export function blueprintToMarkdown(
  data: BlueprintExportData,
  metadata: ExportMetadata
): string {
  const sections: string[] = [];

  // Header
  sections.push(generateHeader(data, metadata));

  // Executive Summary
  sections.push(generateExecutiveSummarySection(data));

  // Validation Results
  sections.push(generateValidationSection(data));

  // Target Market Analysis
  sections.push(generateTargetMarketSection(data));

  // Feature Roadmap
  sections.push(generateFeatureRoadmapSection(data));

  // Positioning Strategy
  sections.push(generatePositioningSection(data));

  // Go-to-Market Recommendations
  sections.push(generateGTMSection(data));

  // Risk Assessment
  sections.push(generateRiskSection(data));

  // Source Citations
  sections.push(generateSourceCitationsSection(data));

  // Footer
  sections.push(generateFooter(metadata));

  return sections.join('\n\n---\n\n');
}

function generateHeader(data: BlueprintExportData, metadata: ExportMetadata): string {
  return `# ${data.idea.title} — Implementation Blueprint

**Generated**: ${new Date(metadata.generated_at).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  })}
**Market**: ${data.market_node.name}
**Validation Score**: ${data.validation.overall_score}/100

> ${data.idea.value_proposition}`;
}

function generateExecutiveSummarySection(data: BlueprintExportData): string {
  return data.executive_summary;
}

function generateValidationSection(data: BlueprintExportData): string {
  const { validation } = data;

  return `## Market Validation Summary

**Overall Score**: ${validation.overall_score}/100

${validation.overall_explanation}

### Score Breakdown

| Signal | Score | Description |
|--------|-------|-------------|
| Search Trends | ${validation.search_score}/100 | Market search volume and growth trajectory |
| Social Proof | ${validation.social_score}/100 | Community discussions and engagement |
| Competition | ${validation.competition_score}/100 | Market saturation and differentiation opportunities |
| Financial | ${validation.financial_score}/100 | Monetization potential and willingness to pay |

**Interpretation:**
- **70-100**: Strong validation signals across multiple dimensions
- **40-69**: Moderate validation with some promising indicators
- **0-39**: Weak validation signals - further research recommended`;
}

function generateTargetMarketSection(data: BlueprintExportData): string {
  return data.target_market_analysis;
}

function generateFeatureRoadmapSection(data: BlueprintExportData): string {
  const roadmap = data.feature_roadmap;

  let markdown = '## Feature Roadmap\n\n';

  if (roadmap.mvp) {
    markdown += `### MVP (Minimum Viable Product)\n`;
    markdown += `**Timeline**: ${roadmap.mvp.timeline || 'TBD'}\n\n`;
    markdown += roadmap.mvp.features
      ? roadmap.mvp.features.map((f: string) => `- ${f}`).join('\n')
      : 'No features defined';
    markdown += '\n\n';
  }

  if (roadmap.phase_2) {
    markdown += `### Phase 2: Growth Features\n`;
    markdown += `**Timeline**: ${roadmap.phase_2.timeline || 'TBD'}\n\n`;
    markdown += roadmap.phase_2.features
      ? roadmap.phase_2.features.map((f: string) => `- ${f}`).join('\n')
      : 'No features defined';
    markdown += '\n\n';
  }

  if (roadmap.phase_3) {
    markdown += `### Phase 3: Scale & Enterprise\n`;
    markdown += `**Timeline**: ${roadmap.phase_3.timeline || 'TBD'}\n\n`;
    markdown += roadmap.phase_3.features
      ? roadmap.phase_3.features.map((f: string) => `- ${f}`).join('\n')
      : 'No features defined';
    markdown += '\n\n';
  }

  if (roadmap.technical_requirements) {
    markdown += `### Technical Requirements\n\n`;
    const tech = roadmap.technical_requirements;
    if (tech.stack) markdown += `**Tech Stack**: ${tech.stack}\n\n`;
    if (tech.infrastructure) markdown += `**Infrastructure**: ${tech.infrastructure}\n\n`;
    if (tech.integrations) markdown += `**Integrations**: ${tech.integrations}\n\n`;
    if (tech.mobile) markdown += `**Mobile**: ${tech.mobile}\n\n`;
  }

  return markdown.trim();
}

function generatePositioningSection(data: BlueprintExportData): string {
  return data.positioning_strategy;
}

function generateGTMSection(data: BlueprintExportData): string {
  return data.gtm_recommendations;
}

function generateRiskSection(data: BlueprintExportData): string {
  return data.risk_assessment;
}

function generateSourceCitationsSection(data: BlueprintExportData): string {
  if (!data.sources || data.sources.length === 0) {
    return `## Data Sources

No validation sources available.`;
  }

  let markdown = `## Data Sources & Citations

This blueprint is built on the following validation sources:\n\n`;

  // Group sources by type
  const sourcesByType = data.sources.reduce((acc, source) => {
    const type = source.source_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(source);
    return acc;
  }, {} as Record<string, SourceCitation[]>);

  // Render each type
  const typeLabels: Record<string, string> = {
    search: 'Search Trends',
    social: 'Social Proof',
    financial: 'Financial Data',
    other: 'Other Sources',
  };

  for (const [type, sources] of Object.entries(sourcesByType)) {
    markdown += `### ${typeLabels[type] || type}\n\n`;

    for (const source of sources) {
      markdown += `**${source.citation}**\n`;
      markdown += `${source.evidence}\n\n`;
    }
  }

  markdown += `\n*All data sources were collected and analyzed as of ${new Date(data.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}.*`;

  return markdown;
}

function generateFooter(metadata: ExportMetadata): string {
  return `## About This Document

**Export Details:**
- Generated: ${new Date(metadata.generated_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
- Export Version: ${metadata.export_version}
- App Version: ${metadata.app_version}

**Disclaimer:**
This blueprint is based on automated market analysis and should be validated with additional research and customer interviews before making significant investment decisions.

---

*Generated by [TrueDemand](https://truedemand.app) — Market Validation for Product Builders*`;
}
