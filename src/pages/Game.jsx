import { useLocation, useNavigate } from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {canMoveCard, checkWinningCondition, drawCard, gameOverWinner, getGameState, moveCard} from '../services/api';
import styles from '../styles/Game.module.css';
import roomStyles from '../styles/Room.module.css';
import pirate from "../images/ship.png";
import wave from "../images/wave.png";
import nightShip from "../images/nightShip.png";
import {connectWebSocket, subscribeToTopic, unsubscribeFromTopic} from "../components/webSocket/WebSocketClient";

export default function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    let { playerId, roomCode, players, hands, index } = location.state || {};

    const [playerCards, setPlayerCards] = useState(() => {
        if (hands && playerId !== undefined && hands[playerId]) {
            return hands[playerId];
        }
        return [];
    });

    const [selectedCard, setSelectedCard] = useState(null);
    const [floorCards, setFloorCards] = useState([]);
    const [gameOver, setGameOver] = useState(null);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [winner, setWinner] = useState(null);
    const [cardCount, setCardCount] = useState(64);
    const [playerValue, setPlayerValue] = useState(new Map([]));

    const cardImages = require.context('../images/cards', false, /\.(png|jpe?g|svg)$/);

    function getCardImage(type, color, value) {
        const imgName = `${type}_${color}_${value}`.toUpperCase();
        const imageName = imgName + `.png`;
        try {
            return cardImages(`./${imageName}`);
        } catch (e) {
            console.warn('Missing image:', imageName);
            return null;
        }
    }

    useEffect(() => {
        connectWebSocket(roomCode);

        subscribeToTopic(`/topic/state/${roomCode}`, (data) => {
            setPlayerCards(data.hands[playerId]);
            setFloorCards(data.playedCards);
            setGameOver(data.game)
            if (data.playerValueMap !== null) {
                setPlayerValue(data.playerValueMap);
            }
            const currentName = players.find(p => p.id === data.currentTurn).name;
            setCurrentTurn(currentName);
        });

        (async () => {
            try {
                await getGameState(roomCode);
            } catch (e) {
                console.error("Failed to fetch game state", e);
            }
        })();

        // return () => {
        //     unsubscribeFromTopic(`/topic/state/${roomCode}`);
        // };
    }, [roomCode]);

    useEffect(() => {
        if (gameOver === "FINISHED") {
            (async () => {
                try {
                    const res = await gameOverWinner(roomCode); // this returns { data: "Player Name", ... }
                    setWinner(res.data); // only store the actual name
                } catch (e) {
                    console.error("Failed to fetch winner:", e);
                }
            })();
        }
    }, [gameOver]);


    const handleCardClick = (card, event) => {
        event.stopPropagation();
        setSelectedCard(card);
        console.log('Selected card:', card);
    };

    const handlePlayedCardClick = async (targetCard, event) => {
        event.stopPropagation();
        if (!selectedCard) return;

        try {
            const canMove = await moveCard(roomCode, playerId, targetCard, selectedCard);
            if (canMove.data === true) {
                await getGameState(roomCode);
            }
            setSelectedCard(null);
        } catch (err) {
            console.error('Error checking move validity:', err);
        }
    };

    const handleGameClick = async (event) => {
        event.stopPropagation();
        if (selectedCard) {
            try {
                console.log('Playing card:', selectedCard);
                const canMove = await moveCard(roomCode, playerId, null, selectedCard);
                if (canMove.data === true) {
                    await getGameState(roomCode);
                }
                setSelectedCard(null);
            } catch (error) {
                console.error('Failed to play card', error);
            }
        }
    };

    const handleDrawCard = async (event) => {
        event.stopPropagation();
        setSelectedCard(null);
        const res = await drawCard(roomCode, playerId);
        if (res.data !== -1) {
            setCardCount(res.data);
            await getGameState(roomCode);
        }
    };

    const groupByStack = (cards) => {
        const stacks = {};
        for (const card of cards) {
            if (!stacks[card.stackId]) {
                stacks[card.stackId] = [];
            }
            stacks[card.stackId].push(card);
        }

        for (const stackId in stacks) {
            stacks[stackId].sort((a, b) => a.index - b.index);
        }
        return stacks;
    };

    const cardStacks = groupByStack(floorCards);
    let positionCounts = {};

    return (
        <>
            <img className={roomStyles.image} alt="" src={wave} />
            <img className={roomStyles.imageShip} alt="" src={pirate} />

            {/*{gameOver screen needed here}*/}
            {gameOver && winner && (
                <div className={styles.gameOverOverlay}>
                    <div className={styles.gameOverContent}>
                        <h1>🎉 Game Over 🎉</h1>
                        <h2>Winner: {winner}</h2>
                        <button onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            )}
            <div className={styles.turn}>{currentTurn}</div>
            <div className={styles.scoreBoard}>
                <h4>Scores</h4>
                {playerValue && Object.entries(playerValue).map(([name, score]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{name}</span>
                        <span>{score}</span>
                    </div>
                ))}
            </div>
            <div className={styles.game} onClick={handleGameClick}>

                {Object.entries(cardStacks).map(([stackId, stack], stackIdx) => {
                    const merchantCard = stack.find(card => card.type === 'MERCHANT');
                    const otherCards = stack.filter(card => card.type !== 'MERCHANT');
                    const merchantPlayer = players.find(p => p.id === merchantCard.playerId);


                    const gridPositions = [
                        { col: 2, row: 3 },  // bottom
                        { col: 1, row: 2 }, // left
                        { col: 2, row: 1 }, // top
                        { col: 3, row: 2 } // right
                    ];

                    return (
                        <div
                            key={stackId}
                            className={styles.playedArea}
                            style={{ transform: `translateX(${stackIdx * 27}vw)` }}
                        >
                            {merchantCard && (
                                <>
                                <div className={styles.playerName}>
                                    {merchantPlayer.name}
                                </div>
                                <img
                                    key={merchantCard.cardId}
                                    src={getCardImage(merchantCard.type, merchantCard.color, merchantCard.value)}
                                    className={styles.playedCard}
                                    style={{
                                        gridColumn: 2,
                                        gridRow: 2,
                                        zIndex: 10
                                    }}
                                    onClick={(event) => handlePlayedCardClick(merchantCard, event)}
                                    alt={`${merchantCard.type}
                                          ${merchantCard.color}
                                          ${merchantCard.value}`}
                                />
                                </>
                            )}

                            {otherCards.map((card, i) => {
                                const pos =
                                    gridPositions[(card.index + players.length - index) % players.length];

                                const key = `${pos.col}-${pos.row}-${stackId}`;

                                // Count how many cards already placed at this position
                                const count = positionCounts[key] || 0;
                                positionCounts[key] = count + 1;

                                return (
                                    <img
                                        key={card.cardId}
                                        src={getCardImage(card.type, card.color, card.value)}
                                        className={styles.playedCard}
                                        style={{
                                            gridColumn: pos.col,
                                            gridRow: pos.row,
                                            position: 'relative',
                                            top: `${count * 3}vw`,
                                            zIndex: i
                                        }}
                                        onClick={(event) => handlePlayedCardClick(card, event)}
                                        alt={`${card.type} - ${card.color} - ${card.value}`} />
                                );
                            })}
                        </div>
                    );
                })}

                <button className={styles.button} onClick={(event) => handleDrawCard(event)}>Draw/Pass - {cardCount}</button>

                <div className={styles.cardBox}
                     style={{ justifyContent: playerCards.length >= 12 ? 'flex-start' : 'center' }}>
                    {playerCards.map(card => (
                        <img
                            id={`card-${card.id}`}
                            src={getCardImage(card.type, card.color, card.value)}
                            key={card.id}
                            className={`${styles.card} ${selectedCard?.id === card.id ? styles.selected : ''}`}
                            onClick={(e) => handleCardClick(card, e)}
                            alt={`${card.type} - ${card.color} - ${card.value}`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
