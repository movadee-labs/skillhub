import { db } from 'src/lib/db';

import type {
  QueryResolvers,
  MutationResolvers,
  AchievementRelationResolvers,
} from 'types/graphql'

export const achievements: QueryResolvers['achievements'] = ({ resumeId }) => {
  return db.achievement.findMany({ where: { resumeId } })
}

export const achievement: QueryResolvers['achievement'] = ({ id }) => {
  return db.achievement.findUnique({
    where: { id },
  })
}

export const createAchievement: MutationResolvers['createAchievement'] = ({
  input,
}) => {
  return db.achievement.create({
    data: input,
  })
}

export const updateAchievement: MutationResolvers['updateAchievement'] = ({
  id,
  input,
}) => {
  return db.achievement.update({
    data: input,
    where: { id },
  })
}

export const deleteAchievement: MutationResolvers['deleteAchievement'] = ({
  id,
}) => {
  return db.achievement.delete({
    where: { id },
  })
}

export const Achievement: AchievementRelationResolvers = {
  resume: (_obj, { root }) => {
    return db.achievement.findUnique({ where: { id: root?.id } }).resume()
  },
}
