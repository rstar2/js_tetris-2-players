import Timer from './Timer.js';
import Tetris from './Tetris.js';
import { PIECES } from './pieces.js';

// we have the game arena as 12x20 matrix tiles
// wih scale of 20 this means 240x400 pixels canvas
const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
const SCALE = 20;

const STATE = {
    INIT: Symbol(0),
    STOPPED: Symbol(1),
    STARTED: Symbol(2),
    PAUSED: Symbol(3)
};

// start with dropping the piece on every 1 sec
const timer = new Timer({ update, render }, 1, false);

function update() {
    tetrises.forEach(tetris => tetris.drop());
}

function render() {
    tetrises.forEach(tetris => tetris.render());
}

function reset() {
    tetrises.forEach(tetris => tetris.reset());
}

const piecesQueue = [];

const controller = {
    getNextPiece(tetris) {
        // TODO:
        // generate a new random piece
        const rand = Math.floor(Math.random() * PIECES.length);
        return PIECES[rand];
    },

    lost(tetris) {
        render();
        timer.stop();
    },

    isStarted() {
        return state === STATE.STARTED;
    }
};

const tetrises = [
    new Tetris(controller, document.getElementById('screen1'),
        ARENA_WIDTH, ARENA_HEIGHT, SCALE, document.getElementById('score1')),
    new Tetris(controller, document.getElementById('screen2'),
        ARENA_WIDTH, ARENA_HEIGHT, SCALE, document.getElementById('score2'))
];

let state;
function changeState() {
    let newState, text;
    if (!state) {
        newState = STATE.INIT;
        text = 'Start';
        reset();
    } else {
        switch (state) {
            case STATE.INIT:
            case STATE.STOPPED:
                newState = STATE.STARTED;
                text = 'Pause';
                timer.start();
                break;
            case STATE.STARTED:
                newState = STATE.PAUSED;
                text = 'Start';
                timer.pause();
                break;
            case STATE.PAUSED:
                newState = STATE.STARTED;
                text = 'Pause';
                timer.unpause();
                break;
        }
    }

    state = newState;

    start.innerText = text;
}

const start = document.getElementById('start');
start.addEventListener('click', changeState);

changeState();




