import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Use the same base URL as API but without /api/v1
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:5000');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Socket connected');
      this._emit('socket:connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Socket disconnected:', reason);
      this._emit('socket:disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      // Handle "User no longer exists" error gracefully
      if (error.message && error.message.includes('User no longer exists')) {
        console.warn('Socket connection: User session expired, disconnecting...');
        this.disconnect();
        // Clear auth data if user no longer exists
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      console.error('Socket connection error:', error);
      this._emit('socket:error', error);
    });

    // Set up default listeners
    this.setupDefaultListeners();
  }

  setupDefaultListeners() {
    // Message events
    this.socket?.on('message:new', (message) => {
      this._emit('message:new', message);
    });

    this.socket?.on('message:updated', (message) => {
      this._emit('message:updated', message);
    });

    this.socket?.on('message:deleted', (data) => {
      this._emit('message:deleted', data);
    });

    this.socket?.on('message:read', (data) => {
      this._emit('message:read', data);
    });

    this.socket?.on('messages:read', (data) => {
      this._emit('messages:read', data);
    });

    // Typing indicators
    this.socket?.on('message:typing', (data) => {
      this._emit('message:typing', data);
    });

    // User status
    this.socket?.on('user:online', (data) => {
      this._emit('user:online', data);
    });

    this.socket?.on('user:offline', (data) => {
      this._emit('user:offline', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected');
    }
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Listen to server events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Also set up socket listener if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Internal emit for custom events (to notify local listeners)
  _emit(eventName, data) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Typing indicator helpers
  startTyping(recipientId) {
    this.emit('message:typing', { recipientId, isTyping: true });
  }

  stopTyping(recipientId) {
    this.emit('message:typing', { recipientId, isTyping: false });
  }

  // Mark message as read
  markMessageRead(messageId, senderId) {
    this.emit('message:read', { messageId, senderId });
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

