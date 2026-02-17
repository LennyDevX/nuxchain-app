/**
 * Email Normalization Service
 * Prevents duplicate registrations using email aliases
 * Example: test+alias@gmail.com → test@gmail.com
 */

/**
 * Normalize email to prevent alias abuse
 * Rules:
 * - Gmail: Remove dots and everything after + (gmail.com, googlemail.com)
 * - Outlook/Hotmail: Remove everything after +
 * - Others: Remove everything after +
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }
  
  const emailLower = email.toLowerCase().trim();
  const [localPart, domain] = emailLower.split('@');
  
  if (!localPart || !domain) {
    return emailLower;
  }
  
  let normalizedLocal = localPart;
  
  // Gmail-specific normalization
  const gmailDomains = ['gmail.com', 'googlemail.com'];
  if (gmailDomains.includes(domain)) {
    // Remove dots (Gmail ignores them)
    normalizedLocal = normalizedLocal.replace(/\./g, '');
    // Remove everything after + (Gmail aliases)
    normalizedLocal = normalizedLocal.split('+')[0];
  } 
  // Outlook/Hotmail normalization
  else if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    // Remove everything after +
    normalizedLocal = normalizedLocal.split('+')[0];
  }
  // Generic normalization for other providers
  else {
    // Remove everything after +
    normalizedLocal = normalizedLocal.split('+')[0];
  }
  
  return `${normalizedLocal}@${domain}`;
}

/**
 * Check if email is the same after normalization
 */
export function isSameEmail(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2);
}

/**
 * Examples:
 * normalizeEmail('test+airdrop1@gmail.com') → 'test@gmail.com'
 * normalizeEmail('t.e.s.t+alias@gmail.com') → 'test@gmail.com'
 * normalizeEmail('user+bonus@outlook.com') → 'user@outlook.com'
 */
