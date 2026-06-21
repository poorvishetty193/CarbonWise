import { useState, useCallback } from 'react';
import { toErrorMessage } from '../lib/errors';
import { ActivityCategory } from '../types';

interface UseStreamingInsightsReturn {
  text: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  trigger: (activitySummary: Record<ActivityCategory, number>, weeklyBudgetKg: number) => Promise<void>;
}

/**
 * Hook to manage streaming AI insights fetching.
 * 
 * @param uid - The user's Firebase UID
 * @returns {UseStreamingInsightsReturn} Streamed text and status
 * @throws {never} This function does not throw.
 */
export function useStreamingInsights(uid: string): UseStreamingInsightsReturn {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(async (activitySummary: Record<ActivityCategory, number>, weeklyBudgetKg: number) => {
    setIsStreaming(true);
    setIsComplete(false);
    setError(null);
    setText('');

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activitySummary, weeklyBudgetKg, uid }),
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        setText((prev) => prev + decoder.decode(value));
      }
      setIsComplete(true);
    } catch (err: unknown) {
      setError(toErrorMessage(err));
    } finally {
      setIsStreaming(false);
    }
  }, [uid]);

  return {
    text,
    isStreaming,
    isComplete,
    error,
    trigger
  };
}
