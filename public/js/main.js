import Tetris, { STATE } from './Tetris.js';

// we have the game arena as 12x20 matrix tiles
// wih scale of 20 this means 240x400 pixels canvas
const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
const SCALE = 20;

const tetrises = [
    new Tetris(document.getElementById('screen1'),
        ARENA_WIDTH, ARENA_HEIGHT, SCALE, document.getElementById('score1')),
    new Tetris(document.getElementById('screen2'),
        ARENA_WIDTH, ARENA_HEIGHT, SCALE, document.getElementById('score2'))
]


let state = STATE.INIT;

function setState() {
    let newState, text;
    switch (state) {
        case STATE.INIT:
        case STATE.STOPPED:
            newState = STATE.STARTED;
            text = 'Start';
            break;
        case STATE.STARTED:

            newState = STATE.PAUSED;
            text = 'Pause';
            break;
        case STATE.PAUSED:
            newState = STATE.STARTED;
            text = 'Start';
            break;
    }

    tetrises.forEach(tetris => tetris.setState(newState));

    state = newState;

    this.innerText = text;
}

document.getElementById('start').addEventListener('click', setState);

document.addEventListener('keydown', event => this._handleKeydown(event));




