import { Link, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';
import { QUERY } from 'src/components/Achievement/AchievementsCell';
import { timeTag, truncate } from 'src/lib/formatters';

import type {
  DeleteAchievementMutationVariables,
  FindAchievements,
} from 'types/graphql'

const DELETE_ACHIEVEMENT_MUTATION = gql`
  mutation DeleteAchievementMutation($id: Int!) {
    deleteAchievement(id: $id) {
      id
    }
  }
`

const AchievementsList = ({ achievements }: FindAchievements) => {
  const [deleteAchievement] = useMutation(DELETE_ACHIEVEMENT_MUTATION, {
    onCompleted: () => {
      toast.success('Achievement deleted')
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

  const onDeleteClick = (id: DeleteAchievementMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete achievement ' + id + '?')) {
      deleteAchievement({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Body</th>
            <th>Created at</th>
            <th>Resume id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((achievement) => (
            <tr key={achievement.id}>
              <td>{truncate(achievement.id)}</td>
              <td>{truncate(achievement.body)}</td>
              <td>{timeTag(achievement.createdAt)}</td>
              <td>{truncate(achievement.resumeId)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.achievement({ id: achievement.id })}
                    title={'Show achievement ' + achievement.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editAchievement({ id: achievement.id })}
                    title={'Edit achievement ' + achievement.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete achievement ' + achievement.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(achievement.id)}
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

export default AchievementsList
