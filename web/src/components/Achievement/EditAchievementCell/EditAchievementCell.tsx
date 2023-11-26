import { navigate, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';
import AchievementForm from 'src/components/Achievement/AchievementForm';

import type { EditAchievementById, UpdateAchievementInput } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
export const QUERY = gql`
  query EditAchievementById($id: Int!) {
    achievement: achievement(id: $id) {
      id
      body
      createdAt
      resumeId
    }
  }
`
const UPDATE_ACHIEVEMENT_MUTATION = gql`
  mutation UpdateAchievementMutation(
    $id: Int!
    $input: UpdateAchievementInput!
  ) {
    updateAchievement(id: $id, input: $input) {
      id
      body
      createdAt
      resumeId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  achievement,
}: CellSuccessProps<EditAchievementById>) => {
  const [updateAchievement, { loading, error }] = useMutation(
    UPDATE_ACHIEVEMENT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Achievement updated')
        navigate(routes.achievements())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateAchievementInput,
    id: EditAchievementById['achievement']['id']
  ) => {
    updateAchievement({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Achievement {achievement?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <AchievementForm
          achievement={achievement}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
