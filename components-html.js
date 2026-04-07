// HTML component templates

export const sidePanel = `
<button id="sidePanelToggle" class="side-panel-toggle" title="Toggle dictionary">📖</button>

<div class="side-panel" id="sidePanel">
    <div class="side-panel-header">
        <h3>Dictionary & Notes</h3>
        <button class="close-panel" id="closePanelBtn">✕</button>
    </div>
    
    <div class="side-panel-content">
        <div class="panel-section">
            <h4>AI Notes</h4>
            <div id="aiNotes" class="ai-notes">
                <p class="placeholder-text">AI insights will appear here after translation...</p>
            </div>
        </div>
        
        <div class="panel-section">
            <h4>Jargon Dictionary</h4>
            <input type="text" id="dictionarySearch" placeholder="Search buzzwords..." class="dictionary-search">
            <div id="dictionaryList" class="dictionary-list"></div>
        </div>
    </div>
</div>
`;

export const header = `
<header>
    <h1>Corporate Speak Translator</h1>
    <p class="subtitle">Decode the BS</p>
</header>
`;

export const controls = `
<div class="controls">
    <div class="settings">
        <label class="realtime-toggle">
            <input type="checkbox" id="realtimeToggle">
            <span>Real-time</span>
        </label>
        
        <div class="theme-selector">
            <select id="themeSelect" class="theme-dropdown">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="blackpill">Blackpill</option>
                <option value="void">Void</option>
                <option value="matrix">Matrix</option>
            </select>
        </div>
        
        <div class="font-size-controls">
            <button id="fontDecrease" class="icon-btn" title="Decrease font size">A-</button>
            <button id="fontIncrease" class="icon-btn" title="Increase font size">A+</button>
            <button id="apiSettingsBtn" class="icon-btn" title="API Settings">⚙️</button>
        </div>
    </div>
</div>
`;

export const translator = `
<div class="translator">
    <div class="legend">
        <div class="legend-item">
            <div class="legend-color finance"></div>
            <span>Finance</span>
        </div>
        <div class="legend-item">
            <div class="legend-color hr"></div>
            <span>HR</span>
        </div>
        <div class="legend-item">
            <div class="legend-color management"></div>
            <span>Management</span>
        </div>
        <div class="legend-item">
            <div class="legend-color tech"></div>
            <span>Tech</span>
        </div>
    </div>

    <div id="dropZone" class="drop-zone">
        <div class="drop-zone-content">
            <span class="drop-icon">📁</span>
            <p>Drop TXT file here</p>
            <span class="drop-subtext">or click to browse</span>
            <input type="file" id="fileInput" accept=".txt" hidden>
        </div>
    </div>

    <div class="comparison-container">
        <div class="input-section">
            <div class="input-header">
                <label for="corporateInput">Corporate Speak</label>
                <div class="input-meta">
                    <span id="charCounter" class="char-counter">0 characters</span>
                    <button id="clearInputBtn" class="clear-btn" title="Clear input">Clear</button>
                </div>
            </div>
            <textarea 
                id="corporateInput" 
                placeholder="Paste corporate jargon, job postings, or business speak here...&#10;&#10;Example: 'We're looking for a self-starter who can leverage synergies to drive holistic solutions in a fast-paced environment.'"
            ></textarea>
        </div>

        <div class="output-section">
            <div class="output-header">
                <label for="translatedOutput">Translation</label>
                <div class="output-actions">
                    <button id="downloadTxt" class="action-btn" title="Download as TXT">
                        <span>TXT</span>
                    </button>
                    <button id="downloadPdf" class="action-btn" title="Download as PDF">
                        <span>PDF</span>
                    </button>
                    <button id="copyBtn" class="copy-btn" title="Copy to clipboard">
                        <span class="copy-icon">📋</span>
                        <span class="copy-text">Copy</span>
                    </button>
                </div>
            </div>
            <div id="translatedOutput" class="output">
                <span class="placeholder">Translation will appear here...</span>
            </div>
            <div class="feedback-section" id="feedbackSection" style="display: none;">
                <button id="feedbackBtn" class="feedback-btn">📝 Suggest Correction</button>
                <div class="feedback-form" id="feedbackForm" style="display: none;">
                    <textarea id="feedbackText" placeholder="How would you improve this translation?"></textarea>
                    <div class="feedback-actions">
                        <button id="submitFeedback" class="submit-feedback-btn">Submit</button>
                        <button id="cancelFeedback" class="cancel-feedback-btn">Cancel</button>
                    </div>
                </div>
                <div id="feedbackSuccess" class="feedback-success" style="display: none;">
                    ✓ Thanks! Your feedback helps improve translations.
                </div>
            </div>
        </div>
    </div>

    <div class="button-section">
        <button id="translateBtn" class="translate-btn">
            <span class="btn-text">Translate</span>
            <span class="loading-spinner"></span>
        </button>
        <button id="highlightActionsBtn" class="highlight-actions-btn">
            <span class="btn-text">Highlight Actions</span>
            <span class="loading-spinner"></span>
        </button>
    </div>
</div>
`;

