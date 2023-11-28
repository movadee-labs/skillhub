import type { Prisma, Resume } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.ResumeCreateArgs>({
  resume: {
    one: {
      data: { title: 'String', user: { create: { email: 'String7681221' } } },
    },
    two: {
      data: { title: 'String', user: { create: { email: 'String2749291' } } },
    },
  },
})

export type StandardScenario = ScenarioData<Resume, 'resume'>
