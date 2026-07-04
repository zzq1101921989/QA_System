import { useState, useEffect, useCallback } from "react";
import type { SessionMessage, Message } from "../../../types/chat";

const STORAGE_KEY = 'qa_system_sessions';
const HISTORY_KEY = 'qa_system_history';

export default function useSession() {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<SessionMessage[]>([]);
    
    // 初始化从本地加载
    useEffect(() => {
        const savedSessions = localStorage.getItem(STORAGE_KEY);
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                setSessions(parsed);
                // 如果有会话，默认选中第一个
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].sessionId);
                }
            } catch (e) {
                console.error('Failed to load sessions', e);
            }
        }
    }, []);

    // 每次 sessions 改变都保存
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    }, [sessions]);

    /**
     * 开启新会话
     */
    const createNewSession = useCallback(() => {
        const sessionId = Date.now().toString();
        const newSession: SessionMessage = { 
            sessionId, 
            sessionName: '新会话' 
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(sessionId);
        return sessionId;
    }, []);

    /**
     * 切换会话
     */
    const switchSession = useCallback((sessionId: string) => {
        setCurrentSessionId(sessionId);
    }, []);

    /**
     * 删除会话
     */
    const deleteSession = useCallback((sessionId: string) => {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
        }
        localStorage.removeItem(`${HISTORY_KEY}_${sessionId}`);
    }, [currentSessionId]);

    /**
     * 更新会话名称
     */
    const updateSessionName = useCallback((sessionId: string, name: string) => {
        setSessions(prev => prev.map(s => 
            s.sessionId === sessionId ? { ...s, sessionName: name.slice(0, 20) + (name.length > 20 ? '...' : '') } : s
        ));
    }, []);

    /**
     * 保存会话历史消息
     */
    const saveSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
        localStorage.setItem(`${HISTORY_KEY}_${sessionId}`, JSON.stringify(messages));
    }, []);

    /**
     * 获取会话历史消息
     */
    const getSessionMessages = useCallback((sessionId: string): Message[] => {
        const saved = localStorage.getItem(`${HISTORY_KEY}_${sessionId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    }, []);

    return {
        currentSessionId,
        sessionMessages: sessions,
        createNewSession,
        switchSession,
        deleteSession,
        updateSessionName,
        saveSessionMessages,
        getSessionMessages
    }
}