export const analysisSection = `
<div class="analysis-section" id="analysisSection" style="display: none;">
    <div class="analysis-item">
        <div class="analysis-label">Sentiment</div>
        <div class="analysis-content">
            <span id="sentimentBadge" class="sentiment-badge"></span>
        </div>
    </div>

    <div class="analysis-item">
        <div class="analysis-label">Intent</div>
        <div class="analysis-content" id="intentContent"></div>
    </div>

    <div class="analysis-item">
        <div class="analysis-label">Alternative Phrasings</div>
        <div class="suggestions-list" id="suggestionsList"></div>
    </div>
</div>
`;

export const aboutSection = `
<div class="about-section">
    <button id="aboutToggle" class="about-toggle-btn">About</button>
    <div class="about-content" id="aboutContent" style="display: none;">
        <p>
            <strong>Corporate Speak Translator</strong> is an AI-powered tool designed to decode the obfuscated language of modern business communication. Using advanced language models, it cuts through jargon, buzzwords, and euphemisms to reveal what corporate messages actually mean.
        </p>
        <h3>Project Status</h3>
        <p>
            This is the <strong>final standalone version</strong> of Corporate Speak Translator. Originally built on WebSim AI, the project has been migrated to use your own AI providers (Together.ai, OpenRouter, or Local LLM) for full independence and sovereignty. All features are preserved, with translations, history, and settings stored locally in your browser. No external dependencies beyond your chosen AI API.
        </p>
        <h3>How It Works</h3>
        <p>
            Paste or type corporate text into the input field. The platform automatically highlights recognized buzzwords by category (Finance, HR, Management, Tech). Click "Translate" to receive a plain-language interpretation. The AI analyzes sentiment, identifies underlying intent, and suggests alternative phrasings.
        </p>
        <h3>Translation Approach</h3>
        <p>
            The translator uses a unified approach that combines blunt directness, sarcastic wit, and cynical realism to decode corporate jargon. It cuts through the BS while exposing the manipulation and absurdity hiding beneath business speak. Each translation is formatted with clear headings and paragraphs for easy reading.
        </p>
        <h3>Features</h3>
        <ul>
            <li>AI-powered unified translation combining blunt, sarcastic, and cynical approaches</li>
            <li>Real-time translation mode for instant feedback as you type</li>
            <li>Sentiment analysis (Neutral, Passive-Aggressive, Inflated)</li>
            <li>Intent explanation revealing hidden goals</li>
            <li>Alternative phrasing suggestions you can apply with one click</li>
            <li>Action highlighting to identify buried instructions</li>
            <li>AI-generated insights about manipulative language patterns</li>
            <li>Translation history with search functionality</li>
            <li>Export to TXT and PDF with full analysis context</li>
            <li>Comprehensive jargon dictionary with 45+ buzzwords</li>
            <li>Feedback system for improving translation accuracy</li>
            <li>Multiple theme options: Dark, Light, Blackpill, Void, and Matrix</li>
            <li>File upload support for .txt documents</li>
        </ul>
        <h3>Privacy & Data</h3>
        <p>
            All translations are processed using your chosen AI provider (Together.ai, OpenRouter, or Local LLM). API keys are stored locally in your browser. Translation history is stored locally and never sent to external servers except for AI processing. You can clear your history and API keys at any time.
        </p>
        <h3>API Configuration</h3>
        <p>
            Click the ⚙️ button in the controls to configure your AI provider. Together.ai and OpenRouter require API keys. Local LLM option works with Ollama (port 11434) or LM Studio (port 1234) running on your machine. The system will automatically fall back to alternative providers if the primary one fails.
        </p>
        <h3>Tips</h3>
        <ul>
            <li>Use Ctrl/Cmd + Enter to quickly translate without clicking the button</li>
            <li>Enable real-time mode for live translation as you type (1 second delay)</li>
            <li>Click on alternative phrasings to instantly replace the translation</li>
            <li>Use the "Highlight Actions" button to reveal hidden instructions in corporate text</li>
            <li>Open the side panel (📖 button) to access the jargon dictionary and AI insights</li>
            <li>Click any history item to restore that translation instantly</li>
            <li>Submit feedback to help improve translation accuracy over time</li>
            <li>Export to PDF to save translations with full sentiment and intent analysis</li>
        </ul>
    </div>
</div>
`;

