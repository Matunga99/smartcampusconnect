import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Users, Phone, Video, AlertCircle, Pin, Smile, 
  Power, Mic, MicOff, VideoOff, Tv, Hand, Volume2, VolumeX, Download, 
  Search, FileText, Image, Link, Play, Square, Circle, Upload, X, ShieldAlert,
  Loader2, Radio, CheckSquare, Sparkles, BookOpen, Clock, Layers, Camera
} from 'lucide-react';

import NetworkGraph from './NetworkGraph';

interface CommunicationsHubProps {
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    schoolId?: string;
  };
  initialThreadId?: string;
  initialTargetUserId?: string;
}

export default function CommunicationsHub({ 
  user,
  initialThreadId,
  initialTargetUserId
}: CommunicationsHubProps) {
  // Navigation & State
  const [activeSessionView, setActiveSessionView] = useState<'chat' | 'classrooms' | 'drive' | 'graph'>('chat');
  
  // Chat States
  const [threads, setThreads] = useState<any[]>([]);
  const [suggestedContacts, setSuggestedContacts] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  // Global Search Engine State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any | null>(null);
  const [showArchivedOnly, setShowArchivedOnly] = useState<boolean>(false);
  
  // Search & Direct Chats
  const [searchText, setSearchText] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [showDirectModal, setShowDirectModal] = useState(false);
  
  // Real-time Simulation & Helpers
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const typingTimerRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  
  // Attachment Simulation
  const [selectedAttachment, setSelectedAttachment] = useState<{name: string, url: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

  // Live Class Room States
  const [liveClassrooms, setLiveClassrooms] = useState<any[]>([]);
  const [activeLectureRoom, setActiveLectureRoom] = useState<any | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);
  const [isClassMuted, setIsClassMuted] = useState(true);
  const [isClassCameraOn, setIsClassCameraOn] = useState(user.role === 'staff' || user.role === 'lecturer');
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [classTitleInput, setClassTitleInput] = useState('');
  
  // Recorded Lectures Drive
  const [recordingsList, setRecordingsList] = useState<any[]>([]);
  
  // Admin Announcement Creator
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [annCohortId, setAnnCohortId] = useState('');
  const [annSuccessMsg, setAnnSuccessMsg] = useState('');

  // Unified Categorized Academic Directory States
  const [directory, setDirectory] = useState<{
    suggested: any[];
    lecturers: any[];
    students: any[];
    parents: any[];
    admins: any[];
    recentChats: any[];
  }>({ suggested: [], lecturers: [], students: [], parents: [], admins: [], recentChats: [] });
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'suggested' | 'lecturers' | 'students' | 'parents' | 'admins' | 'recent'>('suggested');

  // Direct Calls State Model
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [currentCall, setCurrentCall] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [isMutedInCall, setIsMutedInCall] = useState<boolean>(false);
  const [isCameraOnInCall, setIsCameraOnInCall] = useState<boolean>(true);
  const [isScreenSharingInCall, setIsScreenSharingInCall] = useState<boolean>(false);
  
  // Fetch Token
  const token = localStorage.getItem('scc_token') || localStorage.getItem('token');

  // Load baseline chat data, live classrooms & drive records
  useEffect(() => {
    fetchThreads();
    fetchRecordings();
    fetchAnnouncements();
    fetchDirectory();
    fetchActiveCalls();
    if (user.role === 'admin') {
      fetchSearchUsers();
    }
  }, []);

  // Poll chats, typing indicators and live conferences every 3.5 seconds (Fast and robust preview consistency)
  useEffect(() => {
    const pollId = setInterval(() => {
      fetchThreadsOnly();
      fetchActiveCalls();
      if (selectedThread) {
        fetchMessages(selectedThread.id);
        fetchTypingUsers(selectedThread.id);
        fetchActiveClassrooms(selectedThread.id);
      }
      if (activeLectureRoom) {
        refreshLectureRoomState(activeLectureRoom.id);
      }
    }, 3500);

    return () => clearInterval(pollId);
  }, [selectedThread, activeLectureRoom, currentCall]);

  const fetchDirectory = async () => {
    try {
      const resp = await fetch('/api/communications/directory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setDirectory(await resp.json());
      }
    } catch (e) {
      console.error("Directory fetching failed:", e);
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const resp = await fetch('/api/communications/calls/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setActiveCalls(data);

        // Find incoming active ringing call not hosted by the current user
        const ringingCall = data.find((c: any) => c.status === 'ringing' && c.hostId !== user.id);
        if (ringingCall) {
          if (!currentCall || currentCall.callId !== ringingCall.callId) {
            setIncomingCall(ringingCall);
          }
        } else {
          setIncomingCall(null);
        }

        // Sync local currentCall structure if active
        if (currentCall) {
          const syncCall = data.find((c: any) => c.callId === currentCall.callId);
          if (syncCall) {
            setCurrentCall(syncCall);
          } else {
            setCurrentCall(null);
          }
        }
      }
    } catch (e) {}
  };

  const handleStartCall = async (type: 'video' | 'voice') => {
    if (!selectedThread) return;
    try {
      const resp = await fetch(`/api/communications/calls/${type}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ threadId: selectedThread.id })
      });
      if (resp.ok) {
        const newCall = await resp.json();
        setCurrentCall(newCall);
        fetchActiveCalls();
      }
    } catch (e) {}
  };

  const handleJoinCall = async (callSetup: any) => {
    try {
      const resp = await fetch(`/api/communications/calls/${callSetup.type}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ callId: callSetup.callId })
      });
      if (resp.ok) {
        const updatedCall = await resp.json();
        setCurrentCall(updatedCall);
        setIncomingCall(null);
        fetchActiveCalls();
      }
    } catch (e) {}
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  const handleEndCall = async () => {
    if (!currentCall) return;
    try {
      const resp = await fetch(`/api/communications/calls/${currentCall.type}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ callId: currentCall.callId })
      });
      if (resp.ok) {
        setCurrentCall(null);
        fetchActiveCalls();
      }
    } catch (e) {
      setCurrentCall(null);
    }
  };

  // Fetch all authorized channels
  const fetchThreads = async () => {
    try {
      const resp = await fetch('/api/communications/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        let finalThreads = [];
        let contacts = [];
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          finalThreads = data.threads || [];
          contacts = data.suggestedContacts || [];
        } else {
          finalThreads = data || [];
        }

        setThreads(finalThreads);
        setSuggestedContacts(contacts);

        // Check if there is an initial target user (e.g. Lecturer)
        if (initialTargetUserId) {
          try {
            const directResp = await fetch('/api/communications/threads/direct', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ targetUserId: initialTargetUserId })
            });
            if (directResp.ok) {
              const directData = await directResp.json();
              if (directData && directData.threadId) {
                // Fetch again to ensure the newly created thread shows in the threads list
                const refreshedResp = await fetch('/api/communications/threads', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (refreshedResp.ok) {
                  const refData = await refreshedResp.json();
                  const list = refData.threads || (Array.isArray(refData) ? refData : []);
                  setThreads(list);
                  const matchingThr = list.find((t: any) => t.id === directData.threadId);
                  if (matchingThr) {
                    handleSelectThread(matchingThr);
                    return;
                  } else {
                    handleSelectThread({ id: directData.threadId, name: 'Secure Lecturer Line', type: 'direct' });
                    return;
                  }
                }
              }
            }
          } catch (err) {
            console.error("Direct lecturer thread could not be established:", err);
          }
        }

        // Check if there is a specific initial thread to load
        if (initialThreadId) {
          const matchingTh = finalThreads.find((t: any) => t.id === initialThreadId);
          if (matchingTh) {
            handleSelectThread(matchingTh);
            return;
          }
        }

        // Generic default fallback selection
        if (finalThreads.length > 0 && !selectedThread) {
          handleSelectThread(finalThreads[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchThreadsOnly = async () => {
    try {
      const resp = await fetch('/api/communications/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setThreads(data.threads || []);
          setSuggestedContacts(data.suggestedContacts || []);
        } else {
          setThreads(data || []);
        }
      }
    } catch (e) {}
  };

  const handleSelectThread = (thread: any) => {
    setSelectedThread(thread);
    fetchMessages(thread.id);
    fetchTypingUsers(thread.id);
    fetchActiveClassrooms(thread.id);
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const resp = await fetch(`/api/communications/threads/${threadId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setMessages(data);
      }
    } catch (e) {}
  };

  const fetchTypingUsers = async (threadId: string) => {
    try {
      const resp = await fetch(`/api/communications/threads/${threadId}/typing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        // Filter out self
        const typists = data.filter((t: any) => t.userId !== user.id);
        setTypingUsers(typists);
      }
    } catch (e) {}
  };

  const fetchActiveClassrooms = async (threadId: string) => {
    try {
      const resp = await fetch(`/api/communications/video-sessions/active/${threadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setLiveClassrooms(data);
      }
    } catch (e) {}
  };

  const fetchRecordings = async () => {
    try {
      const resp = await fetch('/api/communications/recordings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setRecordingsList(await resp.json());
      }
    } catch (e) {}
  };

  const fetchAnnouncements = async () => {
    try {
      const resp = await fetch('/api/communications/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setAnnouncements(await resp.json());
      }
    } catch (e) {}
  };

  const fetchSearchUsers = async () => {
    try {
      const resp = await fetch('/api/communications/users/search', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setUsersList(await resp.json());
      }
    } catch (e) {}
  };

  // Call global Search API for dynamic queries
  const handleGlobalSearch = async (query: string) => {
    setGlobalSearchQuery(query);
    if (!query.trim()) {
      setGlobalSearchResults(null);
      return;
    }
    try {
      const resp = await fetch(`/api/communications/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setGlobalSearchResults(await resp.json());
      }
    } catch (e) {}
  };

  // Archive a conversation thread
  const handleArchiveThread = async (threadId: string) => {
    try {
      const resp = await fetch(`/api/communications/threads/${threadId}/archive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        // Deselect if active thread was archived
        if (selectedThread?.id === threadId) {
          setSelectedThread(null);
        }
        await fetchThreads();
      }
    } catch (e) {}
  };

  // Restore/Unarchive a conversation thread
  const handleRestoreThread = async (threadId: string) => {
    try {
      const resp = await fetch(`/api/communications/threads/${threadId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        await fetchThreads();
      }
    } catch (e) {}
  };

  // Typing trigger handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    triggerTypingState(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      triggerTypingState(false);
    }, 2500);
  };

  const triggerTypingState = async (isTyping: boolean) => {
    if (!selectedThread) return;
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;

    try {
      await fetch(`/api/communications/threads/${selectedThread.id}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isTyping })
      });
    } catch (e) {}
  };

  // Submit messages with metadata
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedAttachment && !selectedThread) return;

    try {
      const payload = {
        content: inputText,
        type: selectedAttachment ? selectedAttachment.type : 'text',
        attachmentName: selectedAttachment?.name,
        attachmentUrl: selectedAttachment?.url
      };

      const resp = await fetch(`/api/communications/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const newMsg = await resp.json();
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setSelectedAttachment(null);
        triggerTypingState(false);
      }
    } catch (e) {}
  };

  // Simulated Attachments Upload handler
  const handleAttachFileMock = (type: 'image' | 'file' | 'audio' | 'video') => {
    let name = 'Document.pdf';
    let url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    if (type === 'image') {
      name = 'lecture_diagram_1.png';
      url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
    } else if (type === 'audio') {
      name = 'voice_explanation_module1.mp3';
      url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    } else if (type === 'video') {
      name = 'syllabus_introduction_clip.mp4';
      url = 'https://www.w3schools.com/html/mov_bbb.mp4';
    }

    setSelectedAttachment({ name, url, type });
  };

  // Real Attachments Upload Handler (Physical Upload from Device)
  const handleRealFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        let fileType: string = 'file';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        }

        const resp = await fetch('/api/communications/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: fileType,
            fileData: base64Data
          })
        });

        if (resp.ok) {
          const result = await resp.json();
          setSelectedAttachment({
            name: result.name,
            url: result.url,
            type: result.type
          });
        } else {
          const err = await resp.json();
          setErrorMsg(err.error || 'Failed to upload file');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to read file from device.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Real Camera capture Handlers
  const startCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      setShowCamera(true);
      // Wait for React to mount the stream and update ref
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setErrorMsg("Camera access failed. Check permissions in your browser bar.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const captureCameraPhoto = async () => {
    if (!cameraVideoRef.current) return;
    try {
      setIsUploading(true);
      const video = cameraVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        // Upload base64 capture
        const resp = await fetch('/api/communications/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: `camera_capture_${Date.now()}.png`,
            fileType: 'image',
            fileData: dataUrl
          })
        });

        if (resp.ok) {
          const result = await resp.json();
          setSelectedAttachment({
            name: result.name,
            url: result.url,
            type: result.type
          });
          stopCamera();
        } else {
          const err = await resp.json();
          setErrorMsg(err.error || 'Failed to upload captured snapshot.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to capture frame.');
    } finally {
      setIsUploading(false);
    }
  };

  // Emoji Reactions
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const resp = await fetch(`/api/communications/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });
      if (resp.ok) {
        if (selectedThread) fetchMessages(selectedThread.id);
      }
    } catch (e) {}
  };

  // Pin content helper for administrators and lecturers
  const handlePinContent = async (blockKey: 'timetable' | 'examDates' | 'announcements' | 'lectureNotes', value: string) => {
    if (!selectedThread) return;
    try {
      const resp = await fetch(`/api/communications/threads/${selectedThread.id}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blockKey, value })
      });
      if (resp.ok) {
        const updated = { ...selectedThread };
        if (!updated.pinnedContent) updated.pinnedContent = {};
        updated.pinnedContent[blockKey ] = value;
        updated.isPinned = true;
        setSelectedThread(updated);
        fetchThreadsOnly();
      }
    } catch (e) {}
  };

  // Start a video classroom / audio conference
  const handleStartClassroom = async () => {
    if (!selectedThread || !classTitleInput.trim()) return;
    try {
      const resp = await fetch('/api/communications/video-sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          threadId: selectedThread.id,
          title: classTitleInput,
          type: lowBandwidthMode ? 'audio' : 'video'
        })
      });

      if (resp.ok) {
        const session = await resp.json();
        setClassTitleInput('');
        handleJoinClassroom(session.id);
      }
    } catch (e) {}
  };

  // Join a live conference classroom
  const handleJoinClassroom = async (sessionSlug: string) => {
    try {
      const resp = await fetch(`/api/communications/video-sessions/${sessionSlug}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isMuted: isClassMuted,
          isCameraOn: isClassCameraOn,
          lowBandwidthMode
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setActiveLectureRoom(data.session);
        setRoomParticipants(data.participants);
        setActiveSessionView('classrooms');
        
        // Match host recording status
        setIsRecording(data.session.isRecording);
        setIsScreenSharing(data.session.screenSharingUserId === user.id);
      }
    } catch (e) {}
  };

  // Refresh classroom participants, screen sharing and raise-hand tags
  const refreshLectureRoomState = async (sessionSlug: string) => {
    try {
      const resp = await fetch(`/api/communications/video-sessions/${sessionSlug}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isMuted: isClassMuted,
          isCameraOn: isClassCameraOn,
          lowBandwidthMode
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.session.status === 'finished') {
          // Room closed by host
          setActiveLectureRoom(null);
          setRoomParticipants([]);
          alert('Lecture session has been concluded by the host.');
          fetchRecordings();
        } else {
          setActiveLectureRoom(data.session);
          setRoomParticipants(data.participants);
        }
      }
    } catch (e) {}
  };

  // Toggle raise hand (student helper)
  const handleToggleRaiseHand = async () => {
    if (!activeLectureRoom) return;
    const myCurrentState = roomParticipants.find(p => p.userId === user.id);
    const currentlyRaised = myCurrentState ? myCurrentState.handRaised : false;

    try {
      const resp = await fetch(`/api/communications/video-sessions/${activeLectureRoom.id}/raise-hand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ raise: !currentlyRaised })
      });
      if (resp.ok) {
        refreshLectureRoomState(activeLectureRoom.id);
      }
    } catch (e) {}
  };

  // Host classroom controls (Mute, Recording, Screen share, Conclude)
  const handleClassroomControl = async (action: 'toggle-recording' | 'screen-share' | 'stop-session', targetMuteUserId?: string) => {
    if (!activeLectureRoom) return;
    try {
      const payload: any = { action };
      if (targetMuteUserId) {
        payload.muteUserId = targetMuteUserId;
      }
      if (action === 'screen-share') {
        payload.screenShareValue = !isScreenSharing;
      }

      const resp = await fetch(`/api/communications/video-sessions/${activeLectureRoom.id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        if (action === 'stop-session') {
          setActiveLectureRoom(null);
          setRoomParticipants([]);
          setActiveSessionView('chat');
          fetchRecordings();
        } else {
          setActiveLectureRoom(data.session);
          setRoomParticipants(data.participants);
          if (action === 'toggle-recording') setIsRecording(data.session.isRecording);
          if (action === 'screen-share') setIsScreenSharing(data.session.screenSharingUserId === user.id);
        }
      }
    } catch (e) {}
  };

  // Start direct chat thread
  const handleStartDirectChat = async (targetId: string) => {
    try {
      const resp = await fetch('/api/communications/threads/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: targetId })
      });

      if (resp.ok) {
        const data = await resp.json();
        setShowDirectModal(false);
        
        // Fetch threads synchronously to select immediately
        try {
          const tResp = await fetch('/api/communications/threads', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (tResp.ok) {
            const result = await tResp.json();
            setThreads(result.threads || []);
            if (result.suggestedContacts) {
              setSuggestedContacts(result.suggestedContacts);
            }
            const matchingThread = (result.threads || []).find((t: any) => t.id === data.threadId);
            if (matchingThread) {
              handleSelectThread(matchingThread);
            } else {
              handleSelectThread({ id: data.threadId, name: 'Secure Messenger Pipeline', type: 'direct' });
            }
          }
        } catch (err) {
          fetchThreads();
        }
      }
    } catch (e) {}
  };

  // Create Broadcast Announcement (Admins)
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    try {
      const resp = await fetch('/api/communications/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: annTitle,
          message: annMessage,
          priority: annPriority,
          cohortId: annCohortId || undefined
        })
      });

      if (resp.ok) {
        setAnnTitle('');
        setAnnMessage('');
        setAnnCohortId('');
        setAnnSuccessMsg('Official Dean / Admin Announcement Broadcasted successfully across system channels!');
        fetchAnnouncements();
        fetchThreads();
        setTimeout(() => setAnnSuccessMsg(''), 5000);
      }
    } catch (e) {}
  };

  return (
    <div id="communications-hub-root" className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden font-sans text-[11px] shadow-sm relative">
      
      {/* Network & Live Status Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 flex items-center justify-between text-[10px] shrink-0 font-mono border-b border-indigo-950">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>REAL-TIME GATEWAY BUS</span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-400 capitalize">{user.role} Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: <span className="text-emerald-400 font-bold">14ms</span></span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline">SSE STREAMS ACTIVE</span>
        </div>
      </div>

      {/* Primary Communication Header Menu */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800">Advanced Academic Communications</h2>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200 shrink-0 self-start sm:self-auto text-[10px] font-bold">
          <button 
            type="button"
            onClick={() => setActiveSessionView('chat')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeSessionView === 'chat' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Channels & Chats
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveSessionView('classrooms')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${activeSessionView === 'classrooms' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {activeLectureRoom && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />}
            Live Lecture Rooms
          </button>

          <button 
            type="button"
            onClick={() => setActiveSessionView('drive')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${activeSessionView === 'drive' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Recorded Lecture Drive
          </button>

          <button 
            type="button"
            onClick={() => setActiveSessionView('graph')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${activeSessionView === 'graph' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Academic Network Graph
          </button>
        </div>
      </div>

      {/* Main Container Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* View A: Channels and Chats */}
        {activeSessionView === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Sidebar: Threads listing */}
            <div className="w-1/3 min-w-[200px] max-w-[320px] bg-slate-50 border-r border-slate-250 flex flex-col overflow-y-auto">
              {/* Start Direct Chat Trigger */}
              <div className="p-3 border-b border-slate-200 bg-white">
                <button
                  onClick={() => {
                    fetchSearchUsers();
                    setShowDirectModal(true);
                  }}
                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100/85 text-indigo-600 border border-indigo-200 rounded-lg text-center font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>New Chat / DM</span>
                </button>
              </div>

              {/* Thread List Header & Filters */}
              <div className="px-3 py-1.5 flex items-center justify-between text-[9px] bg-slate-100/60 border-b border-slate-200 shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowArchivedOnly(false)}
                    className={`font-black pb-0.5 border-b uppercase tracking-wide cursor-pointer ${!showArchivedOnly ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  >
                    Active Chats
                  </button>
                  <button
                    onClick={() => setShowArchivedOnly(true)}
                    className={`font-black pb-0.5 border-b uppercase tracking-wide cursor-pointer ${showArchivedOnly ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  >
                    Archived ({threads.filter(t => t.isArchived).length})
                  </button>
                </div>
              </div>

              {/* Global search input field */}
              <div className="p-2 border-b border-slate-200 bg-white shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3 items-center justify-center text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search messages, files, peers..."
                    value={globalSearchQuery}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-8 p-1.5 text-[9px] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                  {globalSearchQuery && (
                    <button
                      onClick={() => {
                        setGlobalSearchQuery('');
                        setGlobalSearchResults(null);
                      }}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Thread List */}
              <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                {globalSearchQuery.trim() ? (
                  /* GLOBAL SEARCH EXPERT VIEW */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Ecosystem Search Results</span>
                      <button 
                        onClick={() => { setGlobalSearchQuery(''); setGlobalSearchResults(null); }}
                        className="text-[8px] font-bold text-slate-400 hover:text-slate-600 underline"
                      >
                        Clear
                      </button>
                    </div>

                    {!globalSearchResults ? (
                      <div className="text-center py-4 text-slate-400 italic text-[10px]">Analyzing indices...</div>
                    ) : (
                      <>
                        {/* Users Found */}
                        {globalSearchResults.users?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Found Contacts</span>
                            {globalSearchResults.users.map((usr: any) => (
                              <button
                                key={usr.id}
                                onClick={() => handleStartDirectChat(usr.id)}
                                className="w-full text-left p-1.5 bg-white hover:bg-indigo-50/50 border border-slate-200 rounded flex items-center justify-between text-[10px] cursor-pointer"
                              >
                                <span className="font-extrabold text-slate-800 truncate block max-w-[150px]">{usr.name}</span>
                                <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1.5 rounded">{usr.role}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Threads Found */}
                        {globalSearchResults.threads?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Conversations</span>
                            {globalSearchResults.threads.map((thr: any) => (
                              <button
                                key={thr.id}
                                onClick={() => handleSelectThread(thr)}
                                className="w-full text-left p-1.5 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded flex items-center justify-between text-[10px] cursor-pointer"
                              >
                                <span className="font-black text-slate-800 truncate block max-w-[150px]">{thr.name}</span>
                                <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 rounded capitalize">{thr.type}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Msg matching */}
                        {globalSearchResults.messages?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Messages</span>
                            {globalSearchResults.messages.map((m: any) => (
                              <button
                                key={m.id}
                                onClick={async () => {
                                  // Locate thread
                                  const matchingThr = threads.find(t => t.id === m.threadId);
                                  if (matchingThr) {
                                    handleSelectThread(matchingThr);
                                  } else {
                                    handleSelectThread({ id: m.threadId, name: 'Search Associated Channel', type: 'system' });
                                  }
                                }}
                                className="w-full text-left p-1.5 bg-slate-100 hover:bg-slate-200/50 rounded flex flex-col text-[9px] gap-0.5 cursor-pointer max-w-full"
                              >
                                <span className="font-extrabold text-indigo-700">{m.senderName} ({m.senderRole}):</span>
                                <span className="text-slate-600 block line-clamp-2 italic">"{m.content}"</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Files Found */}
                        {globalSearchResults.files?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Shared Files</span>
                            {globalSearchResults.files.map((file: any) => (
                              <div
                                key={file.id}
                                className="p-1.5 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-between text-[9px]"
                              >
                                <span className="truncate font-extrabold text-slate-700 max-w-[130px]">{file.attachment.name}</span>
                                <a
                                  href={file.attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline font-black bg-white px-1.5 py-0.5 rounded border border-indigo-150"
                                >
                                  Open
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        {globalSearchResults.users?.length === 0 &&
                         globalSearchResults.threads?.length === 0 &&
                         globalSearchResults.messages?.length === 0 &&
                         globalSearchResults.files?.length === 0 && (
                          <div className="text-center py-6 text-slate-400 italic text-[10px]">No ecosystem matches. Try other terms.</div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* NORMAL THREAD LIST WITH ACTIVE/ARCHIVE FILTER */
                  <>
                    <div className="text-[9px] font-bold text-slate-400 uppercase px-2 py-1 tracking-wider">Academic Channels</div>
                    {threads.filter(t => !!t.isArchived === showArchivedOnly).length === 0 ? (
                      <div className="p-4 text-center text-slate-405 italic text-[11px]">
                        {showArchivedOnly ? 'No archived threads found.' : 'No active chats yet.'}
                      </div>
                    ) : (
                      threads.filter(t => !!t.isArchived === showArchivedOnly).map((thread) => {
                        const isSelected = selectedThread?.id === thread.id;
                        return (
                          <button
                            key={thread.id}
                            onClick={() => handleSelectThread(thread)}
                            className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 items-start cursor-pointer ${
                              isSelected 
                                ? 'bg-white border-indigo-200 text-slate-900 shadow-xs ring-1 ring-indigo-50 font-semibold' 
                                : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-950'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 w-full">
                              {thread.type === 'system' && <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                              {thread.type === 'cohort' && <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                              {thread.type === 'unit' && <BookOpen className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                              {thread.type === 'direct' && <MessageSquare className="h-3.5 w-3.5 text-teal-500 shrink-0" />}
                              <span className="truncate font-black text-slate-800 text-[11px] flex-1">{thread.name}</span>
                              {thread.isPinned && <Pin className="h-2.5 w-2.5 text-indigo-400 shrink-0 select-none rotate-45" />}
                              {thread.isArchived && <span className="bg-slate-200 text-slate-600 text-[8px] font-black rounded px-1 shrink-0 uppercase tracking-tight">Archived</span>}
                            </div>
                            {thread.lastMessage && (
                              <span className="text-[10px] text-slate-400 truncate w-full italic">
                                {thread.lastMessage.senderName}: {thread.lastMessage.content}
                              </span>
                            )}
                            {!thread.lastMessage && (
                              <span className="text-[10px] text-slate-300 italic w-full">Empty channel</span>
                            )}
                          </button>
                        );
                      })
                    )}

                    {/* People You Can Contact Section */}
                    {!showArchivedOnly && (
                      <div className="pt-4 border-t border-slate-200 mt-3 select-none">
                        <div className="text-[9px] font-black text-slate-405 uppercase px-2 py-1 tracking-wider flex items-center justify-between">
                          <span>Academic Contact Directory</span>
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        
                        {/* Tab Selectors */}
                        <div className="flex gap-1 overflow-x-auto px-1 py-1 border-b border-slate-100 shrink-0 scrollbar-none">
                          {(['suggested', 'recent', 'lecturers', 'students', 'parents', 'admins'] as const).map((tab) => {
                            const count = directory[tab === 'recent' ? 'recentChats' : tab]?.length || 0;
                            return (
                              <button
                                key={tab}
                                onClick={() => setActiveDirectoryTab(tab)}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold capitalize whitespace-nowrap cursor-pointer transition-all ${
                                  activeDirectoryTab === tab 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                                }`}
                              >
                                {tab === 'recent' ? 'Recent' : tab == 'parents' ? 'Family/Parents' : tab}: ({count})
                              </button>
                            );
                          })}
                        </div>

                        {/* List per Tab */}
                        <div className="space-y-1 mt-2 max-h-[220px] overflow-y-auto pr-1">
                          {(() => {
                            const activeList = directory[activeDirectoryTab === 'recent' ? 'recentChats' : activeDirectoryTab] || [];
                            if (activeList.length === 0) {
                              return (
                                <div className="text-center py-6 text-slate-400 italic text-[9px]">
                                  No records found in this category.
                                </div>
                              );
                            }
                            return activeList.map((contact: any) => (
                              <button
                                key={contact.id}
                                onClick={() => handleStartDirectChat(contact.id)}
                                className="w-full text-left p-1.5 bg-slate-50/50 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100 rounded-lg flex items-center justify-between cursor-pointer transition-all text-[10px]"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-extrabold text-slate-800 block truncate max-w-[130px]">{contact.name}</span>
                                    <span className="text-[8px] text-slate-400 block truncate max-w-[130px]">{contact.relation || contact.email}</span>
                                  </div>
                                </div>
                                <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded cursor-pointer shrink-0 hover:bg-indigo-100 transition-all">Chat</span>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Side: Active Channel Dialogue Stream */}
            <div className="flex-1 bg-white flex flex-col overflow-hidden">
              {selectedThread ? (
                <>
                  {/* Channel Header Info Block */}
                  <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between shrink-0 select-none">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-xs truncate capitalize">{selectedThread.name}</h3>
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 font-mono text-[9px] rounded uppercase font-bold tracking-tight">
                          {selectedThread.type}
                        </span>

                        {/* Archive / Restore actions toggles */}
                        {selectedThread.isArchived ? (
                          <button
                            onClick={() => handleRestoreThread(selectedThread.id)}
                            className="px-1.5 py-0.5 text-[8px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-150 border border-indigo-200 rounded uppercase tracking-wide cursor-pointer flex items-center gap-0.5"
                            title="Unarchive thread"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>Unarchive</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveThread(selectedThread.id)}
                            className="px-1.5 py-0.5 text-[8px] font-black text-rose-600 bg-rose-50 hover:bg-rose-150 border border-rose-200 rounded uppercase tracking-wide cursor-pointer flex items-center gap-0.5"
                            title="Archive conversation"
                          >
                            <X className="w-2.5 h-2.5" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">{selectedThread.description || 'Secure communication pipeline.'}</p>
                    </div>

                    {/* Active Live Lecture Banner if available */}
                    <div className="flex items-center gap-3">
                      {liveClassrooms.length > 0 && (
                        <button
                          onClick={() => handleJoinClassroom(liveClassrooms[0].id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs animate-pulse cursor-pointer shrink-0 text-[10px]"
                        >
                          <Radio className="h-3 w-3 text-white" />
                          <span>LECTURE LIVE: JOIN NOW</span>
                        </button>
                      )}

                      {/* Direct Peer Calling buttons Expansion (FIX 4) */}
                      <div className="flex items-center gap-1.5 border-r border-slate-205 pr-3 select-none">
                        <button
                          onClick={() => handleStartCall('voice')}
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 cursor-pointer transition-all border border-slate-200"
                          title="Start Instant Audio Voice Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartCall('video')}
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 cursor-pointer transition-all border border-slate-200"
                          title="Start Instant HD Video Call"
                        >
                          <Video className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Lecturer can start dynamic class sessions */}
                      {(user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') && (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Enter Lesson Title..."
                            value={classTitleInput}
                            onChange={(e) => setClassTitleInput(e.target.value)}
                            className="bg-white px-2.5 py-1 text-[10px] border border-slate-300 rounded focus:outline-none focus:border-indigo-400 w-32"
                          />
                          <button
                            onClick={handleStartClassroom}
                            disabled={!classTitleInput.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-2.5 py-1 rounded transition-all font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Video className="h-3 w-3" />
                            <span>Start Lecture</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic Pins banner */}
                  {selectedThread.pinnedContent && (
                    <div className="bg-amber-50 border-b border-amber-200/60 p-2.5 px-4 text-amber-900 grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] shrink-0">
                      <div className="flex items-start gap-1.5">
                        <Pin className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-amber-950 uppercase tracking-wide text-[9px] block">Timetable & Venues</span>
                          <span className="italic select-all">{selectedThread.pinnedContent.timetable || 'No custom timetable coordinates pinned.'}</span>
                          {(user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') && (
                            <button 
                              onClick={() => {
                                const val = prompt("Edit pinned schedule details:", selectedThread.pinnedContent.timetable || '');
                                if (val !== null) handlePinContent('timetable', val);
                              }}
                              className="text-indigo-600 text-[9px] hover:underline font-bold block mt-0.5"
                            >
                              Edit timetable pin
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-1.5 border-t md:border-t-0 md:border-l border-amber-200/70 md:pl-3">
                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-amber-950 uppercase tracking-wide text-[9px] block">Pinned Unit Syllabus / Exams</span>
                          <span className="italic select-all">{selectedThread.pinnedContent.examDates || selectedThread.pinnedContent.lectureNotes || 'Consult lecturers for academic updates.'}</span>
                          {(user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') && (
                            <button 
                              onClick={() => {
                                const val = prompt("Edit pinned syllabus notes:", selectedThread.pinnedContent.examDates || selectedThread.pinnedContent.lectureNotes || '');
                                if (val !== null) handlePinContent('examDates', val);
                              }}
                              className="text-indigo-600 text-[9px] hover:underline font-bold block mt-0.5"
                            >
                              Edit academic pin
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages Stream viewport */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/55 relative flex flex-col">
                    {/* Call Overlay Stage (FIX 4 & 5) */}
                    {currentCall && (
                      <div className="absolute inset-0 bg-slate-950 text-white z-20 flex flex-col overflow-hidden animate-fade-in select-none">
                        {/* Upper Section: Video Feed Grid of call participants */}
                        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center overflow-y-auto">
                          {/* My own camera stream */}
                          <div className="relative aspect-video max-w-sm w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-3 mx-auto shadow-2xl">
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                              {currentCall.type === 'video' && isCameraOnInCall ? (
                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                  <span>You (HD Camera Enabled)</span>
                                </div>
                              ) : (
                                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex flex-col items-center gap-1.5">
                                  <VideoOff className="h-6 w-6 text-slate-600 mb-0.5" />
                                  <span>My Camera is Muted</span>
                                </div>
                              )}
                            </div>
                            <span className="z-10 bg-slate-950/75 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg w-auto max-w-max uppercase tracking-wider">
                              {user.name} ({user.role})
                            </span>
                            <span className="z-10 self-end text-slate-400 font-mono text-[9px] bg-slate-950/40 px-2 py-0.5 rounded">
                              {isMutedInCall ? 'Microphone Muted' : 'Speaking...'}
                            </span>
                          </div>

                          {/* Recipient stream */}
                          <div className="relative aspect-video max-w-sm w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-3 mx-auto shadow-2xl">
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-850">
                              <div className="text-center flex flex-col items-center gap-2">
                                <div className="h-14 w-14 bg-indigo-600 text-white flex items-center justify-center font-black rounded-full text-base border-2 border-indigo-400 animate-pulse uppercase">
                                  {currentCall.hostId === user.id ? 'PE' : currentCall.hostName?.substring(0,2).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">
                                  {currentCall.status === 'ringing' ? 'Ringing peer...' : 'Peer Connected'}
                                </span>
                              </div>
                            </div>
                            <span className="z-10 bg-slate-950/75 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg w-auto max-w-max uppercase tracking-wider">
                              {currentCall.hostId === user.id ? 'Dialogue Peer' : currentCall.hostName}
                            </span>
                            <span className="z-10 self-end text-slate-400 font-mono text-[9px] bg-slate-950/40 px-2 py-0.5 rounded">
                              {currentCall.status === 'ringing' ? 'Waiting response' : 'Online'}
                            </span>
                          </div>
                        </div>

                        {/* Control Panel action row */}
                        <div className="bg-slate-900 border-t border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              {currentCall.type.toUpperCase()} SESSION ACTIVE
                            </span>
                          </div>

                          {/* Control toggle nodes */}
                          <div className="flex items-center gap-3.5">
                            {/* Toggle Mic */}
                            <button
                              onClick={() => setIsMutedInCall(!isMutedInCall)}
                              className={`p-3 rounded-full cursor-pointer transition-all border shadow-lg ${
                                isMutedInCall ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                              }`}
                              title={isMutedInCall ? 'Unmute Mic' : 'Mute Mic'}
                            >
                              {isMutedInCall ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </button>

                            {/* Toggle Camera (Video Only) */}
                            {currentCall.type === 'video' && (
                              <button
                                onClick={() => setIsCameraOnInCall(!isCameraOnInCall)}
                                className={`p-3 rounded-full cursor-pointer transition-all border shadow-lg ${
                                  !isCameraOnInCall ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                                title={isCameraOnInCall ? 'Mute Video feed' : 'Unmute Video feed'}
                              >
                                {isCameraOnInCall ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                              </button>
                            )}

                            {/* Red Hangup Call */}
                            <button
                              onClick={handleEndCall}
                              className="p-3 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-full cursor-pointer text-white shadow-xl flex items-center transition-all hover:scale-105"
                              title="Hangup/Disconnect Active Call"
                            >
                              <Phone className="h-4 w-4 transform rotate-135" />
                            </button>
                          </div>

                          <div className="text-[9px] text-slate-500 font-mono tracking-wider">
                            SECURE FEED
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 italic gap-2 py-12">
                        <MessageSquare className="h-8 w-8 text-slate-350" />
                        <span>Send the first lesson block or Q&A comment in this channel!</span>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isSelf = msg.senderId === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 items-start max-w-lg ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}
                          >
                            {/* Short identity badge avatar */}
                            <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-black shrink-0 border border-slate-300">
                              {msg.senderName?.substring(0, 2).toUpperCase() || 'SYS'}
                            </div>

                            <div className="flex flex-col gap-1">
                              {/* Sender name details */}
                              <div className={`flex items-center gap-1.5 ${isSelf ? 'justify-end' : ''}`}>
                                <span className="font-extrabold text-slate-800 text-[10px]">{msg.senderName}</span>
                                <span className={`px-1 py-0.2 rounded-full text-[8px] font-bold tracking-wider uppercase ${
                                  msg.senderRole === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                  msg.senderRole === 'lecturer' || msg.senderRole === 'staff' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                  msg.senderRole === 'system' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                  'bg-slate-200 text-slate-600'
                                }`}>
                                  {msg.senderRole}
                                </span>
                                <span className="text-[8px] text-slate-400 font-mono flex items-center gap-1">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isSelf && (
                                    <span className="font-sans font-black text-[9px] select-none" title={`Message Status: ${msg.status || 'sent'}`}>
                                      {msg.status === 'read' ? (
                                        <span className="text-indigo-600 dark:text-sky-400">✓✓</span>
                                      ) : msg.status === 'delivered' ? (
                                        <span className="text-slate-400">✓✓</span>
                                      ) : (
                                        <span className="text-slate-300">✓</span>
                                      )}
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Text content card holding message and attachment */}
                              <div className={`p-3 rounded-xl shadow-xs text-slate-800 ${
                                msg.type === 'system_alert' ? 'bg-slate-900 text-slate-200 border border-indigo-950 font-mono text-[10px]' : 
                                isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-250/80'
                              }`}>
                                {msg.content && <p className="whitespace-pre-line leading-relaxed text-[11px]">{msg.content}</p>}

                                {/* Render Attachment card */}
                                {msg.attachment && (
                                  <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 border text-[10px] ${
                                    isSelf ? 'bg-indigo-700 border-indigo-500 text-indigo-50' : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}>
                                    {msg.type === 'image' ? <Image className="h-4 w-4 shrink-0 text-indigo-400" /> : <FileText className="h-4 w-4 shrink-0 text-indigo-400" />}
                                    <span className="truncate flex-1 font-bold text-[10px]">{msg.attachment.name}</span>
                                    <a
                                      href={msg.attachment.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`p-1 rounded-md transition-all ${
                                        isSelf ? 'hover:bg-indigo-800 text-white' : 'hover:bg-slate-250 text-indigo-600'
                                      }`}
                                    >
                                      <Download className="h-3 w-3" />
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Reactions block and Emoji picker */}
                              <div className={`flex items-center gap-1.5 flex-wrap mt-1 ${isSelf ? 'justify-end' : ''}`}>
                                {msg.reactions?.map((r: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleAddReaction(msg.id, r.emoji)}
                                    title={`Reacted by ${r.userName}`}
                                    className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] hover:bg-slate-200 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>{r.emoji}</span>
                                    <span className="text-slate-400 font-mono">1</span>
                                  </button>
                                ))}

                                {/* Add Reaction picker buttons */}
                                <div className="opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1.5 bg-white border border-slate-200 p-0.5 px-1.5 rounded-md shadow-xs">
                                  {['👍', '❤️', '🔥', '👏', '❓'].map((emo) => (
                                    <button
                                      key={emo}
                                      onClick={() => handleAddReaction(msg.id, emo)}
                                      className="hover:scale-130 transition-transform cursor-pointer text-[10px]"
                                    >
                                      {emo}
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing Indicators block */}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono italic animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin text-slate-350" />
                        <span>{typingUsers.map(u => u.userName).join(', ')} is typing...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Message Builder Panel */}
                  <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-3 bg-white flex flex-col gap-2 shrink-0 select-none">
                    {/* Active Attachments bar */}
                    {selectedAttachment && (
                      <div className="bg-indigo-50 border border-indigo-150 p-2 rounded-lg flex items-center justify-between text-[10px] text-indigo-900">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-extrabold">{selectedAttachment.name}</span>
                          <span className="text-[8px] bg-indigo-200 text-indigo-800 uppercase px-1 rounded">{selectedAttachment.type} ready</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAttachment(null)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Real uploading indicators & error logs */}
                    <div className="flex flex-col gap-1 w-full px-1">
                      {isUploading && (
                        <div className="flex items-center gap-1.5 text-indigo-650 text-[10px] font-mono italic animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                          <span>Processing/uploading media...</span>
                        </div>
                      )}
                      {errorMsg && (
                        <div className="bg-rose-50 border border-rose-150 text-rose-700 text-[10px] px-2 py-1 rounded-md flex items-center justify-between">
                          <span>{errorMsg}</span>
                          <button type="button" onClick={() => setErrorMsg('')} className="text-rose-450 hover:text-rose-700 font-bold">×</button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Real Physical File Selection input */}
                      <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleRealFileChange}
                      />

                      {/* Attach triggers */}
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
                        {/* Device File Picker Trigger */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="Upload Real File from Device"
                          className="p-1.5 text-indigo-600 hover:bg-white rounded transition-all cursor-pointer relative"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span className="absolute -top-1 -right-0.5 flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                          </span>
                        </button>

                        {/* Webcam Capture Trigger */}
                        <button
                          type="button"
                          onClick={startCamera}
                          title="Snap Photo with Camera"
                          className="p-1.5 text-emerald-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5" />
                        </button>

                        <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>

                        <button
                          type="button"
                          onClick={() => handleAttachFileMock('image')}
                          title="Simulate Image Attachment"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Image className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttachFileMock('file')}
                          title="Simulate Lecture Document PDF"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttachFileMock('audio')}
                          title="Simulate Voice Clip attachment"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Mic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttachFileMock('video')}
                          title="Simulate MP4 Tutorial Video"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Main Text input */}
                      <input
                        type="text"
                        placeholder={`Type academic query or comment in ${selectedThread.name}...`}
                        value={inputText}
                        onChange={handleInputChange}
                        className="flex-1 bg-slate-50 text-[11px] border border-slate-200 rounded-lg py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim() && !selectedAttachment}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white min-w-[65px] px-3.5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-colors shrink-0"
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 p-12 text-center bg-slate-50/40">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 shadow-2xs">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-extrabold text-slate-800 text-sm">Welcome to SmartCampusConnect Messaging</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Connect and collaborate with classmate peers, browse student and staff directories, and view official administration announcements.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        fetchSearchUsers();
                        setShowDirectModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer select-none"
                    >
                      Start New Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fetchSearchUsers();
                        setShowDirectModal(true);
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none"
                    >
                      Browse Contacts
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSessionView('drive');
                      }}
                      className="px-4 py-2 bg-white border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer select-none"
                    >
                      View Announcements
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* View B: Live Lecture Video Classrooms */}
        {activeSessionView === 'classrooms' && (
          <div className="flex-1 flex flex-col md:flex-row bg-[#0b0f19] text-white">
            
            {activeLectureRoom ? (
              // 1. Inside an active conference class
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Classroom Header Controls */}
                <div className="bg-[#121824] px-4 py-3 border-b border-[#1f283d] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 select-none">
                  <div>
                    <h3 className="text-white text-xs font-black flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping shrink-0" />
                      <span>{activeLectureRoom.title}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Host: Lecturer {activeLectureRoom.hostName} | Status: Connected</p>
                  </div>

                  {/* Top Bar Call controls */}
                  <div className="flex items-center flex-wrap gap-2 text-[10px]">
                    <button
                      onClick={() => setIsClassMuted(!isClassMuted)}
                      className={`p-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer border transition-colors ${
                        isClassMuted 
                          ? 'bg-rose-950/75 text-rose-400 border-rose-900/60' 
                          : 'bg-[#182136] text-emerald-400 border-[#2f3d59]'
                      }`}
                    >
                      {isClassMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      <span>{isClassMuted ? 'Muted' : 'Speaking'}</span>
                    </button>

                    <button
                      onClick={() => setIsClassCameraOn(!isClassCameraOn)}
                      className="p-1.5 rounded-lg bg-[#182136] hover:bg-[#202b47] border border-[#2f3d59] font-bold flex items-center gap-1 cursor-pointer text-slate-200"
                    >
                      {isClassCameraOn ? <Video className="h-3.5 w-3.5 text-indigo-400" /> : <VideoOff className="h-3.5 w-3.5 text-slate-400" />}
                      <span>Camera</span>
                    </button>

                    <button
                      onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
                      title="Audio-only streaming mode for optimizing cellular data"
                      className={`p-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        lowBandwidthMode 
                          ? 'bg-amber-950/60 border-amber-900/60 text-amber-400' 
                          : 'bg-[#182136] border-[#2f3d59] text-slate-200'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>{lowBandwidthMode ? 'Savings On' : 'Standard HD'}</span>
                    </button>
                  </div>
                </div>

                {/* Video Stage Frame & Participant list Split wrapper */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-none">
                  
                  {/* Left Side: Video canvas rendering */}
                  <div className="flex-1 bg-[#090c13] relative flex items-center justify-center p-4 overflow-hidden">
                    
                    {lowBandwidthMode ? (
                      // Audio-only bandwidth layout
                      <div className="text-center space-y-3.5 z-10">
                        <div className="h-20 w-20 rounded-full bg-slate-900 border border-indigo-900 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                          <Radio className="h-8 w-8 text-indigo-400" />
                        </div>
                        <p className="text-slate-300 font-extrabold">Streaming Audio Only Channels</p>
                        <p className="text-[10px] text-slate-500 max-w-sm mx-auto">Saves up to 88% data. Preserving resources for cellular devices.</p>
                      </div>
                    ) : (
                      // Live Class Simulator View
                      <div className="w-full h-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-[#10141f] border border-[#1e2333]/90 relative flex flex-col">
                        
                        {/* Stream simulation */}
                        <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                          {isClassCameraOn ? (
                            <>
                              <img
                                src={isScreenSharing 
                                  ? "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1080" 
                                  : "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1080"
                                }
                                alt="Lecture Screen"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover opacity-80"
                              />
                              <div className="absolute top-3 left-3 bg-[#0a0f1d]/90 border border-[#20293c] px-2.5 py-1 text-[9px] rounded-md font-mono text-indigo-400 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span>{isScreenSharing ? "Screen Share Viewport" : "Lecturer Classroom DSLR Stream"}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-slate-400">
                              <VideoOff className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                              <p className="font-extrabold text-[#94a3b8]">Live Camera feeds disabled</p>
                              <p className="text-[10px] text-[#475569]">Turn on your camera below to broadcast</p>
                            </div>
                          )}

                          {/* Recording red light status flag */}
                          {isRecording && (
                            <div className="absolute top-3 right-3 bg-rose-950/90 border border-rose-800 text-rose-400 font-mono text-[9px] px-2 py-0.5 rounded flex items-center gap-1 animate-pulse select-none">
                              <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
                              <span className="font-bold">REC CLOUD CLUSTERS</span>
                            </div>
                          )}

                          {/* Floating user status tag if raised hand */}
                          {roomParticipants.some(p => p.userId === user.id && p.handRaised) && (
                            <div className="absolute bottom-3 left-3 bg-amber-950 border border-amber-800 text-amber-400 px-2.5 py-1 text-[9px] rounded-md font-bold flex items-center gap-1 shadow-md">
                              <Hand className="h-3 w-3 text-amber-400 animate-bounce" />
                              <span>YOUR HELP HAND IS RAISED</span>
                            </div>
                          )}
                        </div>

                        {/* Local self micro-preview overlay */}
                        <div className="absolute bottom-4 right-4 w-28 h-20 bg-slate-900 border-2 border-indigo-600/70 rounded-md overflow-hidden shadow-xl flex items-center justify-center">
                          <div className="h-full w-full bg-[#182030] flex items-center justify-center text-center">
                            <div>
                              <span className="text-[10px] block font-black text-white">{user.name.split(' ')[0]}</span>
                              <span className="text-[8px] block text-indigo-400 capitalize">({user.role})</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Right Side Participant Drawer List */}
                  <div className="w-full md:w-64 bg-[#0e1320] border-t md:border-t-0 md:border-l border-[#1f283d] flex flex-col overflow-y-auto">
                    <div className="p-3 bg-[#131b2d] border-b border-[#1f283d] flex items-center justify-between text-[10px] font-bold">
                      <span>PARTICIPANTS ({roomParticipants.length})</span>
                      <span className="text-slate-400">Class State</span>
                    </div>

                    <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                      {roomParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 bg-[#141b2c] rounded border border-[#1e2332]/60 flex items-center justify-between text-[10px]"
                        >
                          <div className="min-w-0 flex items-center gap-1.5 flex-1 pr-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block truncate text-slate-100">{p.name}</span>
                              <span className="text-[8px] text-slate-400 block truncate capitalize bg-[#1c2438] inline-block px-1 rounded">{p.role}</span>
                            </div>
                          </div>

                          {/* Controls & Raises indicators */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.handRaised && (
                              <span className="bg-amber-950 border border-amber-800 text-amber-500 p-0.5 px-1 rounded font-bold text-[8px] flex items-center gap-0.5 animate-pulse">
                                <Hand className="h-2.5 w-2.5 text-amber-500" />
                                <span className="hidden sm:inline">RAISED</span>
                              </span>
                            )}
                            {p.isMuted ? <MicOff className="h-3 w-3 text-rose-500" /> : <Mic className="h-3 w-3 text-emerald-400" />}
                            
                            {/* Lecturer host operations */}
                            {(user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') && p.userId !== user.id && (
                              <button
                                onClick={() => handleClassroomControl('toggle-recording', p.userId)}
                                title="Mute Participant (Host override)"
                                className="text-[#f43f5e] hover:bg-rose-950 p-1 rounded cursor-pointer border border-transparent hover:border-rose-900"
                              >
                                <VolumeX className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom Bar Interactive Buttons Row */}
                <div className="bg-[#121824] px-4 py-3.5 border-t border-[#1f283d] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Student button: Raise Hand */}
                    {user.role === 'student' && (
                      <button
                        onClick={handleToggleRaiseHand}
                        className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-transform text-[11px] border border-amber-500 shadow-sm"
                      >
                        <Hand className="h-4 w-4 text-white" />
                        <span>Raise / Lower Hand</span>
                      </button>
                    )}

                    {/* Lecturer Host Specific actions */}
                    {(user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') && (
                      <div className="flex items-center flex-wrap gap-2 text-[10px]">
                        <button
                          onClick={() => handleClassroomControl('toggle-recording')}
                          className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                            isRecording 
                              ? 'bg-rose-900/60 border-rose-700 text-rose-100 animate-pulse' 
                              : 'bg-[#182136] border-[#2f3d59] text-indigo-400'
                          }`}
                        >
                          <Circle className="h-3 w-3 fill-rose-500 text-rose-500" />
                          <span>{isRecording ? 'Stop Recording' : 'Record Lecture'}</span>
                        </button>

                        <button
                          onClick={() => handleClassroomControl('screen-share')}
                          className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                            isScreenSharing 
                              ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' 
                              : 'bg-[#182136] border-[#2f3d59] text-slate-200'
                          }`}
                        >
                          <Tv className="h-3.5 w-3.5" />
                          <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Red Hangup button */}
                  <button
                    onClick={() => {
                      if (user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin') {
                        if (confirm("End lecture session for all enrolled attendees? The system will compile any recordings.")) {
                          handleClassroomControl('stop-session');
                        }
                      } else {
                        setActiveLectureRoom(null);
                        setRoomParticipants([]);
                        setActiveSessionView('chat');
                      }
                    }}
                    className="bg-[#be123c] hover:bg-[#9f1239] hover:shadow-lg hover:shadow-rose-950/10 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-700 text-[11px]"
                  >
                    <Power className="h-4 w-4" />
                    <span>{user.role === 'staff' || user.role === 'lecturer' || user.role === 'admin' ? 'Conclude Class Session' : 'Leave Lecture'}</span>
                  </button>
                </div>

              </div>
            ) : (
              // 2. Classrooms dashboard selector when not inside a lecture
              <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 bg-slate-900 text-slate-100 overflow-y-auto">
                <div className="flex-1 space-y-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-indigo-950 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-indigo-400">LECTURE STREAMING SERVICES</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Join active voice classrooms, HD board channels or review recordings instantly.</p>
                    </div>
                    <Radio className="h-8 w-8 text-indigo-500/20" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">Live Lessons in Your Channels</h4>
                    {threads.filter(t => t.type === 'unit' || t.type === 'cohort').map((th) => (
                      <div 
                        key={th.id}
                        className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px]"
                      >
                        <div>
                          <span className="font-extrabold text-white block">{th.name}</span>
                          <span className="text-[10px] text-slate-400">{th.description || 'Secure academic classroom pipeline.'}</span>
                        </div>

                        {/* Join trigger button */}
                        <button
                          onClick={() => {
                            setSelectedThread(th);
                            setActiveSessionView('chat');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Open Channel Rooms</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side live announcements box */}
                <div className="w-full md:w-80 space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                    <Radio className="h-4 w-4" />
                    <span>OFFICIAL DEAN BROADCAST ALERTS</span>
                  </div>
                  
                  <div className="space-y-2 overflow-y-auto max-h-[300px]">
                    {announcements.length === 0 ? (
                      <p className="text-slate-500 italic text-[10px]">No recent broadcast priority listings.</p>
                    ) : (
                      announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className={`p-3 rounded-lg border text-[10px] space-y-1.5 ${
                            ann.priority === 'CRITICAL' ? 'bg-rose-950/60 border-rose-800 text-rose-200' :
                            ann.priority === 'HIGH' ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' :
                            'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-white">{ann.title}</span>
                            <span className="p-0.5 px-1 bg-black/40 rounded text-[8px] font-bold tracking-tight">{ann.priority}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[10px]">{ann.message}</p>
                          <span className="text-[9px] text-slate-500 block font-mono">{ann.senderName} • {new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* View C: Pinned Recorded Lecture Drive */}
        {activeSessionView === 'drive' && (
          <div className="flex-1 p-5 bg-slate-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-slate-800 font-extrabold text-xs">OFFICIAL LEARNING ARCHIVE</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Access recorded units, lecture notes overlays, and syllabus compilations.</p>
                </div>
                <BookOpen className="h-6 w-6 text-indigo-505 shadow-xs bg-indigo-50 p-1 rounded-md" />
              </div>

              {/* Recorded list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recordingsList.length === 0 ? (
                  <div className="col-span-full bg-white p-12 text-center text-slate-400 italic rounded-xl border border-slate-200">
                    No recordings uploaded. When a lecturer closes an active classroom with 'recording on', it generates here.
                  </div>
                ) : (
                  recordingsList.map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 text-xs truncate">{rec.title}</span>
                          <span className="p-0.5 px-1.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">{rec.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Instructor: Lecturer {rec.recordedBy}</p>
                        <p className="text-[9px] text-slate-400 font-mono">Archive Code: {rec.id} • Posted {new Date(rec.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Interactive Watch Simulator */}
                      <button
                        onClick={() => alert(`Simulating Video Replay for:\n"${rec.title}"\nStored URL: ${rec.url}`)}
                        className="mt-3.5 w-full py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-slate-700 font-bold flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                      >
                        <Play className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Watch Replay Lecture</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Advanced Dean/Admin Announcement Console Panel */}
              {user.role === 'admin' && (
                <div id="dean-announcement-console" className="bg-white p-5 rounded-2xl border border-slate-250 mt-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <h3 className="text-slate-800 font-black text-xs">ADMINISTRATOR / DEAN BROADCAST MODULE</h3>
                  </div>

                  {annSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-lg font-bold text-[10px] animate-pulse">
                      {annSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handlePublishAnnouncement} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">BROADCAST TITLE</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Supplementary Exams Block 2"
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-850"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">ALARM PRIORITY</label>
                        <select
                          value={annPriority}
                          onChange={(e: any) => setAnnPriority(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-700"
                        >
                          <option value="LOW">LOW (General update)</option>
                          <option value="MEDIUM">MEDIUM (University notice)</option>
                          <option value="HIGH">HIGH (Action required)</option>
                          <option value="CRITICAL">CRITICAL (System priority)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">TARGET COHORT (OPTIONAL)</label>
                      <input
                        type="text"
                        placeholder="e.g. cohort-y1-cs (Leave empty to broadcast university-wide)"
                        value={annCohortId}
                        onChange={(e) => setAnnCohortId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">BROADCAST SIGNAL MESSAGE</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write official announcement context here. This will propagate alerts to active streams."
                        value={annMessage}
                        onChange={(e) => setAnnMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-850 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 hover:shadow-md text-white font-bold p-2.5 px-5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[11px]"
                    >
                      <Radio className="h-4 w-4 text-white" />
                      <span>Transmit Priority Broadcast</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {activeSessionView === 'graph' && (
          <NetworkGraph 
            user={{ id: user.id, name: user.name, role: user.role, email: user.email }}
            onStartChat={(targetUserId) => {
              handleStartDirectChat(targetUserId);
              setActiveSessionView('chat');
            }}
          />
        )}

      </div>

      {/* Start DM Direct Modal */}
      <AnimatePresence>
        {showDirectModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-4 space-y-3 text-slate-800 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <span className="font-extrabold text-[12px] text-slate-800">Establish Direct Chat (DM)</span>
                <button onClick={() => setShowDirectModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students, staff or lectures..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 pl-8 p-2 rounded-lg text-[10px]"
                />
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1">
                {['lecturer', 'student', 'parent', 'admin'].map((role) => {
                  const filtered = usersList.filter(u => 
                    (u.role === role || (role === 'lecturer' && u.role === 'staff')) &&
                    (u.name.toLowerCase().includes(searchText.toLowerCase()) || u.role.toLowerCase().includes(searchText.toLowerCase()))
                  );
                  
                  if (filtered.length === 0) return null;
                  
                  const roleLabel = 
                    role === 'lecturer' ? 'Lecturers' :
                    role === 'student' ? 'Students' :
                    role === 'parent' ? 'Parents' :
                    'Administrators';
                  
                  return (
                    <div key={role} className="space-y-1">
                      <div className="text-[9px] font-black tracking-wider text-indigo-400 pl-1 uppercase">{roleLabel}</div>
                      {filtered.map((usr) => (
                        <button
                          key={usr.id}
                          onClick={() => handleStartDirectChat(usr.id)}
                          className="w-full text-left p-2 hover:bg-indigo-50/70 border border-transparent hover:border-indigo-150 rounded-lg flex items-center justify-between cursor-pointer transition-all text-[10px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-800 block truncate max-w-[130px]">{usr.name}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{usr.email}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-bold uppercase rounded text-[8px] tracking-tight">{usr.role}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Incoming Ringing Call Notification Overlay (FIX 5) */}
      <AnimatePresence>
        {incomingCall && (
          <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 select-none">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center animate-bounce">
                {incomingCall.type === 'video' ? <Video className="h-5 w-5 text-white" /> : <Phone className="h-5 w-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm truncate">{incomingCall.hostName}</h4>
                <p className="text-slate-400 text-xs animate-pulse flex items-center gap-1">
                  <span>Incoming {incomingCall.type} call...</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleDeclineCall}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleJoinCall(incomingCall)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Accept & Connect
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Device Camera Modal Overlay */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-slate-200 flex flex-col animate-in fade-in"
            >
              <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-indigo-200 animate-pulse" />
                  <span className="font-extrabold text-sm tracking-tight text-white uppercase font-sans">Active Device Camera</span>
                </div>
                <button 
                  type="button" 
                  onClick={stopCamera} 
                  className="text-white bg-indigo-500 hover:bg-indigo-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 flex flex-col items-center gap-4 bg-slate-50">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <video 
                    ref={cameraVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 text-xs">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                      <span className="font-mono">Uploading Snap...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex w-full gap-3 justify-center">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    disabled={isUploading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
