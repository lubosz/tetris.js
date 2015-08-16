import {randomTetrisPiece} from './tetris.jsx'
import {randomPuyoPiece} from './puyo.jsx'

//set to "puyp" or "tetris"
var mode = "tetris";

var DIR = 
{
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    MIN: 0,
    MAX: 3,
    TURNLEFT: 4,
    TURNRIGHT: 5,
    HOLD: 6
};

const nx = 10;

export function randomPiece() 
{
    var type;
    if(mode == "puyu")
        type = randomPuyoPiece();
    else if(mode == "tetris")
        type = randomTetrisPiece();
    return {type: type, dir: DIR.UP, x: Math.round(nx / 2 - 2), y: -2};
}