import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import {
  blueprintToMarkdown,
  EXPORT_VERSION,
  APP_VERSION,
  type BlueprintExportData,
  type ExportMetadata,
} from '@/lib/exports';

/**
 * GET /api/blueprints/[id]/export
 *
 * Export blueprint as Markdown with full citations and metadata.
 *
 * Returns:
 * - 200: Markdown file download
 * - 404: Blueprint not found
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const blueprintId = params.id;

  try {
    // Fetch blueprint with all related data
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprints')
      .select(`
        id,
        project_id,
        idea_id,
        executive_summary,
        target_market_analysis,
        feature_roadmap,
        positioning_strategy,
        gtm_recommendations,
        risk_assessment,
        created_at,
        ideas(
          id,
          title,
          target_persona,
          value_proposition,
          differentiators,
          validation_id,
          validations(
            id,
            overall_score,
            overall_explanation,
            search_score,
            social_score,
            competition_score,
            financial_score,
            market_node_id,
            market_nodes(
              id,
              name,
              description
            )
          )
        )
      `)
      .eq('id', blueprintId)
      .single();

    if (blueprintError || !blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Type assertion for single relations
    const idea = blueprint.ideas as any;
    const validation = idea.validations as any;
    const marketNode = validation.market_nodes as any;

    // Fetch validation sources for citations
    const { data: sources } = await supabase
      .from('validation_sources')
      .select('source_type, citation, evidence, metadata')
      .eq('validation_id', validation.id);

    // Prepare export data
    const exportData: BlueprintExportData = {
      blueprint_id: blueprint.id,
      project_id: blueprint.project_id,
      idea_id: blueprint.idea_id,
      idea: {
        title: idea.title,
        target_persona: idea.target_persona,
        value_proposition: idea.value_proposition,
        differentiators: idea.differentiators,
      },
      validation: {
        overall_score: validation.overall_score,
        overall_explanation: validation.overall_explanation,
        search_score: validation.search_score,
        social_score: validation.social_score,
        competition_score: validation.competition_score,
        financial_score: validation.financial_score,
      },
      market_node: {
        name: marketNode.name,
        description: marketNode.description,
      },
      executive_summary: blueprint.executive_summary,
      target_market_analysis: blueprint.target_market_analysis,
      feature_roadmap: blueprint.feature_roadmap,
      positioning_strategy: blueprint.positioning_strategy,
      gtm_recommendations: blueprint.gtm_recommendations,
      risk_assessment: blueprint.risk_assessment,
      sources: sources || [],
      created_at: blueprint.created_at,
    };

    // Generate export metadata
    const metadata: ExportMetadata = {
      generated_at: new Date().toISOString(),
      app_version: APP_VERSION,
      export_version: EXPORT_VERSION,
      export_type: 'blueprint',
    };

    // Convert to Markdown
    const markdown = blueprintToMarkdown(exportData, metadata);

    // Generate filename
    const sanitizedTitle = exportData.idea.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${sanitizedTitle}-blueprint.md`;

    // Return as downloadable file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Blueprint export error:', error);
    return NextResponse.json(
      { error: 'Failed to export blueprint' },
      { status: 500 }
    );
  }
}
