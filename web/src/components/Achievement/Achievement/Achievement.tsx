import { Link, navigate, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';
import { timeTag } from 'src/lib/formatters';

import type {
  DeleteAchievementMutationVariables,
  FindAchievementById,
} from 'types/graphql'

const DELETE_ACHIEVEMENT_MUTATION = gql`
  mutation DeleteAchievementMutation($id: Int!) {
    deleteAchievement(id: $id) {
      id
    }
  }
`

interface Props {
  achievement: NonNullable<FindAchievementById['achievement']>
}

const Achievement = ({ achievement }: Props) => {
  const [deleteAchievement] = useMutation(DELETE_ACHIEVEMENT_MUTATION, {
    onCompleted: () => {
      toast.success('Achievement deleted')
      navigate(routes.achievements())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteAchievementMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete achievement ' + id + '?')) {
      deleteAchievement({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Achievement {achievement.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{achievement.id}</td>
            </tr>
            <tr>
              <th>Body</th>
              <td>{achievement.body}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(achievement.createdAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editAchievement({ id: achievement.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(achievement.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Achievement
