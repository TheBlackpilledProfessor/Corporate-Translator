import { KeywordHighlighter, buzzwords } from './keywords.js';
import { UIManager } from './ui.js';
import { HistoryManager } from './history.js';
import { Translator } from './translation.js';
import { AIProvider } from './api.js';
import * as components from './components-html.js';

// Load HTML components into the page
function loadComponents() {
    document.getElementById('sidePanelContainer').innerHTML = components.sidePanel;
    document.getElementById('headerContainer').innerHTML = components.header;
    document.getElementById('controlsContainer').innerHTML = components.controls;
    document.getElementById('translatorContainer').innerHTML = components.translator;
    document.getElementById('analysisContainer').innerHTML = components.analysisSection;
    document.getElementById('aboutContainer').innerHTML = components.aboutSection;
    document.getElementById('historyContainer').innerHTML = components.historySection;
    document.getElementById('dialogsContainer').innerHTML = components.dialogs;
    document.getElementById('settingsContainer').innerHTML = components.settingsModal;
}

// Initialize app after components are loaded
function initializeApp() {
    // Input sanitization utility
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>]/g, '');
    }

    // Dialog utility
    const dialog = {
        show(title, message, buttons) {
            const overlay = document.getElementById('dialogOverlay');
            const titleEl = document.getElementById('dialogTitle');
            const messageEl = document.getElementById('dialogMessage');
            const actionsEl = document.getElementById('dialogActions');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            actionsEl.innerHTML = '';
            
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `dialog-btn ${btn.type || 'dialog-btn-secondary'}`;
                button.textContent = btn.label;
                button.addEventListener('click', () => {
                    overlay.classList.remove('show');
                    if (btn.onClick) btn.onClick();
                });
                actionsEl.appendChild(button);
            });
            
            overlay.classList.add('show');
        },
        
        confirm(title, message, onConfirm) {
            this.show(title, message, [
                {
                    label: 'Cancel',
                    type: 'dialog-btn-secondary',
                    onClick: () => {}
                },
                {
                    label: 'Confirm',
                    type: 'dialog-btn-danger',
                    onClick: onConfirm
                }
            ]);
        },
        
        alert(title, message) {
            this.show(title, message, [
                {
                    label: 'OK',
                    type: 'dialog-btn-primary',
                    onClick: () => {}
                }
            ]);
        }
    };

    // Initialize all modules
    const aiProvider = new AIProvider();
    const uiManager = new UIManager();
    const historyManager = new HistoryManager();
    const translator = new Translator(aiProvider);

    // Keyword highlighter
    const corporateInput = document.getElementById('corporateInput');
    const tooltip = document.getElementById('tooltip');
    const charCounter = document.getElementById('charCounter');

    // Character counter
    function updateCharCounter() {
        const count = corporateInput.value.length;
        charCounter.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
    }

    corporateInput.addEventListener('input', updateCharCounter);
    updateCharCounter();

    // Side panel
    const sidePanel = document.getElementById('sidePanel');
    const sidePanelToggle = document.getElementById('sidePanelToggle');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const dictionaryList = document.getElementById('dictionaryList');
    const dictionarySearch = document.getElementById('dictionarySearch');
    const aiNotes = document.getElementById('aiNotes');

    sidePanelToggle.addEventListener('click', () => {
        sidePanel.classList.add('open');
    });

    closePanelBtn.addEventListener('click', () => {
        sidePanel.classList.remove('open');
    });

    // Populate dictionary
    function populateDictionary(filter = '') {
        const sanitizedFilter = sanitizeText(filter);
        const entries = Object.entries(buzzwords).filter(([term, data]) => {
            if (!sanitizedFilter) return true;
            return term.toLowerCase().includes(sanitizedFilter.toLowerCase()) || 
                   data.def.toLowerCase().includes(sanitizedFilter.toLowerCase());
        });

        dictionaryList.innerHTML = entries.map(([term, data]) => `
            <div class="dictionary-item">
                <div class="dictionary-term">
                    ${sanitizeHTML(term)}
                    <span class="dictionary-category">${sanitizeHTML(data.cat)}</span>
                </div>
                <div class="dictionary-def">${sanitizeHTML(data.def)}</div>
            </div>
        `).join('');
    }

    populateDictionary();

    dictionarySearch.addEventListener('input', (e) => {
        populateDictionary(e.target.value);
    });

    // Clear button
    const clearInputBtn = document.getElementById('clearInputBtn');
    clearInputBtn.addEventListener('click', () => {
        if (corporateInput.value.trim()) {
            dialog.confirm(
                'Clear Input',
                'Are you sure you want to clear all text and results?',
                () => {
                    corporateInput.value = '';
                    document.getElementById('translatedOutput').innerHTML = '<span class="placeholder">Translation will appear here...</span>';
                    document.getElementById('analysisSection').style.display = 'none';
                    aiNotes.innerHTML = '<p class="placeholder-text">AI insights will appear here after translation...</p>';
                    updateCharCounter();
                }
            );
        }
    });

    // File upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) await handleFile(file);
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await handleFile(file);
    });

    async function handleFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (ext === 'txt') {
            const text = await file.text();
            const sanitized = sanitizeText(text);
            corporateInput.value = sanitized;
            updateCharCounter();
        }
    }

    // Download button handlers
    const downloadTxt = document.getElementById('downloadTxt');
    const downloadPdf = document.getElementById('downloadPdf');

    downloadTxt.addEventListener('click', () => {
        uiManager.downloadText();
    });

    downloadPdf.addEventListener('click', () => {
        const original = corporateInput.value;
        const translated = document.getElementById('translatedOutput').textContent;
        uiManager.downloadPDF(original, translated, 'unified');
    });

    // Wire up callbacks
    translator.onTranslationComplete = (original, translated) => {
        historyManager.save(original, translated, 'unified');
        
        // Update AI notes in side panel
        setTimeout(() => {
            const notesContent = aiNotes.innerHTML;
            if (notesContent && !notesContent.includes('placeholder')) {
                // Notes already updated by translator
            }
        }, 100);
    };

    historyManager.onItemClick = (item) => {
        corporateInput.value = sanitizeText(item.original);
        const output = document.getElementById('translatedOutput');
        // Check if the translation contains HTML formatting
        if (item.translated.includes('<')) {
            output.innerHTML = item.translated;
        } else {
            output.textContent = sanitizeText(item.translated);
        }
        
        updateCharCounter();
    };

    // Highlight Actions button
    const highlightActionsBtn = document.getElementById('highlightActionsBtn');

    highlightActionsBtn.addEventListener('click', async () => {
        const text = corporateInput.value.trim();
        
        if (!text) {
            dialog.alert('No Input', 'Enter some corporate speak first to highlight actions.');
            return;
        }
        
        highlightActionsBtn.classList.add('loading');
        
        try {
            const response = await aiProvider.chat([
                {
                    role: "system",
                    content: "Identify all actionable instructions, commands, or tasks hidden in the corporate text. Return a JSON array of the exact phrases that represent actions someone is expected to take."
                },
                {
                    role: "user",
                    content: text
                }
            ], { json: true });
            
            const actions = JSON.parse(response.content);
            
            if (actions && actions.length > 0) {
                // Highlight actions directly in the input textarea by wrapping them
                dialog.alert('Actions Found', `Found ${actions.length} actionable instruction(s): ${actions.join(', ')}`);
            } else {
                dialog.alert('No Actions', 'No actionable instructions found in the text.');
            }
        } catch (error) {
            console.error('Action highlighting error:', error);
            dialog.alert('Error', 'Failed to highlight actions. Try again.');
        } finally {
            highlightActionsBtn.classList.remove('loading');
        }
    });

    // Feedback mechanism
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const submitFeedback = document.getElementById('submitFeedback');
    const cancelFeedback = document.getElementById('cancelFeedback');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackSuccess = document.getElementById('feedbackSuccess');

    feedbackBtn.addEventListener('click', () => {
        feedbackForm.style.display = 'block';
        feedbackBtn.style.display = 'none';
        feedbackSuccess.style.display = 'none';
    });

    cancelFeedback.addEventListener('click', () => {
        feedbackForm.style.display = 'none';
        feedbackBtn.style.display = 'block';
        feedbackText.value = '';
    });

    submitFeedback.addEventListener('click', async () => {
        const feedback = feedbackText.value.trim();
        const original = corporateInput.value;
        const translated = document.getElementById('translatedOutput').textContent;
        
        if (!feedback) {
            dialog.alert('Empty Feedback', 'Please enter your correction or feedback.');
            return;
        }
        
        // Store feedback locally
        const feedbackData = {
            timestamp: new Date().toISOString(),
            original,
            translated,
            feedback,
            tone: 'unified'
        };
        
        const allFeedback = JSON.parse(localStorage.getItem('translationFeedback') || '[]');
        allFeedback.push(feedbackData);
        localStorage.setItem('translationFeedback', JSON.stringify(allFeedback.slice(-50)));
        
        feedbackForm.style.display = 'none';
        feedbackSuccess.style.display = 'block';
        feedbackText.value = '';
        
        setTimeout(() => {
            feedbackSuccess.style.display = 'none';
            feedbackBtn.style.display = 'block';
        }, 3000);
    });

    // About section toggle
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutContent = document.getElementById('aboutContent');

    aboutToggle.addEventListener('click', () => {
        const isOpen = aboutContent.style.display !== 'none';
        aboutContent.style.display = isOpen ? 'none' : 'block';
        aboutToggle.textContent = isOpen ? 'About' : 'Close About';
    });

    // API Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    const apiSettingsBtn = document.getElementById('apiSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const providerSelect = document.getElementById('providerSelect');
    const togetherSettings = document.getElementById('togetherSettings');
    const openrouterSettings = document.getElementById('openrouterSettings');
    const localSettings = document.getElementById('localSettings');

    apiSettingsBtn.addEventListener('click', () => {
        // Load current settings
        providerSelect.value = aiProvider.provider;
        document.getElementById('togetherApiKey').value = aiProvider.togetherApiKey;
        document.getElementById('togetherModel').value = aiProvider.togetherModel;
        document.getElementById('openrouterApiKey').value = aiProvider.openrouterApiKey;
        document.getElementById('openrouterModel').value = aiProvider.openrouterModel;
        document.getElementById('localEndpoint').value = aiProvider.localEndpoint;
        document.getElementById('localModel').value = aiProvider.localModel;
        
        showProviderSettings(aiProvider.provider);
        settingsModal.classList.add('open');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('open');
    });

    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('open');
    });

    providerSelect.addEventListener('change', (e) => {
        showProviderSettings(e.target.value);
    });

    function showProviderSettings(provider) {
        togetherSettings.style.display = provider === 'together' ? 'block' : 'none';
        openrouterSettings.style.display = provider === 'openrouter' ? 'block' : 'none';
        localSettings.style.display = provider === 'local' ? 'block' : 'none';
    }

    saveSettingsBtn.addEventListener('click', () => {
        const config = {
            provider: providerSelect.value,
            togetherApiKey: document.getElementById('togetherApiKey').value,
            togetherModel: document.getElementById('togetherModel').value,
            openrouterApiKey: document.getElementById('openrouterApiKey').value,
            openrouterModel: document.getElementById('openrouterModel').value,
            localEndpoint: document.getElementById('localEndpoint').value,
            localModel: document.getElementById('localModel').value
        };
        
        aiProvider.saveConfig(config);
        settingsModal.classList.remove('open');
        
        // Show success message
        const msg = document.createElement('div');
        msg.textContent = '✓ Configuration saved';
        msg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,255,136,0.2); border: 1px solid #00ff88; color: #00ff88; padding: 12px 24px; z-index: 400; font-family: "Space Mono", monospace;';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    });

    // Close modal on background click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('open');
        }
    });

    // Close dialog on background click
    document.getElementById('dialogOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'dialogOverlay') {
            e.target.classList.remove('show');
        }
    });

    // Expose dialog globally for use in other modules
    window.dialog = dialog;
}

// Load components then initialize
loadComponents();
initializeApp();