/**
 * Test script for B2 Explainable Scoring System
 *
 * This script demonstrates the scoring logic with various test scenarios:
 * 1. Strong signals across all dimensions
 * 2. Mixed signals (some strong, some weak)
 * 3. Insufficient data handling
 * 4. Custom weight configurations
 *
 * Run with: npx ts-node scripts/test-scoring.ts
 */

import { computeExplainableScore } from '../lib/scoring/explainable-score';
import type { ScoringInput } from '../lib/scoring/types';

console.log('\n=== B2 Explainable Scoring System Test ===\n');

// Test Scenario 1: Strong signals across all dimensions
console.log('--- Scenario 1: Strong Signals (High Opportunity) ---');
const strongSignals: ScoringInput = {
  validationId: 'test-1',
  scores: {
    trend: 85, // Strong upward trend
    pain: 90, // Critical pain points
    competition: 75, // Low competition
    monetization: 80, // Strong revenue potential
  },
  audienceClarity: 85,
  dataSourcesAvailable: {
    reddit: true,
    trends: true,
    tiktok: true,
  },
};

const result1 = computeExplainableScore(strongSignals);
console.log(`Overall Score: ${result1.overallScore}/100`);
console.log(`Confidence: ${result1.confidence}`);
console.log(`Summary: ${result1.summary}`);
console.log('\nFactor Breakdown:');
result1.factorExplanations.forEach((f) => {
  console.log(
    `  ${f.factor}: ${f.score}/100 (weight: ${f.weight * 100}%, contribution: ${f.contribution}pts) - ${f.dataQuality}`
  );
  console.log(`    ${f.explanation}`);
  if (f.warnings) {
    f.warnings.forEach((w) => console.log(`    ⚠️ ${w}`));
  }
});

// Test Scenario 2: Mixed signals
console.log('\n\n--- Scenario 2: Mixed Signals (Moderate Opportunity) ---');
const mixedSignals: ScoringInput = {
  validationId: 'test-2',
  scores: {
    trend: 65, // Moderate trend
    pain: 45, // Weak pain signals
    competition: 80, // Low competition (good!)
    monetization: 50, // Moderate monetization
  },
  audienceClarity: 40,
  dataSourcesAvailable: {
    reddit: true,
    trends: true,
    tiktok: false,
  },
};

const result2 = computeExplainableScore(mixedSignals);
console.log(`Overall Score: ${result2.overallScore}/100`);
console.log(`Confidence: ${result2.confidence}`);
console.log(`Summary: ${result2.summary}`);
console.log(`Data Quality: ${result2.dataQuality.strongFactors}/4 strong factors, ${result2.dataQuality.insufficientFactors} insufficient`);
console.log(`Gaps: ${result2.dataQuality.gaps.join(', ')}`);

// Test Scenario 3: Insufficient data
console.log('\n\n--- Scenario 3: Insufficient Data (Low Confidence) ---');
const insufficientData: ScoringInput = {
  validationId: 'test-3',
  scores: {
    trend: null, // No Google Trends data
    pain: 60,
    competition: null, // No competition data
    monetization: null, // No monetization data
  },
  audienceClarity: null,
  dataSourcesAvailable: {
    reddit: true,
    trends: false,
    tiktok: false,
  },
};

const result3 = computeExplainableScore(insufficientData);
console.log(`Overall Score: ${result3.overallScore}/100`);
console.log(`Confidence: ${result3.confidence}`);
console.log(`Summary: ${result3.summary}`);
console.log(`Data Quality: ${result3.dataQuality.strongFactors}/4 strong factors, ${result3.dataQuality.insufficientFactors} insufficient`);
console.log('\nInsufficient Factors:');
result3.factorExplanations
  .filter((f) => f.dataQuality === 'insufficient')
  .forEach((f) => {
    console.log(`  ${f.factor}: ${f.explanation}`);
  });

// Test Scenario 4: Custom weights (emphasize pain over everything else)
console.log('\n\n--- Scenario 4: Custom Weights (Pain-Focused) ---');
const customWeights = {
  pain: 0.50, // 50% weight on pain
  trend: 0.20,
  monetization: 0.20,
  competition: 0.10,
};

const result4 = computeExplainableScore(strongSignals, {
  weights: customWeights,
});
console.log(`Overall Score: ${result4.overallScore}/100 (with custom weights)`);
console.log(`Weights Used: pain=${customWeights.pain * 100}%, trend=${customWeights.trend * 100}%, monetization=${customWeights.monetization * 100}%, competition=${customWeights.competition * 100}%`);
console.log('\nFactor Contributions (with custom weights):');
result4.factorExplanations.forEach((f) => {
  console.log(`  ${f.factor}: ${f.contribution}pts (score: ${f.score}, weight: ${f.weight * 100}%)`);
});

// Compare with default weights
console.log(`\nComparison:`);
console.log(`  Default weights score: ${result1.overallScore}/100`);
console.log(`  Pain-focused weights score: ${result4.overallScore}/100`);
console.log(`  Difference: ${result4.overallScore - result1.overallScore}pts`);

console.log('\n=== Test Complete ===\n');
