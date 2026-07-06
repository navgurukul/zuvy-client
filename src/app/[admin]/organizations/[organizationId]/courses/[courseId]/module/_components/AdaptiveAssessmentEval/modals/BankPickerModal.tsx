import React from 'react';
import { X } from 'lucide-react';
import { THEME, DIFF_LABEL } from '../constants';
import { Btn, DiffBadge, Badge } from '../ui-primitives';
import { Question } from '../types';

interface BankPickerModalProps {
  topic: string;
  band: string;
  pool: Question[];
  setPool: (pool: Question[]) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  bankQuestions: Question[];
}

export function BankPickerModal({
  topic,
  band,
  pool,
  setPool,
  onClose,
  showToast,
  bankQuestions,
}: BankPickerModalProps) {
  const candidates = bankQuestions.filter(
    (q: Question) =>
      q.validated &&
      q.qtype === 'mcq' &&
      q.topic === topic &&
      q.difficulty === band &&
      !pool.some((p: Question) => p.id === q.id)
  );
  const pendingInBank = bankQuestions.filter(
    (q: Question) =>
      !q.validated &&
      q.source === 'ai' &&
      q.topic === topic &&
      q.difficulty === band
  ).length;

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
          maxWidth: 640,
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
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            Pick from bank — {topic} · {DIFF_LABEL[band]}
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
          {pendingInBank > 0 && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 7,
                padding: '8px 12px',
                marginBottom: 14,
                fontSize: 12.5,
                color: '#92400E',
              }}
            >
              {pendingInBank} AI-drafted question{pendingInBank !== 1 ? 's' : ''} pending SME
              approval in the Question Bank.
            </div>
          )}
          {candidates.length === 0 ? (
            <div
              style={{
                textAlign: 'center' as const,
                color: THEME.textTertiary,
                padding: 26,
                fontSize: 13.5,
              }}
            >
              No validated bank questions available.
              {pendingInBank > 0
                ? ' Approve pending questions in the Question Bank first.'
                : ''}
            </div>
          ) : (
            candidates.map((c: Question) => (
              <div
                key={c.id}
                style={{
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 9,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 5 }}>
                    {c.text}
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <DiffBadge d={c.difficulty} />
                    <Badge bg={THEME.infoLight} color={THEME.info}>
                      Validated
                    </Badge>
                  </div>
                </div>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPool((p: Question[]) => [...p, c]);
                    showToast('Added to pool');
                  }}
                >
                  Add
                </Btn>
              </div>
            ))
          )}
          {candidates.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <Btn
                onClick={() => {
                  setPool((p: Question[]) => [...p, ...candidates]);
                  onClose();
                  showToast(`Added all ${candidates.length} from bank`);
                }}
              >
                Add all {candidates.length}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
