import EditAchievementCell from 'src/components/Achievement/EditAchievementCell'

type AchievementPageProps = {
  id: number
}

const EditAchievementPage = ({ id }: AchievementPageProps) => {
  return <EditAchievementCell id={id} />
}

export default EditAchievementPage
