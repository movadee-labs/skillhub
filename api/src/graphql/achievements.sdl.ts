export const schema = gql`
  type Achievement {
    id: Int!
    body: String!
    createdAt: DateTime!
    resume: Resume
    resumeId: Int
  }

  type Query {
    achievements(resumeId: Int!): [Achievement!]! @requireAuth
    achievement(id: Int!): Achievement @requireAuth
  }

  input CreateAchievementInput {
    body: String!
    resumeId: Int
  }

  input UpdateAchievementInput {
    body: String
    resumeId: Int
  }

  type Mutation {
    createAchievement(input: CreateAchievementInput!): Achievement! @requireAuth
    updateAchievement(id: Int!, input: UpdateAchievementInput!): Achievement!
      @requireAuth
    deleteAchievement(id: Int!): Achievement! @requireAuth
  }
`
