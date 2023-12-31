import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';
import AchievementForm from 'src/components/Achievement/AchievementForm';

import type { CreateAchievementInput } from 'types/graphql'

const CREATE_ACHIEVEMENT_MUTATION = gql`
  mutation CreateAchievementMutation($input: CreateAchievementInput!) {
    createAchievement(input: $input) {
      id
    }
  }
`

const NewAchievement = ({ resumeId }) => {
  const [createAchievement, { loading, error }] = useMutation(
    CREATE_ACHIEVEMENT_MUTATION,
    {
      onCompleted: () => {
        toast.success('Achievement created')
        // navigate(routes.achievements())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateAchievementInput) => {
    createAchievement({ variables: { input: { resumeId, ...input } } })
  }

  return (
    // <div className="rw-segment">
    //   <header className="rw-segment-header">
    //     <h2 className="rw-heading rw-heading-secondary">New Achievement</h2>
    //   </header>
    //   <div className="rw-segment-main">
    //     <AchievementForm onSave={onSave} loading={loading} error={error} />
    //   </div>
    // </div>
    <AchievementForm onSave={onSave} loading={loading} error={error} />
  )
}

export default NewAchievement
