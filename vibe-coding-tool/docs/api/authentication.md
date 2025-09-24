# API Authentication Details

The API uses JWT for session management and OAuth for external providers (GitHub, Hugging Face). All endpoints except public health checks require authentication. Tokens are validated via middleware.

## JWT Authentication

- **Tokens**: Access (30min expiry), refresh (7 days).
- **Header**: `Authorization: Bearer <access_token>`.
- **Scopes**: Permissions (e.g., "projects:write", "mcps:execute").

### Flow:
1. **Login**: POST /api/auth/login {email, password} → {access_token, refresh_token}.
2. **Use Token**: Include in headers for protected routes.
3. **Refresh**: POST /api/auth/refresh with refresh_token → new access_token.
4. **Logout**: Client discards tokens; backend has revoke endpoint if needed.

Example:
```
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." https://api.example.com/api/tasks
```

Invalid/expired: 401 Unauthorized with {"code": "VCT_AUTH_INVALID", "message": "Token invalid"}.

### Token Payload
JWT payload (decoded):
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "scopes": ["projects:read", "tasks:write"],
  "exp": 1725140000,
  "iat": 1725136400
}
```

Generated with PyJWT: HS256 algorithm, secret from JWT_SECRET env.

## OAuth Authentication

For GitHub/HF integration.

### GitHub OAuth
- **Flow**: Authorization Code Grant.
- **Client ID/Secret**: From GitHub app.
- **Redirect URI**: Configured in app (e.g., http://localhost:3000/auth/github/callback).
- **Scopes**: repo, user.
- **Endpoint**: POST /api/auth/github?code={code}.
- **Response**: Links account, returns JWT.

HF similar: Scopes for spaces/datasets.

### Linking Accounts
- POST /api/user/link-account {provider: "github", code: str}.
- Backend exchanges code for token, stores in oauth_accounts table.

### Permissions
- Scopes checked in middleware: e.g., require "mcps:execute" for MCP calls.
- User-owned: Tasks/projects scoped to user_id from token.

## Security Notes

- Tokens: httpOnly cookies in frontend; never expose refresh.
- Validation: Backend verifies signature, expiry, issuer.
- Revocation: On logout, blacklist refresh (Redis).
- Rate Limiting: Applied post-auth for user fairness.

For errors: [Error Codes](error-codes.md). Implement in [Backend Development](../developer/backend-development.md).

Back to [API Index](index.md).