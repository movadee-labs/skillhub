export const schema = gql`
  type Resume {
    id: Int!
    title: String!
    createdAt: DateTime!
    user: User!
    userId: Int!
    achievements: [Achievement]!
  }

  type Query {
    resumes: [Resume!]! @requireAuth
    resume(id: Int!): Resume @requireAuth
  }

  input CreateResumeInput {
    title: String!
    userId: Int!
  }

  input UpdateResumeInput {
    title: String
    userId: Int
  }

  type Mutation {
    createResume(input: CreateResumeInput!): Resume! @requireAuth
    updateResume(id: Int!, input: UpdateResumeInput!): Resume! @requireAuth
    deleteResume(id: Int!): Resume! @requireAuth
  }
`
