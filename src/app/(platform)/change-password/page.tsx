import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from '@/lib/payload'
import { getSessionUserFromRequest } from '@/lib/auth'
import type { LoginSetting } from '@/payload-types'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import styles from './change-password.module.css'

export const dynamic = 'force-dynamic'

export default async function ChangePasswordPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const fakeRequest = new Request('http://localhost', {
    headers: { cookie: cookieHeader },
  })
  const user = getSessionUserFromRequest(fakeRequest)

  if (!user || user.collection !== 'externalUsers') {
    redirect('/')
  }

  const payload = await getPayload()
  const loginSettings = await payload
    .findGlobal({ slug: 'loginSettings', depth: 0 })
    .catch(() => null) as LoginSetting | null

  const title = loginSettings?.changePasswordTitle ?? 'Change password'
  const introduction =
    loginSettings?.changePasswordIntroduction ?? 'Create a new password to secure your account.'

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.headline}>
          <h1 className={styles.title}>{title}</h1>
          {introduction && <p className={styles.introduction}>{introduction}</p>}
        </div>
        <div className={styles.formWrapper}>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
