import { NextResponse } from 'next/server';
import { createJob } from '@/lib/db/jobs';

/**
 * POST /api/validate
 * Trigger a validation job for a market node
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, market_node_id } = body;

    if (!project_id || !market_node_id) {
      return NextResponse.json(
        { error: 'project_id and market_node_id are required' },
        { status: 400 }
      );
    }

    // Create validation job
    const job = await createJob({
      project_id,
      job_type: 'validation',
      input_data: { market_node_id },
    });

    return NextResponse.json({
      job_id: job.id,
      status: job.status,
    });
  } catch (error: any) {
    console.error('Error in POST /api/validate:', error);
    return NextResponse.json(
      { error: 'Failed to create validation job', details: error.message },
      { status: 500 }
    );
  }
}
