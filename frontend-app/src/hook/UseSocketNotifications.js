import { useEffect } from 'react';
import io from 'socket.io-client';

const useSocketNotifications = (userId) => {
    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001');

        if (userId) {
            socket.emit('join-user-room', userId);
        }

        socket.on('lost-pet-alert', (alertData) => {
            console.log('Lost pet alert received:', alertData);
            alert(`🐾 Lost Pet Alert: ${alertData.petName} (${alertData.species}) has gone missing nearby!`);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);
}

export default useSocketNotifications;