import type {
  QueryResolvers,
  MutationResolvers,
  ResumeRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const resumes: QueryResolvers['resumes'] = () => {
  return db.resume.findMany()
}

export const resume: QueryResolvers['resume'] = ({ id }) => {
  return db.resume.findUnique({
    where: { id },
  })
}

export const createResume: MutationResolvers['createResume'] = ({ input }) => {
  return db.resume.create({
    data: input,
  })
}

export const updateResume: MutationResolvers['updateResume'] = ({
  id,
  input,
}) => {
  return db.resume.update({
    data: input,
    where: { id },
  })
}

export const deleteResume: MutationResolvers['deleteResume'] = ({ id }) => {
  return db.resume.delete({
    where: { id },
  })
}

export const Resume: ResumeRelationResolvers = {
  user: (_obj, { root }) => {
    return db.resume.findUnique({ where: { id: root?.id } }).user()
  },
  achievements: (_obj, { root }) => {
    return db.resume.findUnique({ where: { id: root?.id } }).achievements()
  },
}
