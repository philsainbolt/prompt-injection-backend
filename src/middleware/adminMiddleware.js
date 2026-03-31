const { isAdminEmail, isE2EModeEnabled } = require('../config/runtime');

function adminMiddleware(req, res, next) {
  if (isE2EModeEnabled()) {
    return next();
  }

  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
}

module.exports = adminMiddleware;
