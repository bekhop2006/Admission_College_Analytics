import { Navigate } from 'react-router-dom'

/** Legacy admin login URL redirects to the public login page. */
export function AdminLoginRedirect() {
  return <Navigate to="/login?redirect=/admin" replace />
}
