// Translation history management

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

export class HistoryManager {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        this.searchQuery = '';
        
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historySearch = document.getElementById('historySearch');
        
        this.init();
    }

    init() {
        this.render();
        
        this.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Clear all translation history?')) {
                this.history = [];
                localStorage.removeItem('translationHistory');
                this.render();
            }
        });

        this.historySearch.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filter();
        });
    }

    save(original, translated, tone) {
        const historyItem = {
            id: Date.now(),
            original: sanitizeText(original),
            translated: sanitizeText(translated),
            tone: sanitizeText(tone),
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        this.history = this.history.slice(0, 20);
        localStorage.setItem('translationHistory', JSON.stringify(this.history));
        this.render();
    }

    render() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<span class="placeholder">No translations yet...</span>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const date = new Date(item.timestamp);
            const timeAgo = this.getTimeAgo(date);
            const sanitizedOriginal = sanitizeText(item.original);
            const preview = sanitizedOriginal.substring(0, 80) + (sanitizedOriginal.length > 80 ? '...' : '');
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-meta">
                        <span class="history-time">${sanitizeHTML(timeAgo)}</span>
                        <span class="history-tone">${sanitizeHTML(item.tone)}</span>
                    </div>
                    <div class="history-preview">${sanitizeHTML(preview)}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const historyItem = this.history.find(h => h.id === id);
                if (historyItem) {
                    this.onItemClick(historyItem);
                }
            });
        });
        
        if (this.searchQuery) {
            this.filter();
        }
    }

    filter() {
        const sanitizedQuery = sanitizeText(this.searchQuery);
        const items = document.querySelectorAll('.history-item');
        items.forEach(item => {
            const id = parseInt(item.dataset.id);
            const historyItem = this.history.find(h => h.id === id);
            if (historyItem) {
                const matchesSearch = 
                    historyItem.original.toLowerCase().includes(sanitizedQuery) ||
                    historyItem.translated.toLowerCase().includes(sanitizedQuery) ||
                    historyItem.tone.toLowerCase().includes(sanitizedQuery);
                item.classList.toggle('hidden', !matchesSearch);
            }
        });
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    onItemClick(item) {
        // This will be overridden by the main script
    }
}