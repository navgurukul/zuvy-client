import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { THEME, CHAPTER_TOPIC_MAP } from '../constants';
import { Card, Badge, inputStyle } from '../ui-primitives';
import { BuilderState, Question, Chapter } from '../types';
import { PoolTopicPicker } from '../components/PoolTopicPicker';

interface StepTopicsBaselineProps {
  a: BuilderState;
  set: (patch: Partial<BuilderState>) => void;
  baselineOptions: Chapter[];
  bankTopics: string[];
  bankQuestions: Question[];
}

export function StepTopicsBaseline({
  a,
  set,
  baselineOptions,
  bankTopics,
  bankQuestions,
}: StepTopicsBaselineProps) {
  const toggleBaseline = (id: number) =>
    set({
      baselineChapterIds: a.baselineChapterIds.includes(id)
        ? a.baselineChapterIds.filter((x: number) => x !== id)
        : [...a.baselineChapterIds, id],
    });

  const totalBaselineQ = baselineOptions
    .filter((c: Chapter) => a.baselineChapterIds.includes(c.id))
    .reduce((s: number, c: Chapter) => s + (c.questionCount || 0), 0);

  const coveredByBaseline = new Set<string>(
    a.baselineChapterIds.flatMap((id: number) => CHAPTER_TOPIC_MAP[id] ?? [])
  );
  const uncoveredTopics = (a.poolTopics as string[]).filter(
    (t) => !coveredByBaseline.has(t)
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        alignItems: 'start',
      }}
    >
      <Card style={{ padding: 22 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
          Baseline signal
        </h4>
        <p style={{ fontSize: 13, color: THEME.textSub, margin: '0 0 16px', lineHeight: 1.5 }}>
          MCQ chapters in this module. Learner performance is used to assign a
          starting level. <strong>No separate baseline test is needed.</strong>
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
            marginBottom: 14,
          }}
        >
          {baselineOptions.length === 0 && (
            <div style={{ fontSize: 13, color: THEME.textTertiary, padding: '12px 0' }}>
              No MCQ chapters found in this module.
            </div>
          )}
          {baselineOptions.map((ch: Chapter) => {
            const sel = a.baselineChapterIds.includes(ch.id);
            const covers = CHAPTER_TOPIC_MAP[ch.id] ?? [];
            return (
              <div
                key={ch.id}
                onClick={() => toggleBaseline(ch.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  border: `2px solid ${sel ? THEME.primary : THEME.border}`,
                  background: sel ? THEME.primaryLight : THEME.card,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all .12s',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${sel ? THEME.primary : THEME.border}`,
                    background: sel ? THEME.primary : THEME.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {sel && <Check size={11} color="#fff" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ch.title}</div>
                  <div style={{ fontSize: 11.5, color: THEME.textTertiary, marginTop: 2 }}>
                    {ch.questionCount || 0} questions
                    {covers.length > 0 && (
                      <span style={{ marginLeft: 6, color: THEME.primaryDark }}>
                        · covers {covers.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <Badge bg={THEME.secondaryLight} color={THEME.secondaryDark}>
                  MCQ
                </Badge>
              </div>
            );
          })}
        </div>

        <div style={{ background: THEME.muted, borderRadius: 8, padding: '12px 14px' }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: THEME.textTertiary,
              letterSpacing: '.06em',
              marginBottom: 8,
            }}
          >
            HOW LEVEL IS ASSIGNED
          </div>
          {[
            ['90–100%', 'Level A+'],
            ['76–89%', 'Level A'],
            ['61–75%', 'Level B'],
            ['46–60%', 'Level C (default)'],
            ['31–45%', 'Level D'],
            ['0–30%', 'Level E'],
          ].map(([range, level]) => (
            <div
              key={range}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: THEME.textSub,
                padding: '2px 0',
              }}
            >
              <span>{range} correct across baseline MCQs</span>
              <strong>{level}</strong>
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: THEME.textTertiary, marginTop: 7 }}>
            Learners with no MCQ attempts start at Level C.
          </div>
        </div>

        {totalBaselineQ > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: THEME.primaryDark }}>
            {totalBaselineQ} questions across {a.baselineChapterIds.length} chapter
            {a.baselineChapterIds.length !== 1 ? 's' : ''} will feed the level signal
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
        <Card style={{ padding: 22 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Pool topics</h4>
          <p style={{ fontSize: 13, color: THEME.textSub, margin: '0 0 14px', lineHeight: 1.5 }}>
            Choose the topics to draw questions from. Questions are assembled per
            student based on their level.
          </p>
          <PoolTopicPicker
            a={a}
            set={set}
            bankTopics={bankTopics}
            bankQuestions={bankQuestions}
          />
          {a.poolTopics.length === 0 && (
            <div style={{ marginTop: 14, fontSize: 13, color: THEME.textTertiary }}>
              Select at least one topic to continue.
            </div>
          )}
        </Card>

        {uncoveredTopics.length > 0 && (
          <div
            style={{
              background: THEME.warningLight,
              border: `1px solid ${THEME.warning}`,
              borderRadius: 8,
              padding: '11px 14px',
              fontSize: 13,
              color: THEME.warningDark,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <strong>Baseline–topic mismatch:</strong> {uncoveredTopics.join(', ')}{' '}
              {uncoveredTopics.length === 1 ? 'is' : 'are'} in the pool but no selected
              baseline chapter covers {uncoveredTopics.length === 1 ? 'it' : 'them'}. Learner
              level won&apos;t reflect{' '}
              {uncoveredTopics.length === 1 ? 'this topic' : 'these topics'}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
