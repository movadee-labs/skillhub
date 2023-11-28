import type { Prisma, Achievement } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.AchievementCreateArgs>({
  achievement: {
    one: { data: { body: 'String' } },
    two: { data: { body: 'String' } },
  },
})

export type StandardScenario = ScenarioData<Achievement, 'achievement'>
