function containsSecretPassword(response, secretPassword) {
  if (typeof response !== 'string' || typeof secretPassword !== 'string') {
    return false;
  }

  return response.includes(secretPassword);
}

module.exports = {
  containsSecretPassword,
};
