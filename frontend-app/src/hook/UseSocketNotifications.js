import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import LostPetAlertModal from '../components/LostPetAlertModal';

const useSocketNotifications = (userId) => {
    const navigate = useNavigate();

    const [alertData, setAlertData] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001');

        if (userId) {
            socket.emit('join-user-room', userId);
        }

        socket.on('lost-pet-alert', (alertData) => {
            console.log('Lost pet alert received:', alertData);
            setAlertData(alertData);
            setShowAlertModal(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    const handleCloseAlertModal = () => {
        setShowAlertModal(false);
        setAlertData(null);
    };

    const handleViewAlertDetails = () => {
        if (alertData && alertData.id) {
            navigate('/lost-pets', {
                state: {
                    focusedPetId: alertData.id,
                    centerLocation: {
                        lat: alertData.lastSeenLocation.lat,
                        lng: alertData.lastSeenLocation.lng
                    },
                    closeExistingPopup: true
                }
            });
        }
        handleCloseAlertModal();
    };

    const AlertModalComponent = () => {
        return (
            <LostPetAlertModal
                alertData={alertData}
                isOpen={showAlertModal}
                onClose={handleCloseAlertModal}
                onViewDetails={handleViewAlertDetails}
            />
        );
    };

    return { AlertModalComponent };

};

export default useSocketNotifications;