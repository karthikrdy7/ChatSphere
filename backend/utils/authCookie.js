const TOKEN_COOKIE_NAME = 'chatsphere_session';
const sameSite = process.env.COOKIE_SAME_SITE || 'lax';

if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.');
}

const authCookieOptions = Object.freeze({
  httpOnly: true,
  secure: true,
  sameSite,
  path: '/',
});

function getAuthCookieOptions() {
  return { ...authCookieOptions };
}

function readCookie(cookieHeader, cookieName = TOKEN_COOKIE_NAME) {
  if (typeof cookieHeader !== 'string') return null;

  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  } catch {
    return null;
  }
}

module.exports = { TOKEN_COOKIE_NAME, getAuthCookieOptions, readCookie };
