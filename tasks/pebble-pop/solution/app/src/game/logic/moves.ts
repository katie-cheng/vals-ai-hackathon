export interface MoveCounter {
  limit: number;
  used: number;
}

export const movesLeft = (m: MoveCounter) => Math.max(0, m.limit - m.used);
export const consumeMove = (m: MoveCounter): MoveCounter => ({ ...m, used: m.used + 1 });
export const outOfMoves = (m: MoveCounter) => movesLeft(m) === 0;
