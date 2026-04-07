// AI translation logic and analysis

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

export class Translator {
    constructor() {
        this.realtimeEnabled = false;
        this.debounceTimer = null;
        
        this.corporateInput = document.getElementById('corporateInput');
        this.translatedOutput = document.getElementById('translatedOutput');
        this.translateBtn = document.getElementById('translateBtn');
        this.realtimeToggle = document.getElementById('realtimeToggle');
        this.analysisSection = document.getElementById('analysisSection');
        this.sentimentBadge = document.getElementById('sentimentBadge');
        this.intentContent = document.getElementById('intentContent');
        this.suggestionsList = document.getElementById('suggestionsList');
        
        this.init();
    }

    init() {
        // Realtime toggle
        this.realtimeToggle.addEventListener('change', (e) => {
            this.realtimeEnabled = e.target.checked;
            if (this.realtimeEnabled && this.corporateInput.value.trim()) {
                this.translate();
            }
        });

        // Input handler for realtime
        this.corporateInput.addEventListener('input', () => {
            if (this.realtimeEnabled) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.translate();
                }, 1000);
            }
        });

        // Translate button
        this.translateBtn.addEventListener('click', () => {
            this.translate();
        });

        // Allow Enter key to translate (Ctrl/Cmd + Enter)
        this.corporateInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.translate();
            }
        });
    }

    async translate() {
        const text = sanitizeText(this.corporateInput.value.trim());
        
        if (!text) {
            const outputElement = document.getElementById('translatedOutput');
            if (outputElement) {
                outputElement.innerHTML = '<span class="placeholder">Enter some corporate speak first...</span>';
            }
            this.analysisSection.style.display = 'none';
            return;
        }
        
        this.translateBtn.classList.add('loading');
        const outputElement = document.getElementById('translatedOutput');
        if (outputElement) {
            outputElement.innerHTML = '<span class="placeholder">Translating...</span>';
        }
        this.analysisSection.style.display = 'none';
        
        try {
            const unifiedSystemPrompt = `You are a sharp, no-nonsense translator who combines blunt directness, sarcastic wit, and cynical realism to decode corporate jargon. Cut through the BS with straightforward language while exposing the manipulation and absurdity hiding beneath business speak. Be honest about what they're really saying and the darker truths of modern corporate culture.

Format your response like a human would write it:
- Start with a brief, punchy title wrapped in <h3> tags
- Break your translation into logical paragraphs using <p> tags
- Each paragraph should focus on a specific idea or aspect
- Use natural paragraph breaks for readability`;
            
            // Get translation
            const translationPromise = websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: unifiedSystemPrompt
                    },
                    {
                        role: "user",
                        content: `Translate this corporate speak into plain language. Format with a title in <h3> tags and separate paragraphs in <p> tags:\n\n${text}`
                    }
                ]
            });

            // Get sentiment analysis
            const sentimentPromise = websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Analyze the sentiment of corporate text. Classify as one of: "neutral", "passive-aggressive", or "inflated". Respond with just the sentiment word.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            });

            // Get intent explanation
            const intentPromise = websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Explain the underlying intent or goal behind this corporate statement in 1-2 concise sentences. Be direct about what they're really trying to achieve.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            });

            // Get alternative phrasings
            const suggestionsPromise = websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Provide 3 alternative plain-language phrasings for this corporate text. Each should be clear, direct, and honest. Return them as a JSON array of strings.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                json: true
            });

            const [translation, sentiment, intent, suggestions] = await Promise.all([
                translationPromise,
                sentimentPromise,
                intentPromise,
                suggestionsPromise
            ]);
            
            // Convert markdown to HTML if present
            let formattedContent = translation.content;
            
            // Convert ### headers to <h3>
            formattedContent = formattedContent.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
            // Convert ## headers to <h3> as well
            formattedContent = formattedContent.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
            // Convert double line breaks to paragraph breaks
            formattedContent = formattedContent.split('\n\n').map(para => {
                para = para.trim();
                if (!para.startsWith('<h3>')) {
                    return `<p>${para}</p>`;
                }
                return para;
            }).join('\n');
            
            // Allow basic HTML tags for formatting
            const allowedTags = ['h3', 'p', 'br', 'strong', 'em'];
            
            // Create a temporary div to parse HTML safely
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedContent;
            
            // Remove any script tags or dangerous content
            const scripts = tempDiv.querySelectorAll('script, iframe, object, embed');
            scripts.forEach(s => s.remove());
            
            // Only keep allowed tags
            const allElements = tempDiv.querySelectorAll('*');
            allElements.forEach(el => {
                if (!allowedTags.includes(el.tagName.toLowerCase())) {
                    // Replace with text content
                    el.replaceWith(document.createTextNode(el.textContent));
                }
            });
            
            // Ensure we're updating the correct element (translation output, not highlighted input)
            const outputElement = document.getElementById('translatedOutput');
            if (outputElement) {
                outputElement.innerHTML = tempDiv.innerHTML;
            }
            this.translatedOutput = outputElement;
            
            const sentimentText = sanitizeText(sentiment.content.toLowerCase().trim());
            this.sentimentBadge.textContent = sentimentText.charAt(0).toUpperCase() + sentimentText.slice(1);
            this.sentimentBadge.className = 'sentiment-badge sentiment-' + sentimentText.replace(/\s+/g, '-');
            
            this.intentContent.textContent = sanitizeText(intent.content);
            
            let suggestionArray = [];
            try {
                suggestionArray = JSON.parse(suggestions.content);
                if (!Array.isArray(suggestionArray)) {
                    suggestionArray = [suggestions.content];
                }
            } catch {
                suggestionArray = [suggestions.content];
            }
            
            this.suggestionsList.innerHTML = suggestionArray.map(suggestion => 
                `<div class="suggestion-item">${sanitizeHTML(suggestion)}</div>`
            ).join('');

            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.translatedOutput.textContent = item.textContent;
                });
            });
            
            this.analysisSection.style.display = 'grid';
            
            // Generate AI notes
            this.generateAINotes(text, translation.content);
            
            // Add animation
            this.translatedOutput.classList.remove('updated');
            void this.translatedOutput.offsetWidth; // Trigger reflow
            this.translatedOutput.classList.add('updated');
            
            // Show feedback section
            document.getElementById('feedbackSection').style.display = 'block';
            
            // Trigger save callback
            if (this.onTranslationComplete) {
                this.onTranslationComplete(text, translation.content);
            }
            
        } catch (error) {
            const outputElement = document.getElementById('translatedOutput');
            if (outputElement) {
                outputElement.innerHTML = '<span class="placeholder" style="color: #ff4444;">Translation failed. Try again.</span>';
            }
            console.error('Translation error:', error);
        } finally {
            this.translateBtn.classList.remove('loading');
        }
    }

    async generateAINotes(original, translated) {
        const aiNotesDiv = document.getElementById('aiNotes');
        aiNotesDiv.innerHTML = '<p class="placeholder-text">Generating insights...</p>';
        
        try {
            const notes = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Provide 2-3 brief bullet points about what makes this corporate text problematic or manipulative. Be insightful and critical."
                    },
                    {
                        role: "user",
                        content: `Original: ${original}\n\nTranslation: ${translated}`
                    }
                ]
            });
            
            aiNotesDiv.innerHTML = `<div style="font-size: 0.85rem; line-height: 1.6;">${sanitizeHTML(notes.content)}</div>`;
        } catch (error) {
            aiNotesDiv.innerHTML = '<p class="placeholder-text">Failed to generate insights.</p>';
        }
    }

    onTranslationComplete(original, translated, tone) {
        // This will be overridden by the main script
    }
}