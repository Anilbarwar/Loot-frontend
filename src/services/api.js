import axios from 'axios';

// const API_ROOM_BASE = 'http://192.168.1.6:9001/room';
const API_ROOM_BASE = 'https://loot-production.up.railway.app/room';
const API_GAME_BASE = 'https://loot-production.up.railway.app/game';
// const API_GAME_BASE = 'http://192.168.1.6:9001/game';

export const createRoom = () => axios.post(`${API_ROOM_BASE}/getRoom`);
export const joinRoom = (roomCode, playerName) =>
            axios.post(`${API_ROOM_BASE}/joinRoom/${roomCode}/${playerName}`)

export const getPlayers = (roomCode) => axios.get(`${API_ROOM_BASE}/players/${roomCode}`);
export const startGame = (roomCode) => axios.post(`${API_ROOM_BASE}/start/${roomCode}`)


export const canMoveCard = (card, selectedCard) =>
    axios.post(`${API_GAME_BASE}/canMove`, {card, selectedCard});
export const playCard = (roomId, playerId, cardId) =>
    axios.post(`${API_ROOM_BASE}/room/${roomId}/play`, { playerId, cardId });


export const moveCard = (roomCode, playerId, card, selectedCard) =>
    axios.post(`${API_GAME_BASE}/moveCard`, {roomCode, playerId, card, selectedCard});

export const getGameState = (roomCode) =>
    axios.get(`${API_ROOM_BASE}/state/${roomCode}`);

export const drawCard = (roomCode, playerId) =>
    axios.get(`${API_GAME_BASE}/drawCard/${roomCode}?playerId=${playerId}`);

export const checkWinningCondition = (roomCode) =>
    axios.get(`${API_ROOM_BASE}/checkWin/${roomCode}`);

export const gameOverWinner = (roomCode) => axios.get(`${API_ROOM_BASE}/gameOver/${roomCode}`);


