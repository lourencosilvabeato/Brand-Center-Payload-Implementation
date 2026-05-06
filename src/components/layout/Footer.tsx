import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from '@/lib/payload'
import type { FooterSetting, Media, LegalPage } from '@/payload-types'
import styles from './Footer.module.css'

export async function Footer() {
  const payload = await getPayload()
  const footer = (await payload.findGlobal({ slug: 'footerSettings', depth: 1 })) as FooterSetting

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {footer.brandName && (
          <span className={styles.brand}>{footer.brandName}</span>
        )}

        {footer.socialLinks && footer.socialLinks.length > 0 && (
          <>
            <div className={styles.divider} aria-hidden="true" />
            <p className={styles.followLabel}>SIGA-NOS</p>
            <div className={styles.socials}>
              {footer.socialLinks.map((link) => {
                const icon = link.icon as Media
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={icon.alt ?? undefined}
                  >
                    {icon.url && (
                      <Image
                        src={icon.url}
                        alt={icon.alt ?? ''}
                        width={32}
                        height={32}
                        className={styles.socialIcon}
                      />
                    )}
                  </a>
                )
              })}
            </div>
          </>
        )}

        {footer.legalLinks && footer.legalLinks.length > 0 && (
          <>
            <div className={styles.divider} aria-hidden="true" />
            <nav aria-label="Legal links" className={styles.legal}>
              {footer.legalLinks.map((link) => {
                const page = link.page as LegalPage | null | number
                const href =
                  link.url ??
                  (page && typeof page !== 'number' ? `/${page.slug}` : null)

                return href ? (
                  <Link
                    key={link.id}
                    href={href}
                    className={styles.legalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </Link>
                ) : null
              })}
            </nav>
          </>
        )}

        {footer.copyright && (
          <>
            <div className={styles.divider} aria-hidden="true" />
            <span className={styles.copyright}>{footer.copyright}</span>
          </>
        )}
      </div>
    </footer>
  )
}
