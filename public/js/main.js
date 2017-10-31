import Tetris from './Tetris.js';

// we have the game arena as 12x20 matrix tiles
// wih scale of 20 this means 240x400 pixels canvas
const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
const SCALE = 20;

const tetris = new Tetris(document.getElementById('screen'),
    ARENA_WIDTH, ARENA_HEIGHT, SCALE, document.getElementById('score'),
    document.getElementById('start'));
//tetris.start();

