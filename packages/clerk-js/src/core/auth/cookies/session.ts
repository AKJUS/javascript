import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { getSuffixedCookieName } from '@clerk/shared/keys';

import { inCrossOriginIframe } from '../../../utils';
import { getSecureAttribute } from '../getSecureAttribute';

const SESSION_COOKIE_NAME = '__session';

export type SessionCookieHandler = {
  set: (token: string) => void;
  remove: () => void;
  get: () => string | undefined;
};

/**
 * Create a short-lived JS cookie to store the current user JWT.
 * The cookie is used by the Clerk backend SDKs to identify
 * the authenticated user.
 */
export const createSessionCookie = (cookieSuffix: string): SessionCookieHandler => {
  const sessionCookie = createCookieHandler(SESSION_COOKIE_NAME);
  const suffixedSessionCookie = createCookieHandler(getSuffixedCookieName(SESSION_COOKIE_NAME, cookieSuffix));

  const remove = () => {
    suffixedSessionCookie.remove();
    sessionCookie.remove();
  };

  const set = (token: string) => {
    const expires = addYears(Date.now(), 1);
    const sameSite = inCrossOriginIframe() ? 'None' : 'Lax';
    const secure = getSecureAttribute(sameSite);

    suffixedSessionCookie.set(token, { expires, sameSite, secure });
    sessionCookie.set(token, { expires, sameSite, secure });
  };

  const get = () => suffixedSessionCookie.get() || sessionCookie.get();

  return {
    set,
    remove,
    get,
  };
};
