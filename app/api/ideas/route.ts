import { NextResponse } from 'next/server';
import { createJob } from '@/lib/db/jobs';

/**
 * POST /api/ideas
 * Trigger idea generation job from validation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, validation_id } = body;

    if (!project_id || !validation_id) {
      return NextResponse.json(
        { error: 'project_id and validation_id are required' },
        { status: 400 }
      );
    }

    // Create idea generation job
    const job = await createJob({
      project_id,
      job_type: 'idea_generation',
      input_data: { validation_id },
    });

    return NextResponse.json({
      job_id: job.id,
      status: job.status,
    });
  } catch (error: any) {
    console.error('Error in POST /api/ideas:', error);
    return NextResponse.json(
      { error: 'Failed to create idea generation job', details: error.message },
      { status: 500 }
    );
  }
}
