import * as migration_20260513_101302 from './20260513_101302';
import * as migration_20260520_145510 from './20260520_145510';
import * as migration_20260602_105550 from './20260602_105550';

export const migrations = [
  {
    up: migration_20260513_101302.up,
    down: migration_20260513_101302.down,
    name: '20260513_101302',
  },
  {
    up: migration_20260520_145510.up,
    down: migration_20260520_145510.down,
    name: '20260520_145510',
  },
  {
    up: migration_20260602_105550.up,
    down: migration_20260602_105550.down,
    name: '20260602_105550'
  },
];
