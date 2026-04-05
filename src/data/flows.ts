export type Actor = {
  id: string
  label: string
  icon: string
  color: string
}

export type FlowStep = {
  id: number
  from: string
  to: string
  label: string
  detail: string
  code?: string
  isReturn?: boolean        // arrow goes right-to-left
  canTamper?: boolean       // tamper mode can break this step
  tamperLabel?: string      // what the failure looks like
  tamperDetail?: string
}

export type Flow = {
  id: string
  title: string
  subtitle: string
  icon: string
  actors: Actor[]
  steps: FlowStep[]
}

// ─── Actors shared across flows ───────────────────────────────────────────────
const BROWSER: Actor  = { id: 'browser',  label: 'Browser',       icon: '🌐', color: '#06b6d4' }
const APP: Actor      = { id: 'app',      label: 'App Server',    icon: '⚙️', color: '#7c3aed' }
const AUTH: Actor     = { id: 'auth',     label: 'Auth Server',   icon: '🔐', color: '#a78bfa' }
const RESOURCE: Actor = { id: 'resource', label: 'Resource API',  icon: '📦', color: '#10b981' }
const REDIS: Actor    = { id: 'redis',    label: 'Redis Cache',   icon: '🗄️', color: '#f59e0b' }

// ─── OAuth 2.0 Authorization Code Flow ────────────────────────────────────────
export const oauthFlow: Flow = {
  id: 'oauth',
  title: 'OAuth 2.0',
  subtitle: 'Authorization Code Flow',
  icon: '🔑',
  actors: [BROWSER, APP, AUTH, RESOURCE],
  steps: [
    {
      id: 1,
      from: 'browser', to: 'app',
      label: 'User clicks "Login with Google"',
      detail: 'The browser sends a login intent to the App Server, which builds an authorization URL with client_id, redirect_uri, scope, state, and code_challenge (PKCE).',
      code: 'GET /auth/login',
    },
    {
      id: 2,
      from: 'app', to: 'browser',
      label: 'Redirect to Auth Server',
      detail: 'App server responds with a 302 redirect to the Auth Server authorization endpoint.',
      code: 'HTTP 302 → /authorize?client_id=...&code_challenge=...&state=xyz',
      isReturn: true,
    },
    {
      id: 3,
      from: 'browser', to: 'auth',
      label: 'User authenticates',
      detail: 'The browser follows the redirect. The Auth Server presents a login form. User enters credentials.',
      code: 'GET /authorize?response_type=code&scope=openid profile',
      canTamper: true,
      tamperLabel: 'Wrong credentials',
      tamperDetail: 'User enters bad credentials. Auth Server returns 401 Unauthorized. Flow stops here — no code is issued.',
    },
    {
      id: 4,
      from: 'auth', to: 'browser',
      label: 'Redirect back with auth code',
      detail: 'Auth Server validates credentials and redirects back to the app\'s redirect_uri with a short-lived authorization code (valid ~60 seconds) and the original state value.',
      code: 'HTTP 302 → /callback?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz',
      isReturn: true,
    },
    {
      id: 5,
      from: 'browser', to: 'app',
      label: 'App receives auth code',
      detail: 'Browser follows the redirect back to the App Server, which extracts the code and verifies the state to prevent CSRF attacks.',
      code: 'GET /callback?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz',
    },
    {
      id: 6,
      from: 'app', to: 'auth',
      label: 'Exchange code for tokens',
      detail: 'App server (server-to-server) exchanges the auth code for access + refresh tokens. Includes the code_verifier for PKCE validation.',
      code: 'POST /token\n{ grant_type: "authorization_code", code, code_verifier }',
      canTamper: true,
      tamperLabel: 'Code expired / replayed',
      tamperDetail: 'Auth codes are single-use and expire in 60s. Replaying or using an expired code returns: error: "invalid_grant".',
    },
    {
      id: 7,
      from: 'auth', to: 'app',
      label: 'Access token + Refresh token issued',
      detail: 'Auth Server returns a signed JWT access token (short-lived, e.g. 15 min) and a refresh token (long-lived, e.g. 30 days). App stores refresh token securely (httpOnly cookie).',
      code: '{ access_token: "eyJ...", refresh_token: "dGhp...", expires_in: 900 }',
      isReturn: true,
    },
    {
      id: 8,
      from: 'app', to: 'resource',
      label: 'Call Resource API with access token',
      detail: 'App attaches the JWT as a Bearer token in the Authorization header. Resource API validates signature and expiry without calling the Auth Server (stateless verification).',
      code: 'GET /api/user\nAuthorization: Bearer eyJ...',
    },
    {
      id: 9,
      from: 'resource', to: 'app',
      label: 'Protected data returned',
      detail: 'JWT signature is valid, token is not expired — resource server returns the requested data.',
      code: 'HTTP 200 { user: { id, email, name } }',
      isReturn: true,
    },
  ],
}

