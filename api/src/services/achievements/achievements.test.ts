import type { Achievement } from '@prisma/client'

import {
  achievements,
  achievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from './achievements'
import type { StandardScenario } from './achievements.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('achievements', () => {
  scenario('returns all achievements', async (scenario: StandardScenario) => {
    const result = await achievements()

    expect(result.length).toEqual(Object.keys(scenario.achievement).length)
  })

  scenario(
    'returns a single achievement',
    async (scenario: StandardScenario) => {
      const result = await achievement({ id: scenario.achievement.one.id })

      expect(result).toEqual(scenario.achievement.one)
    }
  )

  scenario('creates a achievement', async () => {
    const result = await createAchievement({
      input: { body: 'String' },
    })

    expect(result.body).toEqual('String')
  })

  scenario('updates a achievement', async (scenario: StandardScenario) => {
    const original = (await achievement({
      id: scenario.achievement.one.id,
    })) as Achievement
    const result = await updateAchievement({
      id: original.id,
      input: { body: 'String2' },
    })

    expect(result.body).toEqual('String2')
  })

  scenario('deletes a achievement', async (scenario: StandardScenario) => {
    const original = (await deleteAchievement({
      id: scenario.achievement.one.id,
    })) as Achievement
    const result = await achievement({ id: original.id })

    expect(result).toEqual(null)
  })
})
