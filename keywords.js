// Corporate buzzword dictionary with categories and tooltip handling

// Input sanitization
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export const buzzwords = {
    'synergy': { def: 'Working together (supposedly)', cat: 'management' },
    'leverage': { def: 'Use', cat: 'finance' },
    'bandwidth': { def: 'Time or capacity', cat: 'tech' },
    'circle back': { def: 'Talk later (maybe never)', cat: 'management' },
    'touch base': { def: 'Meet or talk', cat: 'management' },
    'low-hanging fruit': { def: 'Easy tasks', cat: 'management' },
    'move the needle': { def: 'Make progress', cat: 'management' },
    'paradigm shift': { def: 'Big change', cat: 'management' },
    'think outside the box': { def: 'Be creative', cat: 'management' },
    'run it up the flagpole': { def: 'Test an idea', cat: 'management' },
    'drill down': { def: 'Look closer', cat: 'management' },
    'take it offline': { def: 'Discuss privately', cat: 'management' },
    'action items': { def: 'Tasks', cat: 'management' },
    'deliverables': { def: 'Things to produce', cat: 'management' },
    'stakeholders': { def: 'People involved', cat: 'finance' },
    'buy-in': { def: 'Agreement or support', cat: 'management' },
    'value-add': { def: 'Benefit', cat: 'finance' },
    'alignment': { def: 'Agreement', cat: 'management' },
    'best practices': { def: 'Good methods', cat: 'management' },
    'core competency': { def: 'Main skill', cat: 'hr' },
    'disrupt': { def: 'Change an industry', cat: 'tech' },
    'ecosystem': { def: 'Business environment', cat: 'tech' },
    'holistic': { def: 'Complete or comprehensive', cat: 'management' },
    'seamless': { def: 'Smooth', cat: 'tech' },
    'scalable': { def: 'Can grow', cat: 'tech' },
    'robust': { def: 'Strong', cat: 'tech' },
    'agile': { def: 'Flexible', cat: 'tech' },
    'optimize': { def: 'Improve', cat: 'tech' },
    'streamline': { def: 'Simplify', cat: 'management' },
    'fast-paced': { def: 'Busy and stressful', cat: 'hr' },
    'self-starter': { def: 'Work without supervision', cat: 'hr' },
    'rockstar': { def: 'Very good worker', cat: 'hr' },
    'ninja': { def: 'Expert', cat: 'hr' },
    'guru': { def: 'Expert', cat: 'hr' },
    'evangelist': { def: 'Promoter', cat: 'hr' },
    'ideate': { def: 'Think of ideas', cat: 'management' },
    'pivot': { def: 'Change direction', cat: 'management' },
    'deep dive': { def: 'Thorough analysis', cat: 'management' },
    'boil the ocean': { def: 'Waste time on impossible task', cat: 'management' },
    'scope creep': { def: 'Project expanding beyond plan', cat: 'management' },
    'pain points': { def: 'Problems', cat: 'management' },
    'roi': { def: 'Return on investment', cat: 'finance' },
    'kpi': { def: 'Key performance indicator', cat: 'finance' },
    'key takeaways': { def: 'Main points', cat: 'management' },
    'onboarding': { def: 'Training new hires', cat: 'hr' },
    'culture fit': { def: 'Personality match', cat: 'hr' },
    'competitive compensation': { def: 'Decent pay (maybe)', cat: 'hr' },
    'equity': { def: 'Stock ownership', cat: 'finance' },
    'runway': { def: 'Time until money runs out', cat: 'finance' },
    'burn rate': { def: 'Monthly spending', cat: 'finance' }
};

export class KeywordHighlighter {
    constructor(inputElement, highlightedElement, tooltipElement) {
        this.inputElement = inputElement;
        this.highlightedElement = highlightedElement;
        this.tooltipElement = tooltipElement;
        
        this.inputElement.addEventListener('input', () => this.highlight());
        document.addEventListener('scroll', () => this.hideTooltip());
    }

    highlight() {
        const text = this.inputElement.value;
        let highlighted = text;
        
        // Sort buzzwords by length (longest first) to avoid partial matches
        const sortedBuzzwords = Object.keys(buzzwords).sort((a, b) => b.length - a.length);
        
        for (let word of sortedBuzzwords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const category = buzzwords[word].cat;
            highlighted = highlighted.replace(regex, (match) => {
                return `<span class="keyword" data-term="${word.toLowerCase()}" data-category="${category}">${match}</span>`;
            });
        }
        
        this.highlightedElement.innerHTML = highlighted;
        
        // Add event listeners to keywords for tooltips
        const keywords = this.highlightedElement.querySelectorAll('.keyword');
        keywords.forEach(keyword => {
            keyword.addEventListener('mouseenter', (e) => this.showTooltip(e));
            keyword.addEventListener('mouseleave', () => this.hideTooltip());
            keyword.addEventListener('touchstart', (e) => this.showTooltip(e));
        });
    }

    showTooltip(e) {
        const term = e.target.dataset.term;
        const buzzword = buzzwords[term];
        
        if (buzzword) {
            this.tooltipElement.textContent = sanitizeHTML(buzzword.def);
            this.tooltipElement.classList.add('show');
            
            const rect = e.target.getBoundingClientRect();
            this.tooltipElement.style.left = `${rect.left}px`;
            this.tooltipElement.style.top = `${rect.bottom + 5}px`;
        }
    }

    hideTooltip() {
        this.tooltipElement.classList.remove('show');
    }
}