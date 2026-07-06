import React, { useState } from 'react';
import { RefreshCw, Loader2, X } from 'lucide-react';
import { THEME, DIFF_LABEL } from '../constants';
import { Btn, DiffBadge, Badge } from '../ui-primitives';
import { pickDemoQuestion } from '../helpers';
import { Question } from '../types';

interface ReplaceModalProps {
  item: Question;
  pool: Question[];
  setPool: (pool: Question[]) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  bankQuestions: Question[];
}

export function ReplaceModal({
  item,
  pool,
  setPool,
  onClose,
  showToast,
  bankQuestions,
}: ReplaceModalProps) {
  const [genning, setGenning] = useState(false);
  const candidates = bankQuestions.filter(
    (q: Question) =>
      q.qtype === item.qtype &&
      q.topic === item.topic &&
      q.difficulty === item.difficulty &&
      q.id !== item.id &&
      !pool.some((p: Question) => p.id === q.id)
  );

  const doReplace = (replacement: Question) => {
    setPool((p: Question[]) =>
      p.map((q) => (q.id === item.id ? { ...replacement, id: item.id } : q))
    );
    showToast('Question replaced');
    onClose();
  };

  const generateReplacement = () => {
    setGenning(true);
    setTimeout(() => {
      const q = pickDemoQuestion(item.topic, item.difficulty, [
        item.text,
        ...pool.map((x: Question) => x.text),
      ]);
      if (q) doReplace({ ...q, id: item.id });
      else {
        showToast('No more demo replacements for this cell');
        setGenning(false);
      }
    }, 400);
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
          {candidates.map((c: Question) => (
            <div
              key={c.id}
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
                    Validated
                  </Badge>
                </div>
              </div>
              <Btn size="sm" onClick={() => doReplace(c)}>
                <RefreshCw size={12} /> Use this
              </Btn>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '16px 0', textAlign: 'center' as const }}>
            <Btn variant="secondary" disabled={genning} onClick={generateReplacement}>
              {genning ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating…
                </>
              ) : (
                'Generate a new replacement'
              )}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
