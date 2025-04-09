export  interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isMine: boolean;
  roomId?: string;
}

export interface User {
  name: string;
  id: string;
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
}
 
