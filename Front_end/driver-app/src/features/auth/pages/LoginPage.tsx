import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useLoginController } from '../controllers/useLoginController.controller'

export function LoginPage() {
  const controller = useLoginController()

  if (controller.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="driver-kicker">Contract-First Driver App</div>
        <h1>Sign in to your driver workspace</h1>
        <p className="auth-copy">
          The app restores your active driver mode from the backend-issued session and rebuilds the correct workspace.
        </p>
        <LoginForm
          formState={controller.formState}
          error={controller.error}
          isSubmitting={controller.isSubmitting}
          onEmailChange={controller.updateEmail}
          onPasswordChange={controller.updatePassword}
          onSubmit={controller.handleSubmit}
        />
      </div>
    </section>
  )
}
