import styles from "../../styles/Room.module.css";
import React, { useEffect, useState } from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import {getPlayers, startGame} from "../../services/api";
import {
    connectWebSocket,
    disconnectWebSocket,
    subscribeToTopic,
    unsubscribeFromTopic
} from "../webSocket/WebSocketClient";

export default function JoinRoom() {

    const location = useLocation();
    const navigate = useNavigate();
    let { current, roomCode, playerId, index } = location.state || {};
    const [players, setPlayers] = useState([]);


    useEffect(() => {
        connectWebSocket(roomCode);

        subscribeToTopic(`/topic/room/${roomCode}/players`, (data) => {
            setPlayers(data);
        });

        subscribeToTopic(`/topic/start/${roomCode}`, (data) => {
            navigate(`/game`, {
                state: {
                    playerId,
                    roomCode: data.roomCode,
                    players: data.players,
                    hands: data.hands,
                    index
                }
            });
        })

        // return () => {
        //     unsubscribeFromTopic(`/topic/room/${roomCode}/players`);
        //     unsubscribeFromTopic(`/topic/start/${roomCode}`);
        // };
    }, [roomCode]);

    const prepareStartGame = async () => {
        await startGame(roomCode);
    };

    useEffect(() => {
        if (current && Array.isArray(current)) {
            setPlayers(current);
        }
    }, [current]);

    return (
        <>
            <ul className={styles.listBox}>
                <li className={styles.listItem}>Room: {roomCode}</li>
                {players.map((p) => (
                    <li key={p.id} className={styles.listItem}>{p.name}</li>
                ))}
            </ul>
            <button className={styles.textWrapper} onClick={prepareStartGame}>START GAME</button>
        </>
    );
}
