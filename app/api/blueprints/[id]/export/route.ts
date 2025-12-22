import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/blueprints/[id]/export
 * Export blueprint as markdown
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id;

    if (!blueprintId) {
      return NextResponse.json(
        { error: 'Blueprint ID is required' },
        { status: 400 }
      );
    }

    // Fetch blueprint with related data
    const { data: blueprint, error } = await supabase
      .from('blueprints')
      .select(`
        *,
        ideas!inner(
          *,
          validations!inner(
            *,
            market_nodes!inner(name)
          )
        )
      `)
      .eq('id', blueprintId)
      .single();

    if (error || !blueprint) {
      console.error('Failed to fetch blueprint:', error);
      return NextResponse.json(
        { error: 'Blueprint not found', details: error?.message },
        { status: 404 }
      );
    }

    // Convert blueprint to markdown
    const markdown = convertBlueprintToMarkdown(blueprint);

    // Return as downloadable file
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="blueprint-${blueprintId}.md"`,
      },
    });
  } catch (error: any) {
    console.error(`Error in GET /api/blueprints/${params.id}/export:`, error);
    return NextResponse.json(
      { error: 'Failed to export blueprint', details: error.message },
      { status: 500 }
    );
  }
}

function convertBlueprintToMarkdown(blueprint: any): string {
  const idea = blueprint.ideas;
  const validation = idea.validations;
  const marketNode = validation.market_nodes;
  const date = new Date(blueprint.created_at).toLocaleDateString();

  return `# ${idea.title}
## Product Blueprint

**Generated:** ${date}
**Market:** ${marketNode.name}
**Validation Score:** ${validation.overall_score}/100

---

${blueprint.executive_summary}

---

${blueprint.target_market_analysis}

---

## Feature Roadmap

### MVP (${blueprint.feature_roadmap.mvp?.timeline || '4-6 weeks'})

${blueprint.feature_roadmap.mvp?.features?.map((f: string) => `- ${f}`).join('\n') || 'No features defined'}

### Phase 2 (${blueprint.feature_roadmap.phase_2?.timeline || '2-3 months post-launch'})

${blueprint.feature_roadmap.phase_2?.features?.map((f: string) => `- ${f}`).join('\n') || 'No features defined'}

### Phase 3 (${blueprint.feature_roadmap.phase_3?.timeline || '4-6 months post-launch'})

${blueprint.feature_roadmap.phase_3?.features?.map((f: string) => `- ${f}`).join('\n') || 'No features defined'}

### Technical Requirements

- **Stack:** ${blueprint.feature_roadmap.technical_requirements?.stack || 'Not specified'}
- **Infrastructure:** ${blueprint.feature_roadmap.technical_requirements?.infrastructure || 'Not specified'}
- **Integrations:** ${blueprint.feature_roadmap.technical_requirements?.integrations || 'Not specified'}
- **Mobile:** ${blueprint.feature_roadmap.technical_requirements?.mobile || 'Not specified'}

---

${blueprint.positioning_strategy}

---

${blueprint.gtm_recommendations}

---

${blueprint.risk_assessment}

---

## Product Idea Details

**Target Persona:**
${idea.target_persona}

**Value Proposition:**
${idea.value_proposition}

**Key Differentiators:**
${idea.differentiators?.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') || 'None specified'}

---

## Validation Data

**Overall Score:** ${validation.overall_score}/100

**Signal Breakdown:**
- Search Score: ${validation.search_score || 'N/A'}/100
- Social Score: ${validation.social_score || 'N/A'}/100
- Competition Score: ${validation.competition_score || 'N/A'}/100
- Financial Score: ${validation.financial_score || 'N/A'}/100

**Explanation:**
${validation.overall_explanation}

---

*This blueprint was generated using TrueDemand market validation analysis. MOCKED DATA - For demonstration purposes.*
`;
}
