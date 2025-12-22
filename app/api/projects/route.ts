import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * POST /api/projects
 * Create a new project with a market node
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { market_input } = body;

    if (!market_input || typeof market_input !== 'string') {
      return NextResponse.json(
        { error: 'market_input is required and must be a string' },
        { status: 400 }
      );
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        market_input: market_input.trim(),
        current_step: 'market_selection',
        metadata: {},
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Failed to create project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError?.message },
        { status: 500 }
      );
    }

    // Create market node (sub-niche)
    const { data: marketNode, error: nodeError } = await supabase
      .from('market_nodes')
      .insert({
        project_id: project.id,
        parent_id: null,
        node_type: 'sub_niche',
        name: market_input.trim(),
        description: `Market validation for ${market_input.trim()}`,
      })
      .select()
      .single();

    if (nodeError || !marketNode) {
      console.error('Failed to create market node:', nodeError);
      // Clean up project if market node creation fails
      await supabase.from('projects').delete().eq('id', project.id);
      return NextResponse.json(
        { error: 'Failed to create market node', details: nodeError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      project_id: project.id,
      market_node_id: marketNode.id,
      market_input: market_input.trim(),
    });
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
