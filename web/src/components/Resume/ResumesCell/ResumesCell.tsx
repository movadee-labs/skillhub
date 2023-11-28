import type { FindResumes } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Resumes from 'src/components/Resume/Resumes'

export const QUERY = gql`
  query FindResumes {
    resumes {
      id
      title
      createdAt
      userId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No resumes yet. '}
      <Link to={routes.newResume()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ resumes }: CellSuccessProps<FindResumes>) => {
  return <Resumes resumes={resumes} />
}
