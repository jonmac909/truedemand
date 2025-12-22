import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import {
  marketingPlanToMarkdown,
  EXPORT_VERSION,
  APP_VERSION,
  type MarketingPlanExportData,
  type ExportMetadata,
} from '@/lib/exports';
import { assertDefined, assertNonEmptyString } from '@/lib/qa/assertions';

/**
 * GET /api/blueprints/[id]/export-marketing
 *
 * Export marketing plan (DERIVED from blueprint) as Markdown.
 *
 * Marketing plans are NOT stored separately - they are generated on-demand
 * from blueprint.gtm_recommendations + related context.
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
    // Fetch blueprint with related data needed for marketing plan
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprints')
      .select(`
        id,
        project_id,
        idea_id,
        gtm_recommendations,
        positioning_strategy,
        target_market_analysis,
        created_at,
        ideas(
          id,
          title,
          target_persona,
          value_proposition,
          validation_id,
          validations(
            id,
            overall_score,
            market_node_id,
            market_nodes(
              id,
              name
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

    // C3 QA: Validate required data is present
    assertDefined(idea, 'idea', 'Marketing plan export');
    assertDefined(validation, 'validation', 'Marketing plan export');
    assertDefined(marketNode, 'marketNode', 'Marketing plan export');
    assertNonEmptyString(idea.title, 'idea.title', 'Marketing plan export');
    assertNonEmptyString(blueprint.gtm_recommendations, 'gtm_recommendations', 'Marketing plan export');

    // Prepare marketing plan export data (derived from blueprint)
    const exportData: MarketingPlanExportData = {
      blueprint_id: blueprint.id,
      project_id: blueprint.project_id,
      product_title: idea.title,
      target_persona: idea.target_persona,
      value_proposition: idea.value_proposition,
      market_name: marketNode.name,
      validation_score: validation.overall_score,
      gtm_recommendations: blueprint.gtm_recommendations,
      positioning_strategy: blueprint.positioning_strategy,
      target_market_analysis: blueprint.target_market_analysis,
      created_at: blueprint.created_at,
    };

    // Generate export metadata
    const metadata: ExportMetadata = {
      generated_at: new Date().toISOString(),
      app_version: APP_VERSION,
      export_version: EXPORT_VERSION,
      export_type: 'marketing_plan',
    };

    // Convert to Markdown
    const markdown = marketingPlanToMarkdown(exportData, metadata);

    // Generate filename
    const sanitizedTitle = exportData.product_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${sanitizedTitle}-marketing-plan.md`;

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
    console.error('Marketing plan export error:', error);
    return NextResponse.json(
      { error: 'Failed to export marketing plan' },
      { status: 500 }
    );
  }
}
