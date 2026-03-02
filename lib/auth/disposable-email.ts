/**
 * Server-side disposable email validation.
 * Used by the send-otp API route so the check cannot be bypassed by the client.
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'bitoini.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.info',
  '10minutemail.com',
  '10minutemail.net',
  'mailinator.com',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'fakeinbox.com',
  'trashmail.com',
  'tempmailo.com',
  'mailnesia.com',
  'dispostable.com',
  'maildrop.cc',
  'tempail.com',
  'sharklasers.com',
  'guerrillamail.biz',
  'guerrillamail.org',
  'guerrillamail.de',
  'spam4.me',
  'mohmal.com',
  'emailondeck.com',
  'tmpmail.org',
  'tempinbox.com',
  'minuteinbox.com',
  'inboxkitten.com',
  'mail.tm',
  'disposablemail.xyz',
  'tempmail.plus',
  'temp-mail.io',
  'throwawaymail.com',
  'mailinator2.com',
  'mailinator.net',
  'mintemail.com',
  'mytemp.email',
  'tempr.email',
  'anonymousemail.me',
  'burnermail.io',
  'getairmail.com',
  'mailcatch.com',
  'mailsac.com',
  'mytrashmail.com',
  'nospamfor.us',
  'tempinbox.co.uk',
  'yepmail.com',
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1]
  return domain != null && DISPOSABLE_EMAIL_DOMAINS.has(domain)
}

export function isEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
