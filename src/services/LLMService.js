const axios = require('axios');

class LLMService {
  static async callOllama(systemPrompt, userInput) {
    try {
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      const response = await axios.post(`${ollamaHost}/api/generate`, {
        model: 'mistral',
        prompt: userInput,
        system: systemPrompt,
        stream: false,
      });

      return response.data.response;
    } catch (err) {
      console.error('Ollama error:', err.message);
      throw new Error('Failed to call LLM service');
    }
  }

  static async checkSecretInResponse(response, secret) {
    return response.toLowerCase().includes(secret.toLowerCase());
  }
}

module.exports = LLMService;
