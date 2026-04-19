/**
 * Format URLs based on their type and content
 * Handles special cases like WhatsApp, phone numbers, email, etc.
 */
export const formatUrl = (url: string): string => {
  // If URL already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Check if it's a phone number (starts with + or contains only digits and some special chars)
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  if (phoneRegex.test(url.trim())) {
    // Clean the phone number (remove spaces, dashes, parentheses)
    const cleanNumber = url.replace(/[\s\-\(\)]/g, '');
    return `https://wa.me/${cleanNumber}`;
  }

  // Check if it's an email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(url.trim())) {
    return `mailto:${url}`;
  }

  // Check if it's a WhatsApp link that's missing the protocol
  if (url.startsWith('wa.me/') || url.startsWith('whatsapp://')) {
    return `https://${url}`;
  }

  // Check if it's a social media handle (starts with @)
  if (url.startsWith('@')) {
    // For now, just return as is - could be enhanced to link to specific platforms
    return url;
  }

  // Check if it's a domain (contains a dot but no spaces)
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-\.]*[a-zA-Z0-9]$/;
  if (url.includes('.') && !url.includes(' ') && domainRegex.test(url)) {
    return `https://${url}`;
  }

  // For everything else, add https://
  return `https://${url}`;
};

/**
 * Check if a URL is a WhatsApp link
 */
export const isWhatsAppUrl = (url: string): boolean => {
  return url.includes('wa.me/') || url.includes('whatsapp://') || url.includes('whatsapp.com');
};

/**
 * Check if a URL is a phone number
 */
export const isPhoneNumber = (url: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  return phoneRegex.test(url.trim());
};
