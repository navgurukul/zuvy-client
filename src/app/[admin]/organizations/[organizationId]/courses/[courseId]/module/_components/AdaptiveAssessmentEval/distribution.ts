import { BANDS, LEVELS } from './constants';
import { Band, BandCounts } from './types';

/** One question set is assembled per level (E → A+). */
export const SET_COUNT = LEVELS.length;

/** Difficulty mix used when proposing a topic's per-set split (Level C mix). */
const PROPOSED_BAND_MIX = [0.3, 0.5, 0.2];

export const emptyCounts = (): BandCounts => ({ easy: 0, medium: 0, hard: 0 });

export const sumCounts = (c?: BandCounts) =>
  c ? c.easy + c.medium + c.hard : 0;

export const distributionKeyFor = (perSet: number, topics: string[]) =>
  `${perSet}|${topics.join('\u0000')}`;

/**
 * Split a cell's per-set count into questions shared by every set ("common")
 * and questions each set gets on its own ("unique"). One question per cell
 * is shared when the cell has at least two, so sets overlap a little but
 * stay mostly distinct.
 */
export const splitCell = (perSet: number) => {
  const common = perSet >= 2 ? 1 : 0;
  const unique = perSet - common;
  return { common, unique, need: common + SET_COUNT * unique };
};

/** Integer split of `total` proportional to `weights` (largest remainder). */
export function allocate(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const sum = weights.reduce((s, w) => s + w, 0);
  const w = sum > 0 ? weights : weights.map(() => 1);
  const wSum = sum > 0 ? sum : weights.length;
  const exact = w.map((x) => (total * x) / wSum);
  const out = exact.map(Math.floor);
  let left = total - out.reduce((s, n) => s + n, 0);
  const order = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) {
    out[order[k].i]++;
  }
  return out;
}

/**
 * Propose questions per set for each topic: half of the set is split evenly
 * across topics, the other half by how many questions each topic already has.
 * Each topic's share is then split across difficulties by PROPOSED_BAND_MIX.
 */
export function proposeDistribution(
  topics: string[],
  available: Record<string, BandCounts | undefined>,
  perSet: number
): Record<string, BandCounts> {
  const n = topics.length;
  if (n === 0) return {};
  const totals = topics.map((t) => sumCounts(available[t]));
  const allAvail = totals.reduce((s, x) => s + x, 0);
  const weights = totals.map(
    (x) => 0.5 / n + 0.5 * (allAvail > 0 ? x / allAvail : 1 / n)
  );
  const perTopic = allocate(perSet, weights);

  const out: Record<string, BandCounts> = {};
  topics.forEach((t, i) => {
    const [easy, medium, hard] = allocate(perTopic[i], PROPOSED_BAND_MIX);
    out[t] = { easy, medium, hard };
  });
  return out;
}

export interface CellShortage {
  topic: string;
  band: Band;
  need: number;
  has: number;
  short: number;
}

export function summarizeDistribution(
  topics: string[],
  distribution: Record<string, BandCounts>,
  available: Record<string, BandCounts | undefined>
) {
  let perSet = 0;
  let common = 0;
  let unique = 0;
  let poolNeed = 0;
  const shortages: CellShortage[] = [];
  const shortByTopic: Record<string, number> = {};

  topics.forEach((topic) => {
    shortByTopic[topic] = 0;
    BANDS.forEach((band) => {
      const n = distribution[topic]?.[band] ?? 0;
      const cell = splitCell(n);
      const has = available[topic]?.[band] ?? 0;
      perSet += n;
      common += cell.common;
      unique += cell.unique;
      poolNeed += cell.need;
      if (cell.need > has) {
        const short = cell.need - has;
        shortages.push({ topic, band, need: cell.need, has, short });
        shortByTopic[topic] += short;
      }
    });
  });

  const totalShort = shortages.reduce((s, x) => s + x.short, 0);
  return { perSet, common, unique, poolNeed, shortages, shortByTopic, totalShort };
}

export type DistributionSummary = ReturnType<typeof summarizeDistribution>;
