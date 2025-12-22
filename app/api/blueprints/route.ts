import { NextResponse } from 'next/server';
import { createJob } from '@/lib/db/jobs';

/**
 * POST /api/blueprints
 * Trigger blueprint creation job from idea
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, idea_id } = body;

    if (!project_id || !idea_id) {
      return NextResponse.json(
        { error: 'project_id and idea_id are required' },
        { status: 400 }
      );
    }

    // Create blueprint generation job
    const job = await createJob({
      project_id,
      job_type: 'blueprint_creation',
      input_data: { idea_id },
    });

    return NextResponse.json({
      job_id: job.id,
      status: job.status,
    });
  } catch (error: any) {
    console.error('Error in POST /api/blueprints:', error);
    return NextResponse.json(
      { error: 'Failed to create blueprint job', details: error.message },
      { status: 500 }
    );
  }
}
