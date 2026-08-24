import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Loader2, X } from 'lucide-react';
import { THEME, DIFF_LABEL } from '../constants';
import { Btn, DiffBadge, Badge } from '../ui-primitives';
import { Question } from '../types';
import { useGetReplacementQuestions } from '@/hooks/useGetReplacementQuestionEval';
import { useReplaceQuestion } from '@/hooks/usePutReplacementQuestion';

interface ReplaceModalProps {
  item: Question;
  pool: Question[];
  setPool: React.Dispatch<React.SetStateAction<Question[]>>;
  onClose: () => void;
  showToast: (msg: string) => void;
  bankQuestions: Question[];
  levelCode?: string;
  onReplaced?: (levelCode?: string) => Promise<void> | void;
}

export function ReplaceModal({
  item,
  pool,
  setPool,
  onClose,
  showToast,
  bankQuestions,
  levelCode,
  onReplaced,
}: ReplaceModalProps) {
  const { getReplacementQuestions, isFetching, fetchError, replacementQuestions } =
    useGetReplacementQuestions();
  const { replaceQuestion, isReplacing, replaceError } = useReplaceQuestion();

  useEffect(() => {
    if (!item.questionSetId) return;

    getReplacementQuestions({
      topicName: item.topic,
      difficulty: item.difficulty as 'easy' | 'medium' | 'hard',
      questionSetId: item.questionSetId,
      excludeId: Number(item.id),
    });
  }, [getReplacementQuestions, item.id, item.questionSetId, item.topic, item.difficulty]);

  const apiCandidates: Question[] = useMemo(
    () =>
      (replacementQuestions?.data || []).map((q) => ({
        id: String(q.id),
        qtype: item.qtype,
        topic: q.topicName || item.topic,
        difficulty: q.difficulty || item.difficulty,
        quarantined: false,
        text: q.question,
        source: 'ai' as const,
        validated: true,
        options: q.options ? Object.values(q.options) : [],
        correctIndex: Number(q.correctOption) > 0 ? Number(q.correctOption) - 1 : 0,
        explanation: 'Replacement question fetched from API',
      })),
    [item.difficulty, item.qtype, item.topic, replacementQuestions?.data]
  );

  const bankCandidates = bankQuestions.filter(
    (q: Question) =>
      q.qtype === item.qtype &&
      q.topic === item.topic &&
      q.difficulty === item.difficulty &&
      q.id !== item.id &&
      !pool.some((p: Question) => p.id === q.id)
  );

  const candidates = useMemo(() => {
    if (apiCandidates.length > 0) {
      return apiCandidates;
    }

    return bankCandidates.filter(
      (q: Question) =>
        q.text !== item.text &&
        !pool.some((p: Question) => p.id === q.id || p.text === q.text)
    );
  }, [apiCandidates, bankCandidates, item.text, pool]);

  const doReplace = async (replacement: Question) => {
    if (!item.questionSetId) {
      showToast('Question set id is missing. Unable to replace this question.');
      return;
    }

    const response = await replaceQuestion(item.id, {
      questionSetId: item.questionSetId,
      replacementQuestionId: Number(replacement.id),
    });

    if (!response || response.status < 200 || response.status >= 300) {
      showToast(replaceError || response?.data.message || 'Failed to replace question');
      return;
    }

    setPool(pool.map((q) => (q.id === item.id ? { ...replacement, id: item.id } : q)));
    await onReplaced?.(levelCode);
    showToast('Question replaced');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(33,48,43,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: THEME.card,
          borderRadius: 10,
          boxShadow: THEME.shadowStrong,
          width: '100%',
          maxWidth: 600,
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column' as const,
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Replace question</div>
            <div style={{ fontSize: 13, color: THEME.textSub }}>
              {item.topic} · {DIFF_LABEL[item.difficulty]}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: THEME.textTertiary,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 20 }}>
          <div
            style={{
              background: THEME.muted,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 18,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {item.text}
          </div>
          {isFetching && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {!isFetching && fetchError && (
            <div style={{ marginBottom: 10, fontSize: 13, color: THEME.danger }}>
              {fetchError}
            </div>
          )}
          {!isFetching && candidates.length === 0 && (
            <div style={{ marginBottom: 10, fontSize: 13, color: THEME.textSub }}>
              No replacement questions found for this topic and difficulty.
            </div>
          )}
          {candidates.map((c: Question, index: number) => (
            <div
              key={`${c.id}-${index}`}
              style={{
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                padding: '11px 14px',
                marginBottom: 8,
                display: 'flex',
                gap: 12,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 5 }}>
                  {c.text}
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <DiffBadge d={c.difficulty} />
                  <Badge bg={THEME.infoLight} color={THEME.info}>
                    {apiCandidates.length > 0 ? 'API' : 'Validated'}
                  </Badge>
                </div>
              </div>
              <Btn size="sm" disabled={isReplacing} onClick={() => doReplace(c)}>
                {isReplacing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} Use this
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
