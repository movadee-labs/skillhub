import type { Prisma, User } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: { data: { email: 'String3602997' } },
    two: { data: { email: 'String5363752' } },
  },
})

export type StandardScenario = ScenarioData<User, 'user'>
