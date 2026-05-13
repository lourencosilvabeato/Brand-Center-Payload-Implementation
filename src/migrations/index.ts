import * as migration_20260513_101302 from './20260513_101302'

export const migrations = [
  {
    up: migration_20260513_101302.up,
    down: migration_20260513_101302.down,
    name: '20260513_101302',
  },
]
