import styles from "../../styles/Room.module.css";
import React, { useState } from "react";
import { joinRoom } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const joinRoomWithCode = async () => {
        if (!roomCode || !name) {
            alert("Please provide both a room code and a name.");
            return;
        }

        setLoading(true); // Set loading to true when starting the process
        try {
            const players = await joinRoom(roomCode, name);
            const player = players.data.find(player => player.name === name);

            if (player) {
                const { id, index } = player;
                navigate(`/joined`, {
                    state: {
                        current: players.data,
                        roomCode: roomCode,
                        playerId: id,
                        index: index
                    }
                });
            } else {
                console.error("Player not found in the room.");
                alert("Failed to find player in the room. Please check the name and room code.");
            }
        } catch (error) {
            console.error("Failed to join room:", error);
            alert("Failed to join room. Please check the room code and try again.");
        } finally {
            setLoading(false); // Reset loading state after process is complete
        }
    };

    // Handle input changes, preventing new lines and limiting character count
    const handleInputChange = (setter, maxLength) => (e) => {
        let value = e.target.value.replace(/[\n\r]/g, ''); // Remove new lines
        if (value.length <= maxLength) {
            setter(value.toUpperCase());
        }
    };

    return (
        <>
            <textarea
                value={name}
                onChange={handleInputChange(setName, 20)} // Limit name to 20 characters
                rows={2}
                cols={5}
                placeholder="Player Name"
                className={styles.playerNameBox}
                maxLength={20}
            />
            <textarea
                value={roomCode}
                onChange={handleInputChange(setRoomCode, 10)} // Limit room code to 10 characters
                rows={2}
                cols={5}
                placeholder="Room Code"
                className={styles.roomCodeBox}
                maxLength={10}
            />
            <button
                className={styles.textWrapper2}
                onClick={joinRoomWithCode}
                disabled={loading} // Disable button when loading
            >
                {loading ? 'Joining...' : 'JOIN ROOM'}
            </button>
        </>
    );
}
