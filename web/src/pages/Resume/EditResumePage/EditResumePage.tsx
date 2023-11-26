import AchievementsCell from 'src/components/Achievement/AchievementsCell';
import NewAchievement from 'src/components/Achievement/NewAchievement/NewAchievement';
import EditResumeCell from 'src/components/Resume/EditResumeCell';

type ResumePageProps = {
  id: number
}

const EditResumePage = ({ id }: ResumePageProps) => {
  return (
    <>
      <EditResumeCell id={id} />
      <AchievementsCell resumeId={id} />
      <NewAchievement resumeId={id} />
    </>
  )
}

export default EditResumePage
