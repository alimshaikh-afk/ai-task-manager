<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Task Manager</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Firebase -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDiy_mVFVhjZddTgM6kYELKc4uB_uygyoc",
            authDomain: "ai-personal-assistant-225fe.firebaseapp.com",
            projectId: "ai-personal-assistant-225fe",
            storageBucket: "ai-personal-assistant-225fe.firebasestorage.app",
            messagingSenderId: "564158119450",
            appId: "1:564158119450:web:ce50c57e2832876dfd5ba3"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        window.firebaseDb = db;
        window.firebaseModules = { doc, setDoc, getDoc, collection, getDocs };
        window.firebaseReady = true;
        window.dispatchEvent(new Event('firebaseReady'));
    </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        #root { height: 100vh; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback } = React;

        // ─── ICONS ───────────────────────────────────────────────────────────
        const CheckCircle2 = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="m9 12 2 2 4-4"/>
            </svg>
        );
        const Circle = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
                <circle cx="12" cy="12" r="10"/>
            </svg>
        );
        const Trash2 = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
        );
        const Send = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
        );
        const Loader2 = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
        );
        const Sparkles = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                <path d="M5 3v4M3 5h4M6 17v4M4 19h4"/>
            </svg>
        );
        const Bell = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
        );
        const Settings = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        );
        const Brain = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69A2.5 2.5 0 0 1 4.5 9.5a2.5 2.5 0 0 1 2.16-2.47A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69A2.5 2.5 0 0 0 19.5 9.5a2.5 2.5 0 0 0-2.16-2.47A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
        );
        const Mail = ({ size = 24, className = "" }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
        );

        // ─── FIREBASE HELPERS ─────────────────────────────────────────────────
        const USER_ID = 'default_user';

        async function fbSaveTasks(tasks) {
            if (!window.firebaseReady) return;
            try {
                const { doc, setDoc } = window.firebaseModules;
                await setDoc(doc(window.firebaseDb, 'users', USER_ID), { tasks }, { merge: true });
            } catch(e) { console.warn('FB save tasks error:', e); }
        }
        async function fbSaveMessages(messages) {
            if (!window.firebaseReady) return;
            try {
                const { doc, setDoc } = window.firebaseModules;
                await setDoc(doc(window.firebaseDb, 'users', USER_ID), { messages }, { merge: true });
            } catch(e) { console.warn('FB save messages error:', e); }
        }
        async function fbSaveContext(context) {
            if (!window.firebaseReady) return;
            try {
                const { doc, setDoc } = window.firebaseModules;
                await setDoc(doc(window.firebaseDb, 'users', USER_ID), { context }, { merge: true });
            } catch(e) { console.warn('FB save context error:', e); }
        }
        async function fbSaveSettings(settings) {
            if (!window.firebaseReady) return;
            try {
                const { doc, setDoc } = window.firebaseModules;
                await setDoc(doc(window.firebaseDb, 'users', USER_ID), { settings }, { merge: true });
            } catch(e) { console.warn('FB save settings error:', e); }
        }
        async function fbLoadAll() {
            if (!window.firebaseReady) return null;
            try {
                const { doc, getDoc } = window.firebaseModules;
                const snap = await getDoc(doc(window.firebaseDb, 'users', USER_ID));
                if (snap.exists()) return snap.data();
            } catch(e) { console.warn('FB load error:', e); }
            return null;
        }

        // ─── MAIN APP ─────────────────────────────────────────────────────────
        const TaskManager = () => {
            const [tasks, setTasks] = useState([]);
            const [messages, setMessages] = useState([]);
            const [context, setContext] = useState([]);
            const [inputMessage, setInputMessage] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [fbLoading, setFbLoading] = useState(true);
            const [notificationsEnabled, setNotificationsEnabled] = useState(false);
            const [showSettingsModal, setShowSettingsModal] = useState(false);
            const [showContextModal, setShowContextModal] = useState(false);
            const [apiKey, setApiKey] = useState('');
            const [tempApiKey, setTempApiKey] = useState('');
            const [userEmail, setUserEmail] = useState('');
            const [tempEmail, setTempEmail] = useState('');
            const [emailStatus, setEmailStatus] = useState('');
            const [syncStatus, setSyncStatus] = useState('Loading...');
            const messagesEndRef = useRef(null);
            const lastNotifDay = useRef({});

            // ── Load data ──
            useEffect(() => {
                async function load() {
                    setFbLoading(true);
                    // Try Firebase first
                    if (window.firebaseReady) {
                        const data = await fbLoadAll();
                        if (data) {
                            if (data.tasks) setTasks(data.tasks);
                            if (data.messages) setMessages(data.messages);
                            else setMessages([defaultWelcome()]);
                            if (data.context) setContext(data.context);
                            if (data.settings) {
                                if (data.settings.apiKey) setApiKey(data.settings.apiKey);
                                if (data.settings.email) setUserEmail(data.settings.email);
                            }
                            setSyncStatus('Synced to cloud ☁️');
                        } else {
                            setMessages([defaultWelcome()]);
                            setSyncStatus('Synced to cloud ☁️');
                        }
                    } else {
                        // Fallback: localStorage
                        const storedTasks = localStorage.getItem('ai-tasks');
                        const storedMessages = localStorage.getItem('ai-messages');
                        const storedContext = localStorage.getItem('ai-context');
                        const storedApiKey = localStorage.getItem('anthropic-api-key');
                        const storedEmail = localStorage.getItem('user-email');
                        if (storedTasks) setTasks(JSON.parse(storedTasks));
                        if (storedMessages) setMessages(JSON.parse(storedMessages));
                        else setMessages([defaultWelcome()]);
                        if (storedContext) setContext(JSON.parse(storedContext));
                        if (storedApiKey) setApiKey(storedApiKey);
                        if (storedEmail) setUserEmail(storedEmail);
                        setSyncStatus('Local storage only');
                    }
                    setFbLoading(false);
                    checkNotificationPermission();
                }

                if (window.firebaseReady) {
                    load();
                } else {
                    window.addEventListener('firebaseReady', load, { once: true });
                    // Fallback after 3s if Firebase never loads
                    setTimeout(() => {
                        if (fbLoading) load();
                    }, 3000);
                }
            }, []);

            function defaultWelcome() {
                return {
                    role: 'assistant',
                    content: "Hi! I'm your AI personal assistant. Tell me what you need to do, ask me to show your tasks, or share context about your projects — I'll remember it all.",
                    timestamp: new Date().toISOString()
                };
            }

            // ── Scheduled notifications ──
            useEffect(() => {
                const interval = setInterval(() => {
                    checkScheduledNotifications();
                    checkTaskReminders();
                }, 60000);
                return () => clearInterval(interval);
            }, [tasks, notificationsEnabled]);

            function checkNotificationPermission() {
                if ('Notification' in window) {
                    setNotificationsEnabled(Notification.permission === 'granted');
                }
            }

            async function enableNotifications() {
                if ('Notification' in window) {
                    const perm = await Notification.requestPermission();
                    setNotificationsEnabled(perm === 'granted');
                }
            }

            function checkScheduledNotifications() {
                if (!notificationsEnabled) return;
                const now = new Date();
                const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
                if (day === 5 || day === 6) return; // Skip Fri & Sat
                const h = now.getHours(), m = now.getMinutes();
                const pending = tasks.filter(t => !t.completed);
                const high = pending.filter(t => t.priority === 'high').length;

                const slots = [
                    { h: 10, m: 0,  label: '☀️ Morning Check-in' },
                    { h: 14, m: 0,  label: '⏰ Afternoon Reminder' },
                    { h: 17, m: 30, label: '🌙 Evening Wrap-up' },
                ];

                for (const slot of slots) {
                    const key = `${now.toDateString()}-${slot.h}-${slot.m}`;
                    if (h === slot.h && m === slot.m && !lastNotifDay.current[key]) {
                        lastNotifDay.current[key] = true;
                        new Notification(slot.label, {
                            body: `You have ${pending.length} pending tasks${high > 0 ? ` (${high} high priority)` : ''}. Click to open.`,
                            tag: key
                        });
                        // Also try email
                        if (userEmail) sendEmailReminder(slot.label);
                    }
                }
            }

            function checkTaskReminders() {
                if (!notificationsEnabled) return;
                const now = new Date();
                tasks.forEach(task => {
                    if (task.dueDate && !task.completed) {
                        const due = new Date(task.dueDate);
                        const diff = due - now;
                        const key = `reminder-${task.id}`;
                        if (diff > 0 && diff < 3600000 && !lastNotifDay.current[key]) {
                            lastNotifDay.current[key] = true;
                            new Notification('⏰ Task Due Soon', {
                                body: `"${task.title}" is due in less than 1 hour!`,
                                tag: key
                            });
                        }
                    }
                });
            }

            async function sendTestNotification() {
                if (!notificationsEnabled) {
                    alert('Please enable notifications first.');
                    return;
                }
                const pending = tasks.filter(t => !t.completed);
                try {
                    new Notification('🔔 Test Notification', {
                        body: `You have ${pending.length} pending tasks. Notifications are working!`,
                        tag: 'test-' + Date.now()
                    });
                    alert('Test notification sent! Check your screen.');
                } catch(e) {
                    alert('Error: ' + e.message);
                }
            }

            async function sendTestEmail() {
                if (!userEmail) { alert('Please add your email in Settings first.'); return; }
                setEmailStatus('Sending...');
                try {
                    const pending = tasks.filter(t => !t.completed);
                    const high = pending.filter(t => t.priority === 'high').length;
                    const res = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: userEmail,
                            subject: '🧪 Test Email - Task Manager',
                            tasks: pending,
                            highPriority: high,
                            label: 'Test Email'
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        setEmailStatus('✅ Email sent! Check your inbox.');
                    } else {
                        setEmailStatus('❌ Error: ' + (data.error || 'Unknown'));
                    }
                } catch(e) {
                    setEmailStatus('❌ Error: ' + e.message);
                }
            }

            async function sendEmailReminder(label) {
                if (!userEmail) return;
                try {
                    const pending = tasks.filter(t => !t.completed);
                    const high = pending.filter(t => t.priority === 'high').length;
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: userEmail,
                            subject: label + ' - Task Manager',
                            tasks: pending,
                            highPriority: high,
                            label
                        })
                    });
                } catch(e) { console.warn('Email error:', e); }
            }

            // ── Task CRUD ──
            function addTask(taskData) {
                const newTask = {
                    id: Date.now().toString() + Math.random().toString(36).slice(2),
                    title: taskData.title,
                    priority: taskData.priority || 'medium',
                    dueDate: taskData.dueDate || null,
                    category: taskData.category || 'General',
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                setTasks(prev => {
                    const updated = [...prev, newTask];
                    fbSaveTasks(updated);
                    localStorage.setItem('ai-tasks', JSON.stringify(updated));
                    return updated;
                });
                return newTask;
            }

            function toggleTask(id) {
                setTasks(prev => {
                    const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
                    fbSaveTasks(updated);
                    localStorage.setItem('ai-tasks', JSON.stringify(updated));
                    return updated;
                });
            }

            function deleteTask(id) {
                setTasks(prev => {
                    const updated = prev.filter(t => t.id !== id);
                    fbSaveTasks(updated);
                    localStorage.setItem('ai-tasks', JSON.stringify(updated));
                    return updated;
                });
            }

            function saveSettings() {
                if (tempApiKey.trim()) setApiKey(tempApiKey.trim());
                if (tempEmail.trim()) setUserEmail(tempEmail.trim());
                const settings = {
                    apiKey: tempApiKey.trim() || apiKey,
                    email: tempEmail.trim() || userEmail
                };
                fbSaveSettings(settings);
                localStorage.setItem('anthropic-api-key', settings.apiKey);
                localStorage.setItem('user-email', settings.email);
                setShowSettingsModal(false);
                setTempApiKey('');
                setTempEmail('');
                setEmailStatus('');
            }

            // ── AI Chat ──
            async function sendMessage() {
                if (!inputMessage.trim() || isLoading) return;
                if (!apiKey) { setShowSettingsModal(true); return; }

                const userMsg = { role: 'user', content: inputMessage, timestamp: new Date().toISOString() };
                const newMessages = [...messages, userMsg];
                setMessages(newMessages);
                setInputMessage('');
                setIsLoading(true);

                try {
                    // Build task list for context
                    const taskList = tasks.map(t =>
                        `[ID:${t.id}] ${t.title} | Priority: ${t.priority} | Status: ${t.completed ? 'COMPLETED' : 'PENDING'}${t.dueDate ? ' | Due: ' + t.dueDate : ''}${t.category ? ' | Category: ' + t.category : ''}`
                    ).join('\n') || 'No tasks yet.';

                    const contextList = context.length > 0
                        ? context.slice(-20).map(c => `- ${c}`).join('\n')
                        : 'No stored context yet.';

                    // ─── CRITICAL FIX: System prompt that prevents duplicate tasks ───
                    const systemPrompt = `You are a personal AI assistant and task manager. You have full memory of the user's tasks and context.

CURRENT TASKS (DO NOT RE-CREATE THESE):
${taskList}

STORED CONTEXT (things the user has shared):
${contextList}

TODAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

RESPONSE FORMAT RULES — READ CAREFULLY:
You must ALWAYS respond with a JSON object.

1. If the user is asking to SEE or LIST tasks (e.g. "what's on my plate?", "show my tasks", "what do I have to do?", "what are my pending tasks?"):
   → Return { "response": "Your message summarizing/listing their tasks" }
   → DO NOT include "new_tasks" — listing existing tasks does NOT create new ones.

2. If the user is asking you to CREATE new tasks (e.g. "add a task", "I need to do X by Friday", "remind me to Y"):
   → Return { "response": "Confirmation message", "new_tasks": [{ "title": "...", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD", "category": "..." }] }
   → Only put BRAND NEW tasks in "new_tasks". NEVER put existing tasks there.

3. If the user is sharing context/information (not a task):
   → Return { "response": "Acknowledgment", "context": ["key fact to remember"] }

4. For general questions or advice:
   → Return { "response": "Your helpful answer" }

CRITICAL: The "new_tasks" key ONLY creates new tasks. Never use it to show/list existing tasks. If you're not creating something new, omit "new_tasks" entirely.`;

                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            apiKey,
                            system: systemPrompt,
                            messages: [
                                ...newMessages.slice(-15).map(m => ({ role: m.role, content: m.content }))
                            ]
                        })
                    });

                    const data = await response.json();
                    if (data.error) throw new Error(data.error.message || data.error);

                    const aiText = data.content[0].text;
                    let parsed;
                    try {
                        parsed = JSON.parse(aiText.replace(/```json\n?|\n?```/g, '').trim());
                    } catch {
                        parsed = { response: aiText };
                    }

                    // Only create tasks from "new_tasks" key — NOT from "tasks"
                    if (parsed.new_tasks && Array.isArray(parsed.new_tasks)) {
                        parsed.new_tasks.forEach(t => addTask(t));
                    }

                    // Save new context notes if provided
                    if (parsed.context && Array.isArray(parsed.context)) {
                        setContext(prev => {
                            const updated = [...prev, ...parsed.context];
                            fbSaveContext(updated);
                            localStorage.setItem('ai-context', JSON.stringify(updated));
                            return updated;
                        });
                    }

                    const assistantMsg = {
                        role: 'assistant',
                        content: parsed.response || aiText,
                        timestamp: new Date().toISOString()
                    };
                    const updatedMessages = [...newMessages, assistantMsg];
                    setMessages(updatedMessages);
                    fbSaveMessages(updatedMessages);
                    localStorage.setItem('ai-messages', JSON.stringify(updatedMessages));

                } catch(e) {
                    console.error('AI Error:', e);
                    const errMsg = {
                        role: 'assistant',
                        content: '⚠️ ' + (e.message.includes('api_key') ? 'Invalid API key. Please check Settings.' : e.message),
                        timestamp: new Date().toISOString()
                    };
                    const updatedMessages = [...newMessages, errMsg];
                    setMessages(updatedMessages);
                    fbSaveMessages(updatedMessages);
                }
                setIsLoading(false);
            }

            useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, [messages]);

            const priorityColors = {
                high:   'bg-red-50 border-red-300 text-red-900',
                medium: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                low:    'bg-green-50 border-green-300 text-green-900'
            };
            const priorityBadge = {
                high:   'bg-red-100 text-red-700',
                medium: 'bg-yellow-100 text-yellow-700',
                low:    'bg-green-100 text-green-700'
            };

            const pendingTasks = tasks.filter(t => !t.completed);
            const completedTasks = tasks.filter(t => t.completed);
            const highCount = pendingTasks.filter(t => t.priority === 'high').length;

            return (
                <>
                    <div className="flex h-screen bg-gray-50">
                        {/* ── Left Panel: Tasks ── */}
                        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col min-w-0">
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <CheckCircle2 size={22} className="text-blue-600" />
                                            My Tasks
                                        </h1>
                                        <p className="text-xs text-gray-500 mt-0.5">{syncStatus}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowContextModal(true)} className="p-2 hover:bg-gray-100 rounded-lg" title="View context memory">
                                            <Brain size={18} className="text-purple-500" />
                                        </button>
                                        <button onClick={() => { setTempApiKey(''); setTempEmail(''); setEmailStatus(''); setShowSettingsModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Settings">
                                            <Settings size={18} className="text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-3 text-xs">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{pendingTasks.length} pending</span>
                                    {highCount > 0 && <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">🔥 {highCount} high priority</span>}
                                    <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-full">{completedTasks.length} done</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {fbLoading && (
                                    <div className="flex items-center justify-center py-12 text-gray-400">
                                        <Loader2 size={24} className="animate-spin mr-2" /> Loading from cloud...
                                    </div>
                                )}

                                {!fbLoading && pendingTasks.length === 0 && completedTasks.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        <Circle size={40} className="mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">No tasks yet. Tell the AI what you need to do!</p>
                                    </div>
                                )}

                                {pendingTasks.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Pending</p>
                                        {pendingTasks.map(task => (
                                            <div key={task.id} className={`mb-2 p-3 rounded-lg border ${priorityColors[task.priority]}`}>
                                                <div className="flex items-start gap-2">
                                                    <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                                                        <Circle size={18} />
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm leading-snug">{task.title}</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityBadge[task.priority]}`}>{task.priority}</span>
                                                            {task.category && task.category !== 'General' && <span className="text-xs text-gray-500">📁 {task.category}</span>}
                                                            {task.dueDate && <span className="text-xs text-gray-500">📅 {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 shrink-0 transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {completedTasks.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Completed</p>
                                        {completedTasks.map(task => (
                                            <div key={task.id} className="mb-2 p-3 rounded-lg border border-gray-100 bg-gray-50">
                                                <div className="flex items-start gap-2">
                                                    <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                                                        <CheckCircle2 size={18} className="text-green-500" />
                                                    </button>
                                                    <p className="flex-1 text-sm line-through text-gray-400">{task.title}</p>
                                                    <button onClick={() => deleteTask(task.id)} className="text-gray-200 hover:text-red-500 shrink-0 transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <div className="p-3 border-t border-gray-100">
                                {!notificationsEnabled ? (
                                    <button onClick={enableNotifications} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                        <Bell size={16} /> Enable Notifications
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                                            <Bell size={14} /> Notifications on
                                        </div>
                                        <button onClick={sendTestNotification} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                                            Test
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Right Panel: Chat ── */}
                        <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50/40 to-purple-50/40 min-w-0">
                            <div className="p-5 bg-white border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles size={20} className="text-purple-500" />
                                    AI Personal Assistant
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {apiKey ? 'Ask me anything about your tasks or share context' : '⚙️ Add your API key in Settings to start'}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-sm lg:max-w-md xl:max-w-lg p-3.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <p className={`text-xs mt-1 opacity-60`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-100 p-3.5 rounded-2xl shadow-sm">
                                            <Loader2 size={20} className="animate-spin text-purple-500" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick action buttons */}
                            <div className="px-4 pb-2 flex gap-2 flex-wrap">
                                {["What's on my plate?", "High priority tasks", "What's due this week?"].map(q => (
                                    <button key={q} onClick={() => setInputMessage(q)}
                                        className="text-xs bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                                        {q}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={e => setInputMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder={apiKey ? "Tell me what you need, ask about your tasks..." : "Add API key in Settings..."}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={isLoading || !inputMessage.trim()}
                                        className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Settings Modal ── */}
                    {showSettingsModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                                <h3 className="text-lg font-bold mb-4">⚙️ Settings</h3>

                                <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key</label>
                                <input
                                    type="password"
                                    value={tempApiKey}
                                    onChange={e => setTempApiKey(e.target.value)}
                                    placeholder={apiKey ? '••••••••••••••••' : 'sk-ant-api03-...'}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                                {apiKey && <p className="text-xs text-green-600 mb-3">✓ API key is configured</p>}

                                <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Email for Reminders</label>
                                <input
                                    type="email"
                                    value={tempEmail}
                                    onChange={e => setTempEmail(e.target.value)}
                                    placeholder={userEmail || 'your@email.com'}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                                {userEmail && <p className="text-xs text-green-600 mb-1">✓ {userEmail}</p>}

                                <button onClick={sendTestEmail} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 mb-3 mt-1">
                                    <Mail size={13} /> Send test email now
                                </button>
                                {emailStatus && <p className="text-xs mb-3">{emailStatus}</p>}

                                <p className="text-xs text-gray-400 mb-4">Scheduled reminders: 10:00 AM, 2:00 PM, 5:30 PM (Sun–Thu)</p>

                                <div className="flex gap-2">
                                    <button onClick={() => setShowSettingsModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                    <button onClick={saveSettings} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Save</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Context Modal ── */}
                    {showContextModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[80vh] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Brain size={20} className="text-purple-500" /> Context Memory
                                    </h3>
                                    <button onClick={() => setShowContextModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {context.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No context stored yet. Share info about your projects and I'll remember it!</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {context.map((c, i) => (
                                                <li key={i} className="text-sm bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-purple-800">
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {context.length > 0 && (
                                    <button onClick={() => {
                                        setContext([]);
                                        fbSaveContext([]);
                                        localStorage.removeItem('ai-context');
                                    }} className="mt-4 text-xs text-red-400 hover:text-red-600">
                                        Clear all context
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            );
        };

        ReactDOM.render(<TaskManager />, document.getElementById('root'));
    </script>
</body>
</html>
