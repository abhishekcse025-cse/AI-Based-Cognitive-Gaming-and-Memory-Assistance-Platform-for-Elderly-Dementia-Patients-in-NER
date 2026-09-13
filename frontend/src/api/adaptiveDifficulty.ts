import { getApiBaseUrl, isUsingMockApi } from '../config/env';
import {
  AdaptiveDifficultyRequest,
  AdaptiveDifficultyResponse,
  DifficultyLevel,
  PerformanceRating,
} from '../types/api';
import { sessionStore } from '../services/sessionStore';

// Local evaluation logic for Mock Mode
function calculateMockDifficulty(
  req: AdaptiveDifficultyRequest
): AdaptiveDifficultyResponse {
  const { current_difficulty, completed, errors_made, total_moves } = req;

  // If abandoned or ended prematurely
  if (!completed) {
    let nextDiff: DifficultyLevel = current_difficulty;
    if (current_difficulty === 'hard') nextDiff = 'medium';
    else if (current_difficulty === 'medium') nextDiff = 'easy';
    
    return {
      performance: 'poor',
      next_difficulty: nextDiff,
    };
  }

  let rating: PerformanceRating = 'average';

  if (req.game_type === 'memory_match') {
    if (current_difficulty === 'easy') {
      if (errors_made <= 1 && total_moves <= 5) rating = 'good';
      else if (errors_made >= 4) rating = 'poor';
    } else if (current_difficulty === 'medium') {
      if (errors_made <= 2 && total_moves <= 8) rating = 'good';
      else if (errors_made >= 6) rating = 'poor';
    } else {
      // hard
      if (errors_made <= 3 && total_moves <= 12) rating = 'good';
      else if (errors_made >= 8) rating = 'poor';
    }
  } else {
    // sequence
    if (current_difficulty === 'easy') {
      if (errors_made === 0) rating = 'good';
      else if (errors_made >= 3) rating = 'poor';
    } else if (current_difficulty === 'medium') {
      if (errors_made <= 1) rating = 'good';
      else if (errors_made >= 4) rating = 'poor';
    } else {
      // hard
      if (errors_made <= 2) rating = 'good';
      else if (errors_made >= 6) rating = 'poor';
    }
  }

  // Determine next difficulty step
  let next_difficulty: DifficultyLevel = current_difficulty;
  if (rating === 'good') {
    if (current_difficulty === 'easy') next_difficulty = 'medium';
    else if (current_difficulty === 'medium') next_difficulty = 'hard';
    else next_difficulty = 'hard';
  } else if (rating === 'poor') {
    if (current_difficulty === 'hard') next_difficulty = 'medium';
    else if (current_difficulty === 'medium') next_difficulty = 'easy';
    else next_difficulty = 'easy';
  }

  return {
    performance: rating,
    next_difficulty,
  };
}

/**
 * Main API client function to submit game attempt results and retrieve next difficulty.
 * Used identically across all game screens without hardcoded level changes.
 */
export async function submitGameAttempt(
  payload: AdaptiveDifficultyRequest
): Promise<AdaptiveDifficultyResponse> {
  const useMock = isUsingMockApi();
  const baseUrl = getApiBaseUrl();

  console.log('====================================================');
  console.log('[API Request] POST /adaptive-difficulty');
  console.log(`[Mode: ${useMock ? 'LOCAL MOCK' : 'REAL NETWORK'}] Target: ${baseUrl}/adaptive-difficulty`);
  console.log('[Payload]:', JSON.stringify(payload, null, 2));
  console.log('====================================================');

  if (useMock) {
    // Artificial 350ms delay to simulate network & allow gentle transition UI to render
    await new Promise((resolve) => setTimeout(resolve, 350));

    const response = calculateMockDifficulty(payload);

    console.log('[API Mock Response]:', JSON.stringify(response, null, 2));
    console.log('====================================================');

    sessionStore.recordSession(payload, response, true);
    return response;
  }

  // Real backend call
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${baseUrl}/adaptive-difficulty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data: AdaptiveDifficultyResponse = await res.json();

    console.log('[API Live Response]:', JSON.stringify(data, null, 2));
    console.log('====================================================');

    sessionStore.recordSession(payload, data, true);
    return data;
  } catch (error: any) {
    console.error('[API Network Error]:', error.message || error);
    console.warn('[API Fallback] Queuing attempt locally and maintaining current difficulty.');

    // Fallback: Queue attempt offline and keep current difficulty
    sessionStore.addToQueue(payload, error.message || 'Network request failed');

    const fallbackResponse: AdaptiveDifficultyResponse = {
      performance: payload.completed ? 'average' : 'poor',
      next_difficulty: payload.current_difficulty,
    };

    sessionStore.recordSession(payload, fallbackResponse, false);
    return fallbackResponse;
  }
}

/**
 * Retry helper for attempts stored in the local offline queue
 */
export async function retryQueuedAttempt(
  queueId: string,
  payload: AdaptiveDifficultyRequest
): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/adaptive-difficulty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      sessionStore.removeFromQueue(queueId);
      console.log(`[Queue] Successfully synced queued attempt ${queueId}`);
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[Queue] Retry failed for queued attempt ${queueId}:`, err);
    return false;
  }
}