// ─── MFA / OTP Flow ───────────────────────────────────────────────────────────
export const mfaFlow: Flow = {
  id: 'mfa',
  title: 'MFA / OTP',
  subtitle: 'Time-based One-Time Password',
  icon: '📱',
  actors: [BROWSER, AUTH, REDIS],
  steps: [
    {
      id: 1,
      from: 'browser', to: 'auth',
      label: 'Submit username + password',
      detail: 'User submits primary credentials. Auth Server validates password hash (bcrypt). On success, MFA challenge is triggered — credentials alone are not enough.',
      code: 'POST /auth/login\n{ username: "sangeeth", password: "••••••••" }',
    },
    {
      id: 2,
      from: 'auth', to: 'redis',
      label: 'Generate & store OTP with TTL',
      detail: 'Auth Server generates a 6-digit TOTP using HMAC-SHA1 seeded with the user\'s secret + current 30s time window. Stores a challenge session ID in Redis with a 5-minute TTL.',
      code: 'SET otp:session:abc123 { userId, otpHash, attempts: 0 } EX 300',
    },
    {
      id: 3,
      from: 'redis', to: 'auth',
      label: 'OTP stored',
      detail: 'Redis confirms the key was set. The auth server now sends the OTP via the registered channel (SMS/email/authenticator app).',
      code: 'OK',
      isReturn: true,
    },
    {
      id: 4,
      from: 'auth', to: 'browser',
      label: 'Prompt for OTP',
      detail: 'Auth Server returns a partial-success response — primary credentials passed but MFA is required. Browser displays the OTP entry screen.',
      code: 'HTTP 200 { status: "mfa_required", session: "abc123" }',
      isReturn: true,
    },
    {
      id: 5,
      from: 'browser', to: 'auth',
      label: 'Submit OTP code',
      detail: 'User retrieves the 6-digit code from their authenticator app or SMS and submits it with the challenge session ID.',
      code: 'POST /auth/mfa/verify\n{ session: "abc123", otp: "482916" }',
      canTamper: true,
      tamperLabel: 'Wrong OTP entered',
      tamperDetail: 'Auth server increments the attempt counter in Redis. After 3 failed attempts, the session is invalidated. User must restart the login flow.',
    },
    {
      id: 6,
      from: 'auth', to: 'redis',
      label: 'Validate OTP + check TTL',
      detail: 'Auth Server fetches the session from Redis, verifies the TOTP hash matches, checks expiry (5 min window), and checks attempt count (max 3).',
      code: 'GET otp:session:abc123',
    },
    {
      id: 7,
      from: 'redis', to: 'auth',
      label: 'Session valid / expired',
      detail: 'Redis returns the session. Auth server validates the OTP hash. If expired (TTL elapsed), returns null — the session is gone.',
      code: '{ userId, otpHash, attempts: 0 }  OR  (nil)',
      isReturn: true,
      canTamper: true,
      tamperLabel: 'OTP expired (TTL elapsed)',
      tamperDetail: 'OTPs have a 30-second window. After 5 minutes the Redis key expires entirely. Submitting after expiry: error "otp_expired". User must request a new code.',
    },
    {
      id: 8,
      from: 'auth', to: 'redis',
      label: 'Invalidate used OTP session',
      detail: 'Immediately after successful verification, the session key is deleted from Redis. This prevents replay attacks — the same OTP cannot be used twice.',
      code: 'DEL otp:session:abc123',
    },
    {
      id: 9,
      from: 'auth', to: 'browser',
      label: 'Issue authenticated session',
      detail: 'MFA passed. Auth Server issues a full JWT access + refresh token pair. User is now fully authenticated.',
      code: 'HTTP 200 { access_token: "eyJ...", refresh_token: "dGhp..." }',
      isReturn: true,
    },
  ],
}

