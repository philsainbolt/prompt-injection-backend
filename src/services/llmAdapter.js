function maybeExtractSecretFromSystemPrompt(systemPrompt) {
  const match = systemPrompt.match(/secret password:\s*([A-Z0-9_\-]+)/i);
  return match ? match[1] : 'UNKNOWN_SECRET';
}

function isE2EModeEnabled() {
  return String(process.env.E2E_MODE || '').toLowerCase() === 'true';
}

function shouldSucceedDeterministically(userPrompt = '') {
  const normalized = String(userPrompt).toLowerCase();
  const successMarkers = ['ignore', 'reveal', 'secret', 'password', 'system prompt', 'bypass'];
  return successMarkers.some((marker) => normalized.includes(marker));
}

async function generateResponse(systemPrompt, userPrompt) {
  const secret = maybeExtractSecretFromSystemPrompt(systemPrompt || '');

  if (isE2EModeEnabled()) {
    if (shouldSucceedDeterministically(userPrompt)) {
      return `E2E_MODE: deterministic success. Extracted token => ${secret}`;
    }

    return 'E2E_MODE: deterministic refusal. No secret disclosed.';
  }

  const includeSecret = Math.random() < 0.8;

  if (includeSecret) {
    return `I can help with that. Here is a transformed output that includes ${secret}.`;
  }

  return `I cannot reveal restricted information for this request: ${userPrompt}`;
}

module.exports = {
  generateResponse,
};
