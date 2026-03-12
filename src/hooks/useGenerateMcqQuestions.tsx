import { useSearchParams } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUser } from '@/store/store';

interface QuestionsReadyPayload {
  count: number;
  questionIds: number[];
}

interface GenerateMcqPayload {
  domainName: string;
  topicNames: string[];
  numberOfQuestions: number;
  learningObjectives: string;
  targetAudience?: string;
  focusAreas?: string;
  bloomsLevel: string;
  questionStyle: string;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionCounts?: {
    easy: number;
    medium: number;
    hard: number;
  };
  topics: {
    [key: string]: number;
  };
  topicConfigurations?: Array<{
    topicName: string;
    topicDescription: string;
    totalQuestions: number;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    questionCounts: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
  levelId: null;
}

interface UseGenerateMcqQuestionsReturn {
  generateQuestions: (payload: GenerateMcqPayload) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  organizationId: number;
  isSocketConnected: boolean;
  questionsReady: QuestionsReadyPayload | null;
}

export const useGenerateMcqQuestions = (organizationId: number): UseGenerateMcqQuestionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [questionsReady, setQuestionsReady] = useState<QuestionsReadyPayload | null>(null);
  const accessToken = localStorage.getItem('access_token') || '';
  const { user } = getUser();
  const socketRef = useRef<Socket | null>(null);
  const apiUrl = 'http://localhost:5000';

  // Set up Socket.IO connection with JWT authentication
  useEffect(() => {
    if (!accessToken) {
      console.warn('No access token available for Socket.IO connection');
      return;
    }

    console.log('Connecting to Socket.IO server:', apiUrl);
    console.log('User ID:', user.id);

    // Connect to the API URL with JWT in auth
    const socket = io(apiUrl, {
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✓ Socket.IO connected successfully');
      console.log('Socket ID:', socket.id);
      setIsSocketConnected(true);
      setError(null);
    });
    
    socket.on('questions:ready', (data: QuestionsReadyPayload) => {
      console.log('🎉 Questions ready!', data);
      console.log(`Indexed ${data.count} questions`);
      console.log('Question IDs:', data.questionIds);
      
      // Update state with the ready questions
      setQuestionsReady(data);
      setIsLoading(false);
    });
    // Connection lost
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsSocketConnected(false);
    });

    // Listen for the questions:ready event from backend

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError(`Socket connection failed: ${err.message}`);
      setIsSocketConnected(false);
    });

    // Handle reconnection attempts
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}...`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✓ Reconnected after ${attemptNumber} attempts`);
      setIsSocketConnected(true);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      console.error('Reconnection error:', err.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      setError('Socket reconnection failed');
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting Socket.IO...');
      socket.disconnect();
    };
  }, [accessToken, apiUrl, user.id]);

  const generateQuestions = async (payload: GenerateMcqPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/questions/generate?orgId=${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateQuestions,
    isLoading,
    error,
    organizationId,
    isSocketConnected,
    questionsReady,
  };
};
