/**
 * Advanced Semantic Streaming Service
 * Implements semantic chunking, contextual pauses, and variable speed
 */

class SemanticStreamingService {
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
      // All delays zeroed — stream at native network speed
      simple: { chunkDelay: 0, sentenceDelay: 0 },
      complex: { chunkDelay: 0, sentenceDelay: 0 },
      code: { chunkDelay: 0, sentenceDelay: 0 },
      formula: { chunkDelay: 0, sentenceDelay: 0 },
      list: { chunkDelay: 0, sentenceDelay: 0 },
      header: { chunkDelay: 0, sentenceDelay: 0 }
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

    // Determine overall complexity
    const complexityScore = 
      (analysis.codeBlocks * 3) +
      (analysis.formulas * 2) +
      (analysis.complexConcepts * 1.5) +
      (analysis.inlineCode * 0.5);

    if (complexityScore > 10) {
      analysis.complexity = 'high';
    } else if (complexityScore > 5) {
      analysis.complexity = 'medium';
    }

    return analysis;
  }

  /**
   * Divides text into semantic chunks
   */
  createSemanticChunks(text) {
    const chunks = [];
    let currentChunk = '';
    let currentType = 'simple';
    let position = 0;

    // Process code blocks first
    const codeBlocks = [];
    text = text.replace(this.patterns.codeBlocks, (match, offset) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({ content: match, offset, type: 'code' });
      return placeholder;
    });

    // Split by sentences
    const sentences = text.split(this.patterns.sentences);
    
    sentences.forEach((sentence, index) => {
      if (!sentence.trim()) return;

      // Restore code blocks
      let processedSentence = sentence;
      codeBlocks.forEach((block, blockIndex) => {
        processedSentence = processedSentence.replace(
          `__CODE_BLOCK_${blockIndex}__`,
          block.content
        );
      });

      // Determine content type
      const sentenceType = this.determineSentenceType(processedSentence);
      
      // If type changes or chunk is too long, create new chunk
      if (sentenceType !== currentType || currentChunk.length > 200) {
        if (currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            type: currentType,
            position: position,
            timing: this.timings[currentType] || this.timings.simple
          });
          position += currentChunk.length;
        }
        currentChunk = processedSentence;
        currentType = sentenceType;
      } else {
        currentChunk += ' ' + processedSentence;
      }
    });

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        type: currentType,
        position: position,
        timing: this.timings[currentType] || this.timings.simple
      });
    }

    return chunks;
  }

  /**
   * Determines the type of a sentence
   */
  determineSentenceType(sentence) {
    if (this.patterns.codeBlocks.test(sentence) || this.patterns.inlineCode.test(sentence)) {
      return 'code';
    }
    if (this.patterns.formulas.test(sentence)) {
      return 'formula';
    }
    if (this.patterns.headers.test(sentence)) {
      return 'header';
    }
    if (this.patterns.lists.test(sentence)) {
      return 'list';
    }
    if (this.patterns.complexConcepts.test(sentence)) {
      return 'complex';
    }
    return 'simple';
  }

  /**
   * Calculates contextual pauses based on content
   */
  calculateContextualPause(_chunk, _nextChunk) {
    return 0; // No artificial pauses — stream at native network speed
  }

  /**
   * Main semantic streaming
   */
  async streamSemanticContent(res, text, options = {}) {
    const {
      enableSemanticChunking = true,
      enableContextualPauses = true,
      enableVariableSpeed = true,
      clientInfo = {}
    } = options;

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

      // Process each chunk directly without visible metadata
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const nextChunk = chunks[i + 1];

        // Check connection
        if (res.destroyed || res.writableEnded) {
          break;
        }

        // Add a trailing space if this is not the last chunk to avoid glued words
        if (nextChunk) {
          if (!chunk.content.endsWith(' ') && !chunk.content.endsWith('\n')) {
             chunk.content += ' ';
          }
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

    } catch (error) {
      console.error('Error in semantic streaming:', error);
      if (!res.destroyed) {
        res.write('\nAn error occurred while processing the response. Please try again.\n');
        res.end();
      }
    }
  }

  /**
   * Streams chunk content with variable speed
   */
  async streamChunkContent(res, chunk, _enableVariableSpeed) {
    // Write entire chunk at once — no per-character delay
    if (!res.destroyed && !res.writableEnded) {
      res.write(chunk.content);
    }
  }

  /**
   * Traditional streaming as fallback
   */
  async streamTraditional(res, text, _options) {
    // Write all content at once — no chunked delays
    if (!res.destroyed && !res.writableEnded) {
      res.write(text);
    }
    res.end();
  }

  /**
   * Utility for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      service: 'SemanticStreamingService',
      version: '1.0.0',
      features: {
        semanticChunking: true,
        contextualPauses: true,
        variableSpeed: true,
        contentAnalysis: true
      },
      supportedTypes: Object.keys(this.timings)
    };
  }
}

export default new SemanticStreamingService();