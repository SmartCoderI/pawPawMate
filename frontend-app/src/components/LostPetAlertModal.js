

const LostPetAlertModal = ({ alertData, isOpen, onClose, onViewDetails }) => {
    if (!isOpen) return null;

    console.log(alertData);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Lost Pet Alert</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p><strong>{alertData?.message}</strong></p>
                    <br />
                    <button className="cancel-button" onClick={onViewDetails}>View Details</button>
                </div>
            </div>
        </div>
    )
};
export default LostPetAlertModal;