import { Link } from 'react-router'
import { paths } from './navigation'

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={paths.dashboard}>Go to Dashboard</Link>
    </>
  )
}
