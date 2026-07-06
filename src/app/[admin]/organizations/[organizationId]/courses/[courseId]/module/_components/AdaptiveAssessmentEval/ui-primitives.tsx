import React from 'react';
import { THEME, DIFF_BG, DIFF_COLOR, DIFF_LABEL } from './constants';

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: THEME.card,
      borderRadius: 8,
      border: `1px solid ${THEME.border}`,
      boxShadow: THEME.shadowSoft,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Badge = ({
  children,
  bg,
  color,
  style,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
  style?: React.CSSProperties;
}) => (
  <span
    style={{
      background: bg,
      color,
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap' as const,
      ...style,
    }}
  >
    {children}
  </span>
);

export const DiffBadge = ({ d }: { d: string }) => (
  <Badge bg={DIFF_BG[d]} color={DIFF_COLOR[d]}>
    {DIFF_LABEL[d]}
  </Badge>
);

export function Btn({
  children,
  variant = 'default',
  size = 'md',
  disabled,
  onClick,
  style,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    fontWeight: 600,
    borderRadius: 8,
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    transition: 'all .15s',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    padding:
      size === 'sm'
        ? '6px 12px'
        : size === 'lg'
          ? '13px 26px'
          : '9px 16px',
  };

  const variants = {
    default: { background: THEME.primary, color: '#fff' },
    secondary: { background: THEME.secondary, color: '#fff' },
    outline: { background: THEME.card, color: THEME.text, borderColor: THEME.border },
    ghost: { background: 'transparent', color: THEME.primary, border: 'none' },
    danger: { background: 'transparent', color: THEME.danger, border: 'none' },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 20 }}>
    <label
      style={{
        display: 'block',
        fontWeight: 600,
        fontSize: 14,
        color: THEME.text,
        marginBottom: 5,
      }}
    >
      {label}
      {required && <span style={{ color: THEME.danger }}> *</span>}
    </label>
    {children}
    {hint && (
      <div style={{ fontSize: 12, color: THEME.textTertiary, marginTop: 4 }}>
        {hint}
      </div>
    )}
  </div>
);

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: `1px solid ${THEME.border}`,
  fontSize: 14,
  color: THEME.text,
  background: THEME.card,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
};
