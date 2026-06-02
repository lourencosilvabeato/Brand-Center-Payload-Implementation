import * as migration_20260512_180323 from './20260512_180323';
import * as migration_20260602_105550 from './20260602_105550';

export const migrations = [
  {
    up: migration_20260512_180323.up,
    down: migration_20260512_180323.down,
    name: '20260512_180323',
  },
  {
    up: migration_20260602_105550.up,
    down: migration_20260602_105550.down,
    name: '20260602_105550',
  },
];
