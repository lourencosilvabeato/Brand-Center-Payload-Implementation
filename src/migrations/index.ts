import * as migration_20260512_180323 from './20260512_180323';

export const migrations = [
  {
    up: migration_20260512_180323.up,
    down: migration_20260512_180323.down,
    name: '20260512_180323',
  },
];
