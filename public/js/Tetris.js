import * as matrix from './matrix.js';
import Player from './Player.js';

export default class Tetris {
    constructor(controller, canvas, arenaW, arenaH, scale = 1, score) {
        this._controller = controller;
        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this._canvas.width = arenaW * scale;
        this._canvas.height = arenaH * scale;
        this._context.scale(scale, scale);

        this._arena = matrix.create(arenaW, arenaH);

        this._player = new Player(arenaW / 2);

        this._score = score;

        document.addEventListener('keydown', event => this._handleKeydown(event));
    }

    reset() {
        // reset the arena
        matrix.reset(this._arena);

        // reset player's score
        this._player.resetScore();
        this._renderScore();

        // generate a new piece
        this._generatePiece();
        // render all till now 
        this.render();
    }

    render() {
        this._context.fillStyle = 'black';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        // render the arena (current fallen pieces)
        matrix.render(this._arena, this._context);

        // render the player (current falling piece)
        matrix.render(this._player.piece, this._context, this._player.color, this._player.pos);
    }

    drop() {
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
                // notify the controller that this player-tetris lost
                this._controller.lost(this);
            }
        }
    }

    _generatePiece() {
        // get next piece from the controller
        this._player.resetWith(this._controller.getNextPiece(this), 'red');
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

    _renderScore() {
        if (this._score) {
            this._score.innerText = this._player.score;
        }
    }

    _handleKeydown(event) {
        if (!this._controller.isStarted()) {
            return
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
                //this._timer.reset(); // TODO:
                this.drop();
                break;

        }
    }

}

// TODO:  increase drop rate as the time goes - more difficult