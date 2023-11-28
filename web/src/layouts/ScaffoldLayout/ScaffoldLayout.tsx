import { Link, navigate, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast, Toaster } from '@redwoodjs/web/toast';

import type { CreateResumeInput } from 'types/graphql'

const CREATE_RESUME_MUTATION = gql`
  mutation CreateResumeMutation($input: CreateResumeInput!) {
    createResume(input: $input) {
      id
    }
  }
`

type LayoutProps = {
  title: string
  titleTo: string
  buttonLabel: string
  buttonTo: string
  children: React.ReactNode
}

const ScaffoldLayout = ({
  title,
  titleTo,
  buttonLabel,
  buttonTo,
  children,
}: LayoutProps) => {
  const [createResume, { loading, error }] = useMutation(
    CREATE_RESUME_MUTATION,
    {
      onCompleted: (data) => {
        const {
          createResume: { id },
        } = data
        navigate(routes.editResume({ id }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onClick = () => {
    const input: CreateResumeInput = {
      title: '',
      userId: 3,
    }
    createResume({ variables: { input } })
  }

  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link to={routes[titleTo]()} className="rw-link">
            {title}
          </Link>
        </h1>
        {/* <Link to={routes[buttonTo]()} className="rw-button rw-button-green">
          <div className="rw-button-icon">+</div> {buttonLabel}
        </Link> */}
        <button onClick={onClick} className="rw-button rw-button-green">
          <div className="rw-button-icon">+</div> {buttonLabel}
        </button>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default ScaffoldLayout
