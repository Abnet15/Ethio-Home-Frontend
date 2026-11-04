import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SERVER_BASE_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        let newSocket;

        if (isAuthenticated && user) {
            // Connect to the server
            newSocket = io(SERVER_BASE_URL, {
                query: { userId: user._id },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
