import { KeywordHighlighter, buzzwords } from './keywords.js';
import { UIManager } from './ui.js';
import { HistoryManager } from './history.js';
import { Translator } from './translation.js';

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

// Initialize all modules
const uiManager = new UIManager();
const historyManager = new HistoryManager();
const translator = new Translator();

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
    corporateInput.value = '';
    document.getElementById('translatedOutput').innerHTML = '<span class="placeholder">Translation will appear here...</span>';
    document.getElementById('analysisSection').style.display = 'none';
    aiNotes.innerHTML = '<p class="placeholder-text">AI insights will appear here after translation...</p>';
    updateCharCounter();
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
        alert('Enter some corporate speak first to highlight actions.');
        return;
    }
    
    highlightActionsBtn.classList.add('loading');
    
    try {
        const response = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Identify all actionable instructions, commands, or tasks hidden in the corporate text. Return a JSON array of the exact phrases that represent actions someone is expected to take."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            json: true
        });
        
        const actions = JSON.parse(response.content);
        
        if (actions && actions.length > 0) {
            let highlightedText = highlightedInput.innerHTML;
            
            // Highlight actions directly in the input textarea by wrapping them
            alert(`Found ${actions.length} actionable instruction(s): ${actions.join(', ')}`);
        } else {
            alert('No actionable instructions found in the text.');
        }
    } catch (error) {
        console.error('Action highlighting error:', error);
        alert('Failed to highlight actions. Try again.');
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
        alert('Please enter your correction or feedback.');
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

// removed: buzzwords dictionary (moved to keywords.js)
// removed: highlightKeywords() (moved to KeywordHighlighter class)
// removed: showTooltip() (moved to KeywordHighlighter class)
// removed: hideTooltip() (moved to KeywordHighlighter class)
// removed: setTheme() (moved to UIManager class)
// removed: setFontSize() (moved to UIManager class)
// removed: copyToClipboard handler (moved to UIManager class)
// removed: downloadText() (moved to UIManager class)
// removed: downloadPDF() (moved to UIManager class)
// removed: saveToHistory() (moved to HistoryManager class)
// removed: renderHistory() (moved to HistoryManager class)
// removed: getTimeAgo() (moved to HistoryManager class)
// removed: filterHistory() (moved to HistoryManager class)
// removed: translate() (moved to Translator class)
// removed: tone button handlers (moved to Translator class)
// removed: realtime toggle handler (moved to Translator class)