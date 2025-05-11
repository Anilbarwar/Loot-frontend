import styles from "../../styles/Room.module.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../../services/api";

export default function RoomComponents() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleJoin = async () => {
        try {
            navigate(`/joinRoom`);
        } catch (error) {
            console.error('Error joining the room', error);
        }
    };

    const createRoomProcess = async () => {
        if (!name) {
            alert("Please enter a valid player name.");
            return;
        }

        setLoading(true);
        try {
            const room = await createRoom();
            const players = await joinRoom(room.data.code, name);
            const player = players.data.find(player => player.name === name);

            if (player) {
                const { id, index } = player;
                navigate(`/joined`, {
                    state: {
                        current: players.data,
                        roomCode: room.data.code,
                        playerId: id,
                        index: index
                    }
                });
            } else {
                console.error("Player not found in the room.");
            }
        } catch (error) {
            console.error('Error creating or joining room', error);
        } finally {
            setLoading(false);
        }
    };


    const handleNameChange = (e) => {
        const value = e.target.value.replace(/[\n\r]/g, '');
        if (value.length <= 20) {
            setName(value.toUpperCase());
        }
    };

    return (
        <>
            <textarea
                value={name}
                onChange={handleNameChange}
                placeholder="Player Name"
                className={styles.roomCodeBox}
                maxLength={20}
            />
            <button
                className={styles.textWrapper}
                onClick={handleJoin}
                disabled={loading}
            >
                JOIN ROOM
            </button>
            <button
                className={styles.textWrapper2}
                onClick={createRoomProcess}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'CREATE ROOM'}
            </button>
        </>
    );
}