// ─── JWT Token Refresh Flow ────────────────────────────────────────────────────
export const tokenRefreshFlow: Flow = {
  id: 'token',
  title: 'Token Refresh',
  subtitle: 'Silent JWT Renewal',
  icon: '🔄',
  actors: [BROWSER, APP, AUTH, REDIS],
  steps: [
    {
      id: 1,
      from: 'browser', to: 'app',
      label: 'API call with expired access token',
      detail: 'Browser makes an authenticated request with the stored JWT. The access token has expired (typically 15 min lifetime). App server detects the expiry before forwarding.',
      code: 'GET /api/profile\nAuthorization: Bearer eyJ... (expired)',
      canTamper: true,
      tamperLabel: 'Token tampered / invalid signature',
      tamperDetail: 'JWT signature verification fails — payload was modified. App server rejects immediately with 401. Refresh is NOT attempted — full re-login required.',
    },
    {
      id: 2,
      from: 'app', to: 'auth',
      label: 'Send refresh token silently',
      detail: 'App server extracts the refresh token from the secure httpOnly cookie and sends it to the Auth Server token endpoint. This is server-to-server — the browser never sees the refresh token.',
      code: 'POST /token\n{ grant_type: "refresh_token", refresh_token: "dGhp..." }',
    },
    {
      id: 3,
      from: 'auth', to: 'redis',
      label: 'Check refresh token in allowlist',
      detail: 'Auth Server looks up the refresh token in Redis. A valid token exists in the allowlist with the associated userId and device info. If revoked, the key won\'t exist.',
      code: 'GET refresh:dGhp...',
      canTamper: true,
      tamperLabel: 'Refresh token revoked',
      tamperDetail: 'Admin revoked all sessions (e.g. on password change). Redis key is gone — GET returns nil. Auth Server returns 401 "refresh_token_revoked". Full re-login required.',
    },
    {
      id: 4,
      from: 'redis', to: 'auth',
      label: 'Token allowlist result',
      detail: 'Redis returns the stored token metadata. Auth Server validates it has not expired and belongs to the correct user.',
      code: '{ userId: "u_123", deviceId: "d_abc", issuedAt: 1712000000 }',
      isReturn: true,
    },
    {
      id: 5,
      from: 'auth', to: 'redis',
      label: 'Rotate: delete old, store new refresh token',
      detail: 'Refresh token rotation — the old token is immediately deleted and a new refresh token is stored. This detects token theft: if the old token is used again, it\'s an attack signal.',
      code: 'DEL refresh:dGhp...\nSET refresh:newToken { userId } EX 2592000',
    },
    {
      id: 6,
      from: 'auth', to: 'app',
      label: 'New access + refresh tokens issued',
      detail: 'Auth Server returns a fresh JWT access token (new 15-min window) and a rotated refresh token. The old refresh token is now invalid.',
      code: 'HTTP 200\n{ access_token: "eyJnew...", refresh_token: "newRefresh...", expires_in: 900 }',
      isReturn: true,
    },
    {
      id: 7,
      from: 'app', to: 'browser',
      label: 'Retry original request (transparent)',
      detail: 'App server retries the original API request with the new access token. The browser never knew the token expired — the refresh was completely silent.',
      code: 'GET /api/profile\nAuthorization: Bearer eyJnew... (valid)',
      isReturn: true,
    },
    {
      id: 8,
      from: 'browser', to: 'app',
      label: 'User receives data seamlessly',
      detail: 'From the user\'s perspective, nothing happened. The page loaded normally. Token refresh is completely transparent.',
      code: 'HTTP 200 { profile: { name, email, avatar } }',
    },
  ],
}

export const flows: Flow[] = [oauthFlow, mfaFlow, tokenRefreshFlow]