export const historySection = `
<div class="history-section">
    <div class="history-header">
        <h2>Translation History</h2>
        <button id="clearHistoryBtn" class="clear-history-btn">Clear</button>
    </div>
    <div class="history-search">
        <input 
            type="text" 
            id="historySearch" 
            placeholder="Search translations..."
            class="search-input"
        >
    </div>
    <div id="historyList" class="history-list">
        <span class="placeholder">No translations yet...</span>
    </div>
</div>
`;

export const dialogs = `
<div class="tooltip" id="tooltip"></div>

<div class="dialog-overlay" id="dialogOverlay">
    <div class="dialog-box">
        <div class="dialog-title" id="dialogTitle"></div>
        <div class="dialog-message" id="dialogMessage"></div>
        <div class="dialog-actions" id="dialogActions"></div>
    </div>
</div>
`;

export const settingsModal = `
<div class="settings-modal" id="settingsModal">
    <div class="settings-content">
        <div class="settings-header">
            <h2>API Configuration</h2>
            <button class="close-panel" id="closeSettingsBtn">✕</button>
        </div>

        <div class="settings-group">
            <h3>Inference Provider</h3>
            <label for="providerSelect">Select Provider</label>
            <select id="providerSelect">
                <option value="together">Together.ai</option>
                <option value="openrouter">OpenRouter</option>
                <option value="local">Local LLM</option>
            </select>
            <div class="settings-help">
                Choose your AI inference backend. Together and OpenRouter require API keys. Local uses Ollama/LM Studio.
            </div>
        </div>

        <div class="settings-group" id="togetherSettings">
            <h3>Together.ai Settings</h3>
            <label for="togetherApiKey">API Key</label>
            <input type="password" id="togetherApiKey" placeholder="Enter your Together.ai API key">
            <div class="settings-help">
                Get your API key from <a href="https://api.together.xyz" target="_blank" style="color: var(--text-primary)">api.together.xyz</a>
            </div>
            <label for="togetherModel">Model</label>
            <select id="togetherModel">
                <option value="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo">Llama 3.1 70B Instruct</option>
                <option value="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo">Llama 3.1 8B Instruct</option>
                <option value="mistralai/Mixtral-8x7B-Instruct-v0.1">Mixtral 8x7B Instruct</option>
                <option value="Qwen/Qwen2-72B-Instruct">Qwen2 72B Instruct</option>
            </select>
        </div>

        <div class="settings-group" id="openrouterSettings" style="display: none;">
            <h3>OpenRouter Settings</h3>
            <label for="openrouterApiKey">API Key</label>
            <input type="password" id="openrouterApiKey" placeholder="Enter your OpenRouter API key">
            <div class="settings-help">
                Get your API key from <a href="https://openrouter.ai" target="_blank" style="color: var(--text-primary)">openrouter.ai</a>
            </div>
            <label for="openrouterModel">Model</label>
            <select id="openrouterModel">
                <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B Instruct</option>
                <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B Instruct</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">GPT-4o</option>
            </select>
        </div>

        <div class="settings-group" id="localSettings" style="display: none;">
            <h3>Local LLM Settings</h3>
            <label for="localEndpoint">Endpoint URL</label>
            <input type="text" id="localEndpoint" placeholder="http://localhost:11434" value="http://localhost:11434">
            <div class="settings-help">
                Default for Ollama. LM Studio typically uses http://localhost:1234
            </div>
            <label for="localModel">Model Name</label>
            <input type="text" id="localModel" placeholder="llama3.1" value="llama3.1">
            <div class="settings-help">
                The model name as configured in your local LLM server
            </div>
        </div>

        <div class="settings-actions">
            <button class="settings-btn settings-btn-secondary" id="cancelSettingsBtn">Cancel</button>
            <button class="settings-btn settings-btn-primary" id="saveSettingsBtn">Save Configuration</button>
        </div>
    </div>
</div>
`;