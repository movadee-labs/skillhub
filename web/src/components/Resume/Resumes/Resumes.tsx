import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Resume/ResumesCell'
import { timeTag, truncate } from 'src/lib/formatters'

import type { DeleteResumeMutationVariables, FindResumes } from 'types/graphql'

const DELETE_RESUME_MUTATION = gql`
  mutation DeleteResumeMutation($id: Int!) {
    deleteResume(id: $id) {
      id
    }
  }
`

const ResumesList = ({ resumes }: FindResumes) => {
  const [deleteResume] = useMutation(DELETE_RESUME_MUTATION, {
    onCompleted: () => {
      toast.success('Resume deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteResumeMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete resume ' + id + '?')) {
      deleteResume({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Created at</th>
            <th>User id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <tr key={resume.id}>
              <td>{truncate(resume.id)}</td>
              <td>{truncate(resume.title)}</td>
              <td>{timeTag(resume.createdAt)}</td>
              <td>{truncate(resume.userId)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.resume({ id: resume.id })}
                    title={'Show resume ' + resume.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editResume({ id: resume.id })}
                    title={'Edit resume ' + resume.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete resume ' + resume.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(resume.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResumesList
