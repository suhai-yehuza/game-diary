interface ISessionData {
  userId: string;
  lastActivity: number;
  permissions: string[];
  sessionId: string;
  deviceInfo?: {
    userAgent: string;
    ip: string;
  };
}

class SessionManager {
  private readonly sessions = new Map<string, ISessionData>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), this.CLEANUP_INTERVAL);
  }

  createSession(
    userId: string,
    permissions: string[] = [],
    deviceInfo?: { userAgent: string; ip: string }
  ): string {
    const sessionId = this.generateSessionId();

    this.sessions.set(sessionId, {
      userId,
      lastActivity: Date.now(),
      permissions,
      sessionId,
      deviceInfo,
    });

    return sessionId;
  }

  validateSession(sessionId: string): ISessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    this.sessions.set(sessionId, session);

    return session;
  }

  refreshSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.lastActivity = Date.now();
    this.sessions.set(sessionId, session);

    return true;
  }

  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  revokeAllUserSessions(userId: string): number {
    let count = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    return count;
  }

  getUserSessions(userId: string): ISessionData[] {
    const userSessions: ISessionData[] = [];

    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[SESSION MANAGER] Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Types for external use
export type { ISessionData as SessionData };
