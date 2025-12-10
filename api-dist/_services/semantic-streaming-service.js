/**
 * ✅ TypeScript Migration - Phase 2
 * Advanced Semantic Streaming Service
 * Implements semantic chunking, contextual pauses, and variable speed
 */
class SemanticStreamingService {
    patterns;
    timings;
    constructor() {
        this.patterns = {
            // Patterns to detect different types of content
            sentences: /[.!?]+\s+/g,
            codeBlocks: /```[\s\S]*?```/g,
            inlineCode: /`[^`]+`/g,
            formulas: /\$[^$]+\$/g,
            lists: /^\s*[-*+]\s+.+$/gm,
            headers: /^#{1,6}\s+.+$/gm,
            complexConcepts: /\b(algorithm|function|class|interface|implementation|architecture|optimization|performance|security|authentication|authorization|encryption|database|transaction|asynchronous|synchronous|paradigm|methodology|framework|library|dependency|configuration|deployment|scalability|maintainability|refactoring|debugging|testing|integration|abstraction|encapsulation|inheritance|polymorphism|composition|aggregation|association|coupling|cohesion|modularity|extensibility|reusability|portability|reliability|availability|consistency|integrity|durability|atomicity|isolation|concurrency|parallelism|distributed|microservices|monolithic|serverless|containerization|virtualization|orchestration|automation|continuous|pipeline|workflow|monitoring|logging|metrics|analytics|machine learning|artificial intelligence|neural network|deep learning|natural language processing|computer vision|data science|big data|blockchain|cryptocurrency|quantum computing|cloud computing|edge computing|internet of things|augmented reality|virtual reality|cybersecurity|penetration testing|vulnerability|exploit|malware|phishing|social engineering|compliance|governance|risk management|business intelligence|data warehouse|data lake|extract transform load|application programming interface|representational state transfer|graphql|websocket|http|tcp|udp|dns|ssl|tls|oauth|jwt|cors|csrf|xss|sql injection|nosql|relational database|document database|key value store|graph database|time series database|search engine|message queue|event streaming|publish subscribe|request response|client server|peer to peer|load balancing|caching|content delivery network|reverse proxy|firewall|intrusion detection|intrusion prevention|single sign on|multi factor authentication|role based access control|attribute based access control|zero trust|defense in depth|least privilege|separation of duties|fail safe|fail secure|redundancy|fault tolerance|disaster recovery|business continuity|service level agreement|key performance indicator|return on investment|total cost of ownership|proof of concept|minimum viable product|agile|scrum|kanban|devops|site reliability engineering|infrastructure as code|configuration management|version control|code review|pair programming|test driven development|behavior driven development|domain driven design|event driven architecture|service oriented architecture|representational state transfer|microservices architecture|serverless architecture|event sourcing|command query responsibility segregation|hexagonal architecture|clean architecture|onion architecture|layered architecture|model view controller|model view presenter|model view viewmodel|observer pattern|strategy pattern|factory pattern|singleton pattern|adapter pattern|decorator pattern|facade pattern|proxy pattern|command pattern|state pattern|template method pattern|visitor pattern|iterator pattern|composite pattern|bridge pattern|flyweight pattern|chain of responsibility pattern|mediator pattern|memento pattern|prototype pattern|builder pattern|abstract factory pattern|dependency injection|inversion of control|aspect oriented programming|functional programming|object oriented programming|procedural programming|declarative programming|imperative programming|reactive programming|event driven programming|data driven programming|test driven development|behavior driven development|domain driven design|feature driven development|extreme programming|lean software development|rapid application development|spiral model|waterfall model|v model|incremental model|iterative model|prototype model|rad model|agile model|scrum framework|kanban method|lean startup|design thinking|user experience|user interface|human computer interaction|accessibility|internationalization|localization|responsive design|progressive web application|single page application|server side rendering|client side rendering|static site generation|jamstack|headless cms|content management system|customer relationship management|enterprise resource planning|supply chain management|business process management|workflow management|project management|knowledge management|document management|digital asset management|web content management|learning management system|human resource management|financial management|inventory management|quality management|risk management|compliance management|governance risk compliance|information technology infrastructure library|control objectives for information technologies|payment card industry data security standard|general data protection regulation|health insurance portability accountability act|sarbanes oxley act|federal information security management act|national institute standards technology|international organization standardization|institute electrical electronics engineers|internet engineering task force|world wide web consortium|open web application security project|sans institute|mitre corporation|common vulnerabilities exposures|common vulnerability scoring system|national vulnerability database|computer emergency response team|information sharing analysis center|cybersecurity information sharing act|cybersecurity framework|zero trust architecture|secure development lifecycle|threat modeling|penetration testing|vulnerability assessment|security audit|compliance audit|risk assessment|business impact analysis|disaster recovery planning|business continuity planning|incident response planning|crisis management|change management|configuration management|asset management|vendor management|third party risk management|supply chain risk management|operational risk management|financial risk management|strategic risk management|reputational risk management|legal risk management|regulatory risk management)\b/gi
        };
        this.timings = {
            // Timing configurations for different content types
            simple: { chunkDelay: 15, sentenceDelay: 50 },
            complex: { chunkDelay: 25, sentenceDelay: 150 },
            code: { chunkDelay: 30, sentenceDelay: 100 },
            formula: { chunkDelay: 40, sentenceDelay: 200 },
            list: { chunkDelay: 20, sentenceDelay: 80 },
            header: { chunkDelay: 10, sentenceDelay: 120 }
        };
    }
    /**
     * Analyzes content and determines its complexity
     */
    analyzeContent(text) {
        const analysis = {
            totalLength: text.length,
            sentences: (text.match(this.patterns.sentences) || []).length,
            codeBlocks: (text.match(this.patterns.codeBlocks) || []).length,
            inlineCode: (text.match(this.patterns.inlineCode) || []).length,
            formulas: (text.match(this.patterns.formulas) || []).length,
            lists: (text.match(this.patterns.lists) || []).length,
            headers: (text.match(this.patterns.headers) || []).length,
            complexConcepts: (text.match(this.patterns.complexConcepts) || []).length,
            complexity: 'simple'
        };
        // Determine general complexity
        const complexityScore = (analysis.codeBlocks * 3) +
            (analysis.formulas * 2) +
            (analysis.complexConcepts * 1.5) +
            (analysis.inlineCode * 0.5);
        if (complexityScore > 10) {
            analysis.complexity = 'high';
        }
        else if (complexityScore > 5) {
            analysis.complexity = 'medium';
        }
        else {
            analysis.complexity = 'simple';
        }
        return analysis;
    }
    /**
     * Splits text into semantic chunks
     * ✅ IMPROVED: Preserve markdown formatting (headers, lists, line breaks)
     */
    createSemanticChunks(text) {
        const chunks = [];
        let currentChunk = '';
        let currentType = 'simple';
        let position = 0;
        // ✅ Split by paragraphs first to preserve markdown structure
        const paragraphs = text.split(/\n\n+/);
        paragraphs.forEach((paragraph, index) => {
            if (!paragraph.trim())
                return;
            // Determine content type
            const paragraphType = this.determineSentenceType(paragraph);
            // Each paragraph becomes a chunk (preserves markdown)
            chunks.push({
                content: paragraph,
                type: paragraphType,
                position: position,
                timing: this.timings[paragraphType] || this.timings.simple
            });
            position += paragraph.length;
            // Add paragraph separator back (unless last paragraph)
            if (index < paragraphs.length - 1) {
                chunks.push({
                    content: '\n\n',
                    type: 'separator',
                    position: position,
                    timing: { chunkDelay: 5, sentenceDelay: 20 }
                });
                position += 2;
            }
        });
        return chunks;
    }
    /**
     * Determines the type of a sentence/paragraph
     * ✅ IMPROVED: Better detection for markdown elements
     */
    determineSentenceType(sentence) {
        // Check for code blocks (highest priority)
        if (this.patterns.codeBlocks.test(sentence) || sentence.includes('```')) {
            return 'code';
        }
        // Check for inline code
        if (this.patterns.inlineCode.test(sentence) || /`[^`]+`/.test(sentence)) {
            return 'code';
        }
        // Check for formulas
        if (this.patterns.formulas.test(sentence)) {
            return 'formula';
        }
        // Check for headers (markdown)
        if (/^#{1,6}\s+/.test(sentence) || this.patterns.headers.test(sentence)) {
            return 'header';
        }
        // Check for lists (markdown)
        if (/^\s*[-*+]\s+/m.test(sentence) || /^\s*\d+\.\s+/m.test(sentence)) {
            return 'list';
        }
        // Check for complex concepts
        if (this.patterns.complexConcepts.test(sentence)) {
            return 'complex';
        }
        return 'simple';
    }
    /**
     * Calculates contextual pauses based on content
     */
    calculateContextualPause(chunk, nextChunk) {
        let basePause = chunk.timing.sentenceDelay;
        // Additional pauses based on transitions
        if (chunk.type === 'complex' && nextChunk?.type !== 'complex') {
            basePause += 100; // Pause after complex concepts
        }
        if (chunk.type === 'code' && nextChunk?.type !== 'code') {
            basePause += 80; // Pause after code
        }
        if (chunk.type === 'formula') {
            basePause += 150; // Extra pause for formulas
        }
        if (chunk.content.includes('\n\n')) {
            basePause += 200; // Pause for paragraphs
        }
        return Math.min(basePause, 500); // Maximum 500ms
    }
    /**
     * Main semantic streaming
     */
    async streamSemanticContent(res, text, options = {}) {
        const { enableSemanticChunking = true, enableContextualPauses = true, enableVariableSpeed = true, clientInfo = {} } = options;
        // Configure optimized headers
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Semantic-Streaming', 'enabled');
        try {
            if (!enableSemanticChunking) {
                // Fallback to traditional streaming
                return this.streamTraditional(res, text, options);
            }
            // Analyze content
            const analysis = this.analyzeContent(text);
            res.setHeader('X-Content-Analysis', JSON.stringify(analysis));
            // Create semantic chunks
            const chunks = this.createSemanticChunks(text);
            await this.delay(50);
            // Process each chunk directly without visible metadata
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const nextChunk = chunks[i + 1];
                // Check connection
                if (res.destroyed || res.writableEnded) {
                    break;
                }
                // Stream chunk content with variable speed
                await this.streamChunkContent(res, chunk, enableVariableSpeed);
                // Contextual pause
                if (enableContextualPauses && nextChunk) {
                    const pauseDuration = this.calculateContextualPause(chunk, nextChunk);
                    await this.delay(pauseDuration);
                }
            }
            // Finalize stream without visible tags
            res.end();
        }
        catch (error) {
            console.error('Error in semantic streaming:', error);
            if (!res.destroyed) {
                res.write('\nAn error occurred while processing the response. Please try again.\n');
                res.end();
            }
        }
    }
    /**
     * Stream chunk content with variable speed
     * ✅ IMPROVED: Preserve markdown formatting by streaming word-by-word instead of char-by-char
     */
    async streamChunkContent(res, chunk, enableVariableSpeed) {
        const content = chunk.content;
        const timing = chunk.timing;
        if (!enableVariableSpeed) {
            // Send entire content at once to preserve markdown
            res.write(content);
            await this.delay(timing.sentenceDelay);
            return;
        }
        // ✅ WORD-BY-WORD streaming with markdown preservation
        // Split by whitespace but preserve markdown special characters
        const tokens = content.split(/(\s+|[.!?,;:\n]+)/);
        for (let i = 0; i < tokens.length; i++) {
            if (res.destroyed || res.writableEnded)
                break;
            const token = tokens[i];
            if (!token)
                continue;
            // Send the token (word + whitespace)
            res.write(token);
            // Adaptive timing based on token type
            if (/^\n+$/.test(token)) {
                // Line breaks: short pause to preserve formatting
                await this.delay(5);
            }
            else if (/[.!?]$/.test(token)) {
                // End of sentence: longer pause
                await this.delay(timing.sentenceDelay * 0.2);
            }
            else if (/[,;:]$/.test(token)) {
                // Mid-sentence punctuation: short pause
                await this.delay(timing.chunkDelay * 0.3);
            }
            else if (token.trim().length > 0) {
                // Regular word: minimal pause
                await this.delay(timing.chunkDelay * 0.5);
            }
        }
    }
    /**
     * Traditional streaming as fallback
     */
    async streamTraditional(res, text, options) {
        // Optimizations for improved performance
        const chunkSize = options.chunkSize || 50; // Increased to send more data at once
        const delayMs = options.fastMode ? 5 : (options.delayMs || 10); // Reduced delay or ultra-fast mode
        let lastSentIndex = 0;
        try {
            // Send larger portions to improve speed
            for (let i = 0; i < text.length; i += chunkSize) {
                if (res.destroyed || res.writableEnded)
                    break;
                const chunk = text.slice(i, i + chunkSize);
                res.write(chunk);
                lastSentIndex = i + chunkSize;
                // Only add delay if not ultra-fast mode
                if (!options.fastMode && i + chunkSize < text.length) {
                    await this.delay(delayMs);
                }
            }
        }
        catch (error) {
            console.error('Error in traditional streaming:', error);
            // Try to send remaining text without delays
            if (text.length > lastSentIndex && !res.writableEnded) {
                res.write(text.slice(lastSentIndex));
            }
        }
        finally {
            // Ensure stream closes correctly
            if (!res.writableEnded) {
                res.end();
            }
        }
    }
    /**
     * Helper for delays
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * ASEGURAR: Método para calcular delay óptimo
     */
    calculateOptimalDelay(chunk) {
        // Sin delay para chunks pequeños
        if (chunk.length < 10)
            return 0;
        // Delay más largo para fin de párrafo
        if (chunk.endsWith('\n\n'))
            return 50;
        // Delay corto para fin de oración
        if (chunk.match(/[.!?]\s*$/))
            return 30;
        // Delay mínimo para el resto
        return 10;
    }
    buffer = '';
    isInCodeBlock = false;
    codeBlockBuffer = '';
    /**
     * ASEGURAR: Flush final del buffer
     */
    flush() {
        const remaining = this.buffer;
        this.buffer = '';
        this.isInCodeBlock = false;
        this.codeBlockBuffer = '';
        return remaining ? [remaining] : [];
    }
}
// Create and export an instance of the service
export default new SemanticStreamingService();
export { SemanticStreamingService };
