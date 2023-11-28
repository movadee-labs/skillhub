import { navigate, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';

import type { EditResumeById, UpdateResumeInput } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
export const QUERY = gql`
  query EditResumeById($id: Int!) {
    resume: resume(id: $id) {
      id
      title
      createdAt
      userId
    }
  }
`
const UPDATE_RESUME_MUTATION = gql`
  mutation UpdateResumeMutation($id: Int!, $input: UpdateResumeInput!) {
    updateResume(id: $id, input: $input) {
      id
      title
      createdAt
      userId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ resume }: CellSuccessProps<EditResumeById>) => {
  const [updateResume, { loading, error }] = useMutation(
    UPDATE_RESUME_MUTATION,
    {
      onCompleted: () => {
        toast.success('Resume updated')
        navigate(routes.resumes())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateResumeInput,
    id: EditResumeById['resume']['id']
  ) => {
    updateResume({ variables: { id, input } })
  }

  return (
    // <div className="rw-segment">
    //   <header className="rw-segment-header">
    //     <h2 className="rw-heading rw-heading-secondary">
    //       Edit Resume {resume?.id}
    //     </h2>
    //   </header>
    //   <div className="rw-segment-main">
    //     <ResumeForm
    //       resume={resume}
    //       onSave={onSave}
    //       error={error}
    //       loading={loading}
    //     />
    //   </div>
    // </div>
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Resume {resume?.id}</h2>
      </header>
    </div>
  )
}
