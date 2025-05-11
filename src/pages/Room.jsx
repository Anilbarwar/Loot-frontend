import React from "react";
import pirate from "../images/pirateShip.jpg";
import styles from "../styles/Room.module.css";
import RoomComponents from "../components/room/RoomComponents";
import { Routes, Route } from 'react-router-dom';
import JoinRoom from "../components/room/JoinRoom";
import JoinedRoom from "../components/room/JoinedRoom";

export default function Room() {
    return (
            <div className={styles.room}>
                <div className={styles.overlapGroupWrapper}>
                    <div className={styles.overlapGroup}>
                        <img className={styles.image} alt="Pirate Ship" src={pirate} />
                        <div className={styles.title}>LOOT</div>
                        <Routes>
                            <Route path="/" element={<RoomComponents />} />
                            <Route path="joinRoom" element={<JoinRoom />} />
                            <Route path="joined" element={<JoinedRoom />}/>
                        </Routes>
                    </div>
                </div>
            </div>
    );
}
