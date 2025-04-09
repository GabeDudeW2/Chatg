import  { Message } from '../types';

// Create a unique session ID for this browser instance
const SESSION_ID = `session-${Math.random().toString(36).substring(2, 9)}`;

// The proxy server endpoint for our communication
const PROXY_URL = 'https://hooks.jdoodle.net/proxy';

// External API URL for messaging
const MESSAGE_API_URL = 'https://pubsub.pubnub.com/publish';

// For demo purposes, we'll use random channel names with a prefix
const CHANNEL_PREFIX = 'chat-app-channel-';

// In-memory message cache for rooms
const roomMessages: Record<string, Message[]> = {};

/**
 * Helper function to generate a publish key for PubNub
 * In a real app, you would use a proper API key provided by the service
 */
const generatePseudoRandomKey = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate pseudo-random values for demo purposes
const DEMO_PUB_KEY = generatePseudoRandomKey();
const DEMO_SUB_KEY = generatePseudoRandomKey();

// Store active polling intervals
const activePollingIntervals: Record<string, number> = {};

// Counter to ensure unique message IDs
let messageIdCounter = 0;

/**
 * Publish a message to all clients via the proxy server
 */
async function publishMessage(channelName: string, message: any): Promise<boolean> {
  try {
    // Use a timestamp as a nonce to make each request unique
    const timetoken = Date.now();
    
    // Stringify the message for transmission
    const messageString = JSON.stringify(message);
    
    // Build the PubNub-like URL
    const publishUrl = `${MESSAGE_API_URL}/${DEMO_PUB_KEY}/${DEMO_SUB_KEY}/0/${channelName}/0/${encodeURIComponent(messageString)}?t=${timetoken}`;
    
    // Send request through the proxy
    const response = await fetch(`${PROXY_URL}?url=${encodeURIComponent(publishUrl)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    return !!result;
  } catch (error) {
    console.error('Error publishing message:', error);
    return false;
  }
}

/**
 * Fetch latest messages from the "channel"
 * This simulates subscribing to a real-time service by polling
 */
async function fetchLatestMessages(channelName: string): Promise<any[]> {
  try {
    // In a real implementation, this would use a subscription API
    // For our demo, we'll use localStorage to simulate cross-tab communication
    const storageKey = `channel-messages-${channelName}`;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        return JSON.parse(storedMessages);
      } catch (e) {
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Save a message to local storage to simulate cross-tab communication
 */
function saveMessageToLocalStorage(channelName: string, message: any): void {
  try {
    const storageKey = `channel-messages-${channelName}`;
    const storedMessages = localStorage.getItem(storageKey);
    
    let messages = [];
    if (storedMessages) {
      try {
        messages = JSON.parse(storedMessages);
      } catch (e) {
        messages = [];
      }
    }
    
    // Add the new message
    messages.push(message);
    
    // Keep only the latest 100 messages
    if (messages.length > 100) {
      messages = messages.slice(messages.length - 100);
    }
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(messages));
    
    // Dispatch an event to notify other tabs
    window.dispatchEvent(new CustomEvent('chat-message', { 
      detail: { channelName, message }
    }));
  } catch (error) {
    console.error('Error saving message to localStorage:', error);
  }
}

/**
 * Simulated real-time service with cross-browser communication
 */
export const realTimeService = {
  // Get all messages for a specific room
  getMessages: async (roomId: string): Promise<Message[]> => {
    try {
      // Initialize cache if needed
      if (!roomMessages[roomId]) {
        roomMessages[roomId] = [
          { 
            id: `system-welcome-${Date.now()}-${messageIdCounter++}`, 
            text: `Welcome to ${roomId === 'lobby' ? 'the public lobby' : `room ${roomId}`}!`, 
            sender: 'System', 
            timestamp: Date.now(), 
            isMine: false,
            roomId
          }
        ];
      }
      
      return roomMessages[roomId];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a new message to a specific room
  sendMessage: async (messageText: string, senderName: string, roomId: string): Promise<Message | null> => {
    try {
      // Create channel name from room ID
      const channelName = `${CHANNEL_PREFIX}${roomId}`;
      
      // Initialize cache if needed
      if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
      }
      
      // Create the new message with a guaranteed unique ID
      const newMessage = {
        id: `${SESSION_ID}-${Date.now()}-${messageIdCounter++}`,
        text: messageText,
        sender: senderName,
        timestamp: Date.now(),
        isMine: true, // It's "mine" for the sender
        roomId,
        sessionId: SESSION_ID
      };
      
      // Add to local messages cache
      roomMessages[roomId].push(newMessage);
      
      // Save to localStorage for cross-tab communication
      saveMessageToLocalStorage(channelName, {
        ...newMessage,
        type: 'message'
      });
      
      // Publish to "all" browsers via the proxy
      await publishMessage(channelName, {
        ...newMessage,
        type: 'message',
      });
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
  
  // Connect to a specific room
  connectToRoom: (
    roomId: string,
    username: string,
    onMessage: (message: Message) => void,
    onUserCount: (count: number) => void,
    onConnect: () => void
  ) => {
    // Create channel name from room ID
    const channelName = `${CHANNEL_PREFIX}${roomId}`;
    
    // Initialize cache if needed
    if (!roomMessages[roomId]) {
      roomMessages[roomId] = [
        { 
          id: `system-welcome-${Date.now()}-${messageIdCounter++}`, 
          text: `Welcome to ${roomId === 'lobby' ? 'the public lobby' : `room ${roomId}`}!`, 
          sender: 'System', 
          timestamp: Date.now(), 
          isMine: false,
          roomId
        }
      ];
    }
    
    // Publish a join message with a unique ID
    const joinMessage = {
      id: `${SESSION_ID}-join-${Date.now()}-${messageIdCounter++}`,
      text: `${username} has joined the chat.`,
      sender: 'System',
      timestamp: Date.now(),
      isMine: false,
      roomId,
      sessionId: SESSION_ID,
      type: 'join'
    };
    
    // Save to localStorage for cross-tab communication
    saveMessageToLocalStorage(channelName, joinMessage);
    
    // Publish join message
    publishMessage(channelName, joinMessage);
    
    // Add to local messages
    roomMessages[roomId].push(joinMessage);
    
    // Listen for messages from other tabs
    const handleLocalStorageMessage = (e: any) => {
      if (e.detail && e.detail.channelName === channelName) {
        const messageData = e.detail.message;
        
        // Handle different message types
        if (messageData.type === 'message' && messageData.sessionId !== SESSION_ID) {
          const newMessage = {
            ...messageData,
            isMine: false,
          };
          
          // Only add the message if it doesn't already exist in our cache
          if (!roomMessages[roomId].some(m => m.id === newMessage.id)) {
            onMessage(newMessage);
            roomMessages[roomId].push(newMessage);
          }
        } 
        else if (messageData.type === 'join' && messageData.sessionId !== SESSION_ID) {
          const joinMsg = {
            ...messageData,
            isMine: false
          };
          
          // Only add the message if it doesn't already exist in our cache
          if (!roomMessages[roomId].some(m => m.id === joinMsg.id)) {
            onMessage(joinMsg);
            roomMessages[roomId].push(joinMsg);
          }
          
          // Update user count - this is simplified and not accurate
          onUserCount(roomMessages[roomId].filter(m => 
            m.sender === 'System' && 
            m.text.includes('has joined')
          ).length);
        }
        else if (messageData.type === 'leave' && messageData.sessionId !== SESSION_ID) {
          const leaveMsg = {
            ...messageData,
            isMine: false
          };
          
          // Only add the message if it doesn't already exist in our cache
          if (!roomMessages[roomId].some(m => m.id === leaveMsg.id)) {
            onMessage(leaveMsg);
            roomMessages[roomId].push(leaveMsg);
          }
          
          // Update user count - this is simplified and not accurate
          onUserCount(Math.max(1, roomMessages[roomId].filter(m => 
            m.sender === 'System' && 
            m.text.includes('has joined')
          ).length - roomMessages[roomId].filter(m => 
            m.sender === 'System' && 
            m.text.includes('has left')
          ).length));
        }
      }
    };
    
    window.addEventListener('chat-message', handleLocalStorageMessage);
    
    // Set up polling for cross-browser communication
    const pollInterval = window.setInterval(async () => {
      try {
        const latestMessages = await fetchLatestMessages(channelName);
        
        // Process new messages that aren't from this session
        latestMessages.forEach(messageData => {
          if (messageData.sessionId !== SESSION_ID && 
              !roomMessages[roomId].some(m => m.id === messageData.id)) {
            
            // Format the message for the UI
            const formattedMessage = {
              ...messageData,
              isMine: false
            };
            
            // Notify the UI
            onMessage(formattedMessage);
            
            // Add to local cache
            roomMessages[roomId].push(formattedMessage);
          }
        });
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Store the interval for cleanup
    activePollingIntervals[roomId] = pollInterval;
    
    // Simulate connection delay
    setTimeout(() => {
      onConnect();
      onUserCount(1); // Start with at least 1 user (self)
    }, 500);
    
    // Return cleanup function
    return () => {
      // Remove event listener
      window.removeEventListener('chat-message', handleLocalStorageMessage);
      
      // Clear polling interval
      if (activePollingIntervals[roomId]) {
        window.clearInterval(activePollingIntervals[roomId]);
        delete activePollingIntervals[roomId];
      }
      
      // Publish a leave message with a unique ID
      const leaveMessage = {
        id: `${SESSION_ID}-leave-${Date.now()}-${messageIdCounter++}`,
        text: `${username} has left the chat.`,
        sender: 'System',
        timestamp: Date.now(),
        isMine: false,
        roomId,
        sessionId: SESSION_ID,
        type: 'leave'
      };
      
      // Save to localStorage
      saveMessageToLocalStorage(channelName, leaveMessage);
      
      // Publish leave message
      publishMessage(channelName, leaveMessage);
    };
  }
};
 