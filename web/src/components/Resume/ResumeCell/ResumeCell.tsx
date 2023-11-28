import type { FindResumeById } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Resume from 'src/components/Resume/Resume'

export const QUERY = gql`
  query FindResumeById($id: Int!) {
    resume: resume(id: $id) {
      id
      title
      createdAt
      userId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Resume not found</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ resume }: CellSuccessProps<FindResumeById>) => {
  return <Resume resume={resume} />
}
