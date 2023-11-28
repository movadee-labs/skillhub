import { MetaTags } from '@redwoodjs/web';
import { useAuth } from 'src/auth';

const HomePage = () => {
  const { isAuthenticated, signUp } = useAuth()
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      <p>{JSON.stringify({ isAuthenticated })}</p>
      <button onClick={signUp}>sign up</button>
    </>
  )
}
export default HomePage
