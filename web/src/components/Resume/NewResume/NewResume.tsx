import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ResumeForm from 'src/components/Resume/ResumeForm'

import type { CreateResumeInput } from 'types/graphql'

const CREATE_RESUME_MUTATION = gql`
  mutation CreateResumeMutation($input: CreateResumeInput!) {
    createResume(input: $input) {
      id
    }
  }
`

const NewResume = () => {
  const [createResume, { loading, error }] = useMutation(
    CREATE_RESUME_MUTATION,
    {
      onCompleted: () => {
        toast.success('Resume created')
        navigate(routes.resumes())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateResumeInput) => {
    createResume({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Resume</h2>
      </header>
      <div className="rw-segment-main">
        <ResumeForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewResume
