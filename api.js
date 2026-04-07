// Provider-agnostic AI inference layer
// Supports Together.ai, OpenRouter, and Local LLMs

export class AIProvider {
    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        this.provider = localStorage.getItem('aiProvider') || 'together';
        this.togetherApiKey = localStorage.getItem('togetherApiKey') || '';
        this.togetherModel = localStorage.getItem('togetherModel') || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
        this.openrouterApiKey = localStorage.getItem('openrouterApiKey') || '';
        this.openrouterModel = localStorage.getItem('openrouterModel') || 'meta-llama/llama-3.1-70b-instruct';
        this.localEndpoint = localStorage.getItem('localEndpoint') || 'http://localhost:11434';
        this.localModel = localStorage.getItem('localModel') || 'llama3.1';
    }

    saveConfig(config) {
        if (config.provider) {
            this.provider = config.provider;
            localStorage.setItem('aiProvider', config.provider);
        }
        if (config.togetherApiKey !== undefined) {
            this.togetherApiKey = config.togetherApiKey;
            localStorage.setItem('togetherApiKey', config.togetherApiKey);
        }
        if (config.togetherModel) {
            this.togetherModel = config.togetherModel;
            localStorage.setItem('togetherModel', config.togetherModel);
        }
        if (config.openrouterApiKey !== undefined) {
            this.openrouterApiKey = config.openrouterApiKey;
            localStorage.setItem('openrouterApiKey', config.openrouterApiKey);
        }
        if (config.openrouterModel) {
            this.openrouterModel = config.openrouterModel;
            localStorage.setItem('openrouterModel', config.openrouterModel);
        }
        if (config.localEndpoint) {
            this.localEndpoint = config.localEndpoint;
            localStorage.setItem('localEndpoint', config.localEndpoint);
        }
        if (config.localModel) {
            this.localModel = config.localModel;
            localStorage.setItem('localModel', config.localModel);
        }
    }

    async chat(messages, options = {}) {
        const { json = false } = options;

        try {
            if (this.provider === 'together') {
                return await this.callTogether(messages, json);
            } else if (this.provider === 'openrouter') {
                return await this.callOpenRouter(messages, json);
            } else if (this.provider === 'local') {
                return await this.callLocal(messages, json);
            }
        } catch (error) {
            console.error(`${this.provider} failed:`, error);
            // Try fallback providers
            if (this.provider !== 'openrouter' && this.openrouterApiKey) {
                console.log('Falling back to OpenRouter...');
                return await this.callOpenRouter(messages, json);
            }
            if (this.provider !== 'local') {
                console.log('Falling back to Local LLM...');
                try {
                    return await this.callLocal(messages, json);
                } catch (localError) {
                    console.error('Local fallback failed:', localError);
                }
            }
            throw error;
        }
    }

    async callTogether(messages, json) {
        if (!this.togetherApiKey) {
            throw new Error('Together.ai API key not configured');
        }

        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.togetherApiKey}`
            },
            body: JSON.stringify({
                model: this.togetherModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: json ? 1000 : 2000,
                response_format: json ? { type: 'json_object' } : undefined
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Together.ai error: ${error}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            role: 'assistant'
        };
    }

    async callOpenRouter(messages, json) {
        if (!this.openrouterApiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openrouterApiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Corporate Translator'
            },
            body: JSON.stringify({
                model: this.openrouterModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: json ? 1000 : 2000
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter error: ${error}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            role: 'assistant'
        };
    }

    async callLocal(messages, json) {
        // Ollama format
        const response = await fetch(`${this.localEndpoint}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.localModel,
                messages: messages,
                stream: false,
                options: {
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Local LLM error: ${error}`);
        }

        const data = await response.json();
        return {
            content: data.message.content,
            role: 'assistant'
        };
    }

    async imageGen(options) {
        // Image generation only works with Together.ai currently
        if (!this.togetherApiKey) {
            throw new Error('Image generation requires Together.ai API key');
        }

        const { prompt, width = 1024, height = 768, transparent = false } = options;

        const response = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.togetherApiKey}`
            },
            body: JSON.stringify({
                model: 'black-forest-labs/FLUX.1-schnell',
                prompt: prompt,
                width: width,
                height: height,
                steps: 4,
                n: 1
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Together.ai image error: ${error}`);
        }

        const data = await response.json();
        return {
            url: data.data[0].url
        };
    }

    async textToSpeech(options) {
        // TTS not implemented in this version
        throw new Error('Text-to-speech not available in standalone version');
    }
}