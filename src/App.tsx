/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp,
  handleFirestoreError,
  OperationType,
  type FirebaseUser 
} from './lib/firebase';
import { UserProfile, TrackingRequest } from './types';
import { cn } from './lib/utils';
import { 
  Shield, 
  MapPin, 
  Users, 
  UserPlus, 
  LogOut, 
  Bell, 
  Check, 
  X, 
  Navigation, 
  Clock, 
  AlertTriangle,
  Heart,
  Search,
  ChevronRight,
  Menu,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Components ---

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
      className="mb-4"
    >
      <Shield className="w-16 h-16 text-indigo-600" />
    </motion.div>
    <h1 className="text-2xl font-bold text-gray-900">GuardianTrack</h1>
    <p className="text-gray-500 mt-2">Securing your loved ones...</p>
  </div>
);

const LoginScreen = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GuardianTrack</h1>
        <p className="text-gray-600 mb-8">
          Real-time location tracking for family safety and peace of mind.
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1" />
          Sign in with Google
        </button>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <MapPin className="w-5 h-5 text-indigo-600 mb-2" />
            <h3 className="text-sm font-semibold">Live Tracking</h3>
            <p className="text-xs text-gray-500">Accurate real-time location sharing.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <Bell className="w-5 h-5 text-indigo-600 mb-2" />
            <h3 className="text-sm font-semibold">Safety Alerts</h3>
            <p className="text-xs text-gray-500">Instant notifications for peace of mind.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchedUsers, setWatchedUsers] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TrackingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<TrackingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'people' | 'alerts'>('map');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Profile Sync
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Create profile if it doesn't exist
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}`,
        };
        setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.CREATE, 'users'));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, 'users'));

    return unsubscribe;
  }, [user]);

  // Geolocation Watcher
  useEffect(() => {
    if (!user || !profile) return;

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          location: {
            lat: latitude,
            lng: longitude,
            timestamp: serverTimestamp()
          },
          lastSeen: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'users'));
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, !!profile]);

  // Tracking Requests Sync
  useEffect(() => {
    if (!user) return;

    // Requests sent to me
    const qIncoming = query(collection(db, 'tracking_requests'), where('toEmail', '==', user.email), where('status', '==', 'pending'));
    const unsubIncoming = onSnapshot(qIncoming, (snapshot) => {
      setPendingRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrackingRequest)));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'tracking_requests'));

    // Requests I sent
    const qOutgoing = query(collection(db, 'tracking_requests'), where('fromUid', '==', user.uid));
    const unsubOutgoing = onSnapshot(qOutgoing, (snapshot) => {
      setSentRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrackingRequest)));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'tracking_requests'));

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);

  // Watched Users Sync (Accepted requests)
  useEffect(() => {
    if (!user) return;

    let unsubUsers: (() => void) | null = null;

    const qAccepted = query(
      collection(db, 'tracking_requests'), 
      where('fromUid', '==', user.uid), 
      where('status', '==', 'accepted')
    );

    const unsubAccepted = onSnapshot(qAccepted, (snapshot) => {
      const emails = snapshot.docs.map(d => d.data().toEmail);
      
      // Clean up previous users listener if it exists
      if (unsubUsers) {
        unsubUsers();
        unsubUsers = null;
      }

      if (emails.length === 0) {
        setWatchedUsers([]);
        return;
      }

      const qUsers = query(collection(db, 'users'), where('email', 'in', emails));
      unsubUsers = onSnapshot(qUsers, (uSnapshot) => {
        setWatchedUsers(uSnapshot.docs.map(d => d.data() as UserProfile));
      }, (e) => handleFirestoreError(e, OperationType.LIST, 'users'));

    }, (e) => handleFirestoreError(e, OperationType.LIST, 'tracking_requests'));

    return () => {
      unsubAccepted();
      if (unsubUsers) unsubUsers();
    };
  }, [user]);

  // --- Actions ---

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchEmail || searchEmail === user.email) return;

    try {
      await addDoc(collection(db, 'tracking_requests'), {
        fromUid: user.uid,
        fromEmail: user.email,
        toEmail: searchEmail.toLowerCase(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSearchEmail('');
      setIsAddingUser(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tracking_requests');
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      if (status === 'rejected') {
        await deleteDoc(doc(db, 'tracking_requests', requestId));
      } else {
        await updateDoc(doc(db, 'tracking_requests', requestId), { status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tracking_requests');
    }
  };

  const removeWatchedUser = async (email: string) => {
    try {
      const req = sentRequests.find(r => r.toEmail === email);
      if (req) {
        await deleteDoc(doc(db, 'tracking_requests', req.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tracking_requests');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  const mapCenter: [number, number] = selectedUser?.location 
    ? [selectedUser.location.lat, selectedUser.location.lng]
    : profile?.location 
      ? [profile.location.lat, profile.location.lng]
      : [20.5937, 78.9629]; // India center fallback

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 hidden sm:block">GuardianTrack</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center gap-2">
            <img src={profile?.photoURL} alt="Me" className="w-8 h-8 rounded-full border border-slate-200" />
            <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        
        {/* Sidebar (Desktop) / Overlay (Mobile) */}
        <AnimatePresence>
          {(activeTab === 'people' || activeTab === 'alerts') && (
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute inset-y-0 left-0 w-full sm:w-80 bg-white border-r border-slate-200 z-[1000] flex flex-col shadow-2xl sm:shadow-none"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-900">
                  {activeTab === 'people' ? 'Loved Ones' : 'Notifications'}
                </h2>
                <button onClick={() => setActiveTab('map')} className="p-2 hover:bg-slate-100 rounded-full sm:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'people' && (
                  <>
                    <button 
                      onClick={() => setIsAddingUser(true)}
                      className="w-full py-3 px-4 bg-indigo-50 text-indigo-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Loved One
                    </button>

                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tracking</h3>
                      {watchedUsers.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No one added yet. Add your family members to stay connected.</p>
                        </div>
                      ) : (
                        watchedUsers.map(u => (
                          <div
                            key={u.uid}
                            className={cn(
                              "w-full p-3 rounded-2xl flex items-center gap-3 transition-all",
                              selectedUser?.uid === u.uid ? "bg-indigo-50 border-indigo-100" : "hover:bg-slate-50"
                            )}
                          >
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setActiveTab('map');
                              }}
                              className="flex-1 flex items-center gap-3 min-w-0 text-left"
                            >
                              <div className="relative">
                                <img src={u.photoURL} alt={u.displayName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                <div className={cn(
                                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                                  u.location ? "bg-green-500" : "bg-slate-300"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate">{u.displayName}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {u.lastSeen ? formatDistanceToNow(u.lastSeen.toDate(), { addSuffix: true }) : 'Never'}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Stop tracking ${u.displayName}?`)) {
                                  removeWatchedUser(u.email);
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove Loved One"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {sentRequests.filter(r => r.status === 'pending').length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Pending Invitations</h3>
                        {sentRequests.filter(r => r.status === 'pending').map(r => (
                          <div key={r.id} className="p-3 bg-slate-50 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{r.toEmail}</p>
                                <p className="text-[10px] text-slate-400">Waiting for approval...</p>
                              </div>
                              <button onClick={() => respondToRequest(r.id, 'rejected')} className="p-1 text-slate-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => {
                                const shareData = {
                                  title: 'Join me on GuardianTrack',
                                  text: `I've sent you a tracking request on GuardianTrack for our safety. Please log in to approve:`,
                                  url: window.location.origin
                                };
                                if (navigator.share) {
                                  navigator.share(shareData);
                                } else {
                                  navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                                  alert('Invite link copied to clipboard! You can now paste it in WhatsApp or Email.');
                                }
                              }}
                              className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Forward Invite Link
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'alerts' && (
                  <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      pendingRequests.map(r => (
                        <div key={r.id} className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                          <p className="text-sm text-slate-800 mb-3">
                            <span className="font-bold">{r.fromEmail}</span> wants to track your location for safety.
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => respondToRequest(r.id, 'accepted')}
                              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-100"
                            >
                              <Check className="w-4 h-4" /> Accept
                            </button>
                            <button 
                              onClick={() => respondToRequest(r.id, 'rejected')}
                              className="flex-1 bg-white text-slate-600 py-2 rounded-xl text-sm font-bold border border-slate-200"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Area */}
        <div className="flex-1 bg-slate-200 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* My Location */}
            {profile?.location && (
              <Marker position={[profile.location.lat, profile.location.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">You are here</p>
                    <p className="text-xs text-slate-500">Sharing live location</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Watched Users */}
            {watchedUsers.map(u => u.location && (
              <Marker 
                key={u.uid} 
                position={[u.location.lat, u.location.lng]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="relative">
                          <img src="${u.photoURL}" class="w-10 h-10 rounded-full border-2 border-indigo-600 shadow-lg" />
                          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
              >
                <Popup>
                  <div className="p-1 min-w-[120px]">
                    <h4 className="font-bold text-slate-900">{u.displayName}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Last seen {u.lastSeen ? formatDistanceToNow(u.lastSeen.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${u.location.lat},${u.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-md block text-center font-bold"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapUpdater center={mapCenter} />
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
            <button 
              onClick={() => setSelectedUser(null)}
              className="p-3 bg-white rounded-2xl shadow-lg text-slate-600 hover:text-indigo-600 transition-colors"
              title="My Location"
            >
              <Navigation className="w-6 h-6" />
            </button>
          </div>

          {/* Selected User Info Overlay */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-96 bg-white rounded-3xl shadow-2xl p-4 z-[400] border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-14 h-14 rounded-2xl border-2 border-indigo-50 shadow-sm" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{selectedUser.displayName}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {selectedUser.location ? `${selectedUser.location.lat.toFixed(4)}, ${selectedUser.location.lng.toFixed(4)}` : 'Location unknown'}
                    </p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100">
                    Get Directions
                  </button>
                  <button className="p-3 bg-red-50 text-red-600 rounded-2xl font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-30">
        <button 
          onClick={() => setActiveTab('map')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'map' ? "text-indigo-600" : "text-slate-400")}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
        </button>
        <button 
          onClick={() => setActiveTab('people')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'people' ? "text-indigo-600" : "text-slate-400")}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Loved Ones</span>
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={cn("flex flex-col items-center gap-1 relative", activeTab === 'alerts' ? "text-indigo-600" : "text-slate-400")}
        >
          <Bell className="w-6 h-6" />
          {pendingRequests.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">Alerts</span>
        </button>
      </nav>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Add a Loved One</h3>
                <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={sendRequest} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="lovedone@example.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 bg-indigo-50 p-4 rounded-xl leading-relaxed">
                  Enter the email address of the person you want to track. They will receive a notification to approve your request.
                </p>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Send Tracking Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Styles for Leaflet Custom Markers */}
      <style>{`
        .leaflet-container {
          background-color: #f1f5f9 !important;
        }
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
