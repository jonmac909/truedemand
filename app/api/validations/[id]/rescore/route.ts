import { NextResponse } from 'next/server';
import { rescoreValidation } from '@/lib/scoring';
import type { ScoringWeights } from '@/lib/scoring/types';

/**
 * POST /api/validations/[id]/rescore
 *
 * Re-score an existing validation with optional custom weights
 *
 * Request body (optional):
 * {
 *   "weights": {
 *     "trend": 0.25,      // 0-1, all weights must sum to 1.0
 *     "pain": 0.30,
 *     "competition": 0.20,
 *     "monetization": 0.25
 *   },
 *   "persist": true       // Whether to save results to database (default: true)
 * }
 *
 * Response:
 * {
 *   "overallScore": 72,
 *   "confidence": "high",
 *   "summary": "Strong opportunity with...",
 *   "breakdown": { ... },
 *   "factorExplanations": [ ... ],
 *   "weightsUsed": { ... },
 *   "dataQuality": { ... },
 *   "scoredAt": "2023-12-21T10:30:00.000Z"
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validationId = params.id;

    if (!validationId) {
      return NextResponse.json(
        { error: 'Validation ID is required' },
        { status: 400 }
      );
    }

    // Parse request body (optional)
    let body: {
      weights?: Partial<ScoringWeights>;
      persist?: boolean;
    } = {};

    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate weights if provided
    if (body.weights) {
      const { trend, pain, competition, monetization } = body.weights;

      // Check that all provided weights are valid numbers between 0 and 1
      const weights = { trend, pain, competition, monetization };
      for (const [key, value] of Object.entries(weights)) {
        if (value !== undefined) {
          if (typeof value !== 'number' || value < 0 || value > 1) {
            return NextResponse.json(
              { error: `Invalid weight for ${key}: must be a number between 0 and 1` },
              { status: 400 }
            );
          }
        }
      }

      // If all weights are provided, check they sum to 1.0
      if (trend !== undefined && pain !== undefined && competition !== undefined && monetization !== undefined) {
        const sum = trend + pain + competition + monetization;
        const tolerance = 0.01;
        if (Math.abs(sum - 1.0) > tolerance) {
          return NextResponse.json(
            { error: `Weights must sum to 1.0 (current sum: ${sum})` },
            { status: 400 }
          );
        }
      }
    }

    // Re-score the validation
    const result = await rescoreValidation(validationId, {
      weights: body.weights,
      persist: body.persist,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in POST /api/validations/${params.id}/rescore:`, error);

    // Handle specific error cases
    if (error.message.includes('Not found')) {
      return NextResponse.json(
        { error: 'Validation not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('must sum to 1.0')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to re-score validation', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validations/[id]/rescore
 *
 * Get current scoring details for a validation
 * (Re-computes score without persisting, using default weights)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const validationId = params.id;

    if (!validationId) {
      return NextResponse.json(
        { error: 'Validation ID is required' },
        { status: 400 }
      );
    }

    // Re-score without persisting
    const result = await rescoreValidation(validationId, {
      persist: false,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in GET /api/validations/${params.id}/rescore:`, error);

    if (error.message.includes('Not found')) {
      return NextResponse.json(
        { error: 'Validation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to compute validation score', details: error.message },
      { status: 500 }
    );
  }
}
