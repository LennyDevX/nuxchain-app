/**
 * API UX Enhancement Service
 * Optimized for production streaming
 * Provides lightweight utilities for enhancing user experience
 */

class APIUXEnhancementService {
  constructor() {
    // Simplified storage for active sessions
    this.activeSessions = new Map();
    
    // Minimal typing states required for production
    this.typingStates = {
      THINKING: 'thinking',
      TYPING: 'typing',
      STREAMING: 'streaming',
      COMPLETE: 'complete'
    };
  }

  /**
   * Creates a minimal typing indicator
   */
  createTypingIndicator(sessionId, options = {}) {
    const {
      type = this.typingStates.THINKING,
      customMessage = null
    } = options;

    // Store minimal session data (English only)
    const sessionData = {
      id: sessionId,
      type,
      startTime: Date.now(),
      customMessage,
      isActive: true
    };

    this.activeSessions.set(sessionId, sessionData);
    return this.generateTypingIndicatorData(sessionData);
  }

  /**
   * Updates typing indicator state
   */
  updateTypingIndicator(sessionId, newState, options = {}) {
    const sessionData = this.activeSessions.get(sessionId);
    if (!sessionData) return null;

    sessionData.type = newState;
    sessionData.lastUpdate = Date.now();
    
    if (options.customMessage) {
      sessionData.customMessage = options.customMessage;
    }

    return this.generateTypingIndicatorData(sessionData);
  }

  /**
   * Generates formatted typing indicator data
   */
  generateTypingIndicatorData(sessionData) {
    // English-only messages for user experience
    const messages = {
      [this.typingStates.THINKING]: {
        text: sessionData.customMessage || 'Thinking...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.TYPING]: {
        text: sessionData.customMessage || 'Writing response...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.STREAMING]: {
        text: sessionData.customMessage || 'Streaming...',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      }
    };

    // Get message data for the current state
    const messageData = messages[sessionData.type] || messages[this.typingStates.THINKING];
    
    // Simple dot animation without frame tracking
    const dots = messageData.dots;
    const frameIndex = Math.floor((Date.now() - sessionData.startTime) / 100) % dots.length;
    const currentDot = dots[frameIndex];

    return {
      sessionId: sessionData.id,
      type: 'typing_indicator',
      state: sessionData.type,
      message: messageData.text,
      animatedDot: currentDot,
      timestamp: Date.now(),
      isActive: sessionData.isActive
    };
  }

  /**
   * Cleans up resources for a session
   */
  cleanupSession(sessionId) {
    this.activeSessions.delete(sessionId);
  }

  /**
   * Simple response formatting
   */
  formatResponse(sessionId, data, status = 'success') {
    return {
      sessionId,
      status,
      data,
      timestamp: Date.now(),
      metadata: {
        uxEnhanced: true,
        processingTime: Date.now() - (this.activeSessions.get(sessionId)?.startTime || Date.now())
      }
    };
  }

  /**
   * Health check for the service
   */
  getHealth() {
    return {
      status: 'healthy',
      activeSessions: this.activeSessions.size,
      memoryUsage: process.memoryUsage().rss / 1024 / 1024 + ' MB'
    };
  }
}

// Export a singleton instance
module.exports = new APIUXEnhancementService();