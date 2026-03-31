function isE2EModeEnabled() {
  return String(process.env.E2E_MODE || '').toLowerCase() === 'true';
}

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (isE2EModeEnabled()) {
    return 'secret';
  }

  throw new Error('JWT_SECRET must be set when E2E_MODE is not enabled');
}

function isAdminEmail(email) {
  const configured = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return configured.includes(String(email || '').trim().toLowerCase());
}

module.exports = {
  isE2EModeEnabled,
  getJwtSecret,
  isAdminEmail,
};
