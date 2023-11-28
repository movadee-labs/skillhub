// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage
import { Route, Router, Set } from '@redwoodjs/router';
import ScaffoldLayout from 'src/layouts/ScaffoldLayout';

import { useAuth } from './auth';

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route path="/" page={HomePage} name="home" />
      <Set wrap={ScaffoldLayout} title="Achievements" titleTo="achievements" buttonLabel="New Achievement" buttonTo="newAchievement">
        <Route path="/achievements/new" page={AchievementNewAchievementPage} name="newAchievement" />
        <Route path="/achievements/{id:Int}/edit" page={AchievementEditAchievementPage} name="editAchievement" />
        <Route path="/achievements/{id:Int}" page={AchievementAchievementPage} name="achievement" />
        <Route path="/achievements" page={AchievementAchievementsPage} name="achievements" />
      </Set>
      <Set wrap={ScaffoldLayout} title="Resumes" titleTo="resumes" buttonLabel="New Resume" buttonTo="newResume">
        <Route path="/resumes/new" page={ResumeNewResumePage} name="newResume" />
        <Route path="/resumes/{id:Int}/edit" page={ResumeEditResumePage} name="editResume" />
        <Route path="/resumes/{id:Int}" page={ResumeResumePage} name="resume" />
        <Route path="/resumes" page={ResumeResumesPage} name="resumes" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
