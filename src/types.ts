export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  location?: {
    lat: number;
    lng: number;
    timestamp: any;
  };
  lastSeen?: any;
}

export interface TrackingRequest {
  id: string;
  fromUid: string;
  fromEmail: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}
