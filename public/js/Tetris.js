import * as matrix from './matrix.js';
import Timer from './Timer.js';
import Player from './Player.js';
import { PIECES } from './pieces.js';

const STATE = {
    INIT: 0,
    STOPPED: 1,
    STARTED: 2,
    PAUSED: 3
}

export default class Tetris {
    constructor(canvas, arenaW, arenaH, scale = 1, score, startButton) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this._canvas.width = arenaW * scale;
        this._canvas.height = arenaH * scale;
        this._context.scale(scale, scale);

        this._arena = matrix.create(arenaW, arenaH);

        this._player = new Player(arenaW / 2);

        // start with dropping the piece on every 1 sec
        this._timer = new Timer({
            update: this._drop.bind(this), render: this._render.bind(this)
        }, 1, false);

        this._score = score;
        this._startButton = startButton;

        this._reset(STATE.INIT);

        document.addEventListener('keydown', event => this._handleKeydown(event));

        this._startButton.addEventListener('click', event => this._handleStartPause(event));
    }

    start(toReset) {
        // if this is "next" game the reset before startin the new
        // else if it is normal first game then the reset has already been done
        if (toReset) {
            this._reset();
        }

        this._setState(STATE.STARTED);

        this._timer.start();
    }

    _reset(state) {
        // reset the arena
        matrix.reset(this._arena);

        // reset player's score
        this._player.resetScore();
        this._renderScore();

        // generate a new piece
        this._generatePiece();
        // render all till now 
        this._render();

        this._setState(state !== undefined ? state : STATE.STOPPED);
    }

    _stop() {
        this._setState(STATE.STOPPED);
        this._render();
        this._timer.stop();
    }

    _pause() {
        this._setState(STATE.PAUSED);
        this._timer.pause();
    }

    _unpause() {
        this._setState(STATE.STARTED);
        this._timer.unpause();
    }

    _generatePiece() {
        // generate a new random piece
        const rand = Math.floor(Math.random() * PIECES.length);
        this._player.resetWith(PIECES[rand], 'red');
    }

    _drop() {
        // make drop
        this._player.drop(1);

        // check for bottom reached or collision
        if (matrix.isCollide(this._arena, this._player)) {
            // if yes - then revert the last "collision drop"
            this._player.drop(-1);

            // merge the piece with the arena
            matrix.merge(this._arena, this._player);

            // check for Tetris, e.g. clear full lines and increase points
            const score = matrix.clearFull(this._arena);
            if (score) {
                this._player.addScore(score);
                this._renderScore();
            }

            // generate a new piece for the player - it will be also started form the top
            this._generatePiece();

            // check for Game Over - just check if right after a new piece there's a collision
            if (matrix.isCollide(this._arena, this._player)) {
                this._stop();
            }
        }
    }

    _move(isLeft) {
        this._player.move(isLeft ? -1 : 1);
        if (matrix.isCollide(this._arena, this._player)) {
            // reached the left/right borders
            this._player.move(isLeft ? 1 : -1);
        }
    }

    _rotate(isLeft) {
        const oldPosX = this._player.pos.x;
        matrix.rotate(this._player.piece, isLeft);

        // check for collision - we have to check multiple times, until there's no collision
        // or revert back to starting position if we can't find such
        // Algorith is: 
        // check collision - yes :
        // move 1 to the right, => offset 1
        // then 2 to the left,  => offset -2
        // then 3 to the right  => offset 3
        // then 4 to the left   => offset -4
        // ...
        let offset = 1;
        while (matrix.isCollide(this._arena, this._player)) {
            // reached the left/right borders
            this._player.move(offset);
            offset = (Math.abs(offset) + 1) * (offset > 0 ? -1 : 1);
            if (offset > this._player.piece[0].length) {
                // we can't keep checking forever - break if no "collision-free" position is possible
                // so revert to starting position
                this._player.pos.x = oldPosX;
                matrix.rotate(this._player.piece, !isLeft);
                break;
            }
        }
    }

    _setState(state) {
        if (this._state === state)
            return;

        this._state = state;

        let text;
        switch (this._state) {
            case STATE.INIT:
            case STATE.STOPPED:
                text = 'Start';
                break;
            case STATE.STARTED:
                text = 'Pause';
                break;
            case STATE.PAUSED:
                text = 'Start';
                break;
        }
        this._startButton.innerText = text;
    }

    _renderScore() {
        if (this._score) {
            this._score.innerText = this._player.score;
        }
    }

    _render() {
        this._context.fillStyle = 'black';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        // render the arena (current fallen pieces)
        matrix.render(this._arena, this._context);

        // render the player (current falling piece)
        matrix.render(this._player.piece, this._context, this._player.color, this._player.pos);
    }

    _handleKeydown(event) {
        if (this._state !== STATE.STARTED) {
            return;
        }

        switch (event.keyCode) {
            case 37:   // left
                this._move(true);
                break;
            case 39:   // right
                this._move(false);
                break;
            case 81:   // q
                this._rotate(true);
                break;
            case 87:   // w
                this._rotate(false);
                break;
            case 40:  // down
                // cancel next "update-drop" while using the keys
                // in order not to get an additional drop right after the keydown event
                this._timer.reset();
                this._drop();
                break;

        }
    }

    _handleStartPause() {
        switch (this._state) {
            case STATE.INIT:
            case STATE.STOPPED:
                this.start(this._state === STATE.STOPPED);
                break;
            case STATE.STARTED:
                this._pause();
                break;
            case STATE.PAUSED:
                this._unpause();
                break;
        }
    }

}

// TODO:  increase drop rate as the time goes - more difficult