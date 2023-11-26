import AchievementCell from 'src/components/Achievement/AchievementCell'

type AchievementPageProps = {
  id: number
}

const AchievementPage = ({ id }: AchievementPageProps) => {
  return <AchievementCell id={id} />
}

export default AchievementPage
