import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { InviteForm } from '@/components/auth/InviteForm'
import styles from './invite.module.css'

export const metadata = { title: 'Invite new user' }

export default async function InvitePage() {
  const user = await getSessionUser()

  if (!user || user.collection !== 'platformUsers' || !['admin', 'localAdmin'].includes(user.role ?? '')) {
    redirect('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Invite new user</h1>
        <p className={styles.subtitle}>
          Send an invitation link to allow a new external user to access the Brand Center.
        </p>
        <InviteForm />
      </div>
    </div>
  )
}
