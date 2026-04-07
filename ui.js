// UI state management: theme, font size, and copy functionality

// Input sanitization
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>]/g, '');
}

export class UIManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.fontSize = parseInt(localStorage.getItem('fontSize') || '95');
        
        this.themeSelect = document.getElementById('themeSelect');
        this.fontIncrease = document.getElementById('fontIncrease');
        this.fontDecrease = document.getElementById('fontDecrease');
        this.copyBtn = document.getElementById('copyBtn');
        
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.setFontSize(this.fontSize);
        this.themeSelect.value = this.currentTheme;
        
        this.themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        this.fontIncrease.addEventListener('click', () => {
            this.setFontSize(this.fontSize + 10);
        });

        this.fontDecrease.addEventListener('click', () => {
            this.setFontSize(this.fontSize - 10);
        });

        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = '';
        
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else if (theme === 'blackpill') {
            document.body.classList.add('blackpill-mode');
        } else if (theme === 'void') {
            document.body.classList.add('void-mode');
        } else if (theme === 'matrix') {
            document.body.classList.add('matrix-mode');
        }
        
        localStorage.setItem('theme', theme);
    }

    setFontSize(size) {
        this.fontSize = Math.max(70, Math.min(130, size));
        document.querySelectorAll('textarea, .output, .highlighted-view').forEach(el => {
            el.style.fontSize = `${this.fontSize / 100}rem`;
        });
        localStorage.setItem('fontSize', this.fontSize);
    }

    async copyToClipboard() {
        const translatedOutput = document.getElementById('translatedOutput');
        // Get text content, preserving line breaks from paragraphs
        const text = translatedOutput.innerText || translatedOutput.textContent;
        
        if (text && !text.includes('Translation will appear')) {
            try {
                await navigator.clipboard.writeText(text);
                this.copyBtn.classList.add('copied');
                this.copyBtn.querySelector('.copy-text').textContent = 'Copied!';
                setTimeout(() => {
                    this.copyBtn.classList.remove('copied');
                    this.copyBtn.querySelector('.copy-text').textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    }

    downloadText() {
        const translatedOutput = document.getElementById('translatedOutput');
        // Get text content, preserving line breaks from paragraphs
        const text = translatedOutput.innerText || translatedOutput.textContent;
        
        if (text && !text.includes('Translation will appear')) {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `translation_${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    downloadPDF(original, translated, tone) {
        const translatedOutput = document.getElementById('translatedOutput');
        if (!translatedOutput || translatedOutput.textContent.includes('Translation will appear')) {
            return;
        }
        
        const sentiment = sanitizeHTML(document.getElementById('sentimentBadge')?.textContent || 'N/A');
        const intent = sanitizeHTML(document.getElementById('intentContent')?.textContent || 'N/A');
        const suggestions = Array.from(document.querySelectorAll('.suggestion-item'))
            .map(s => sanitizeHTML(s.textContent)).join('\n• ');
        
        // Get formatted translation HTML
        const translatedHTML = translatedOutput.innerHTML;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { font-size: 24px; margin-bottom: 20px; }
                    h2 { font-size: 16px; margin-top: 30px; margin-bottom: 10px; opacity: 0.7; }
                    p { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
                    .meta { font-size: 12px; opacity: 0.6; margin-bottom: 20px; }
                    .context { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 3px solid #333; }
                </style>
            </head>
            <body>
                <h1>Corporate Speak Translation</h1>
                <div class="meta">Tone: ${sanitizeHTML(tone)} | Date: ${new Date().toLocaleString()}</div>
                
                <h2>Original Corporate Speak:</h2>
                <p>${sanitizeHTML(original)}</p>
                
                <h2>Plain Language Translation:</h2>
                <div>${translatedHTML}</div>
                
                <div class="context">
                    <h2>Analysis Context:</h2>
                    <p><strong>Sentiment:</strong> ${sentiment}</p>
                    <p><strong>Underlying Intent:</strong> ${intent}</p>
                    ${suggestions ? `<p><strong>Alternative Phrasings:</strong><br>• ${suggestions}</p>` : ''}
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    }
}