import {randomTetrisPiece} from './tetris'
import {randomPuyoPiece} from './puyo'

export const nx = 10;    // width of tetris court (in blocks)
export const ny = 20;    // height of tetris court (in blocks)
export const nu = 5;     // width/height of upcoming preview (in blocks)

//set to "puyo" or "tetris"
export const mode = "tetris";

export const DIR =
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

function setBlock(x, y, blocks, type) {
    blocks[x] = blocks[x] || [];
    blocks[x][y] = type;
    return blocks;
}

function eachblock(type, x, y, dir, fn) {
    //---------------------------------------------------
    // do the bit manipulation and iterate through each
    // occupied block (x,y) for a given piece applying fn
    //---------------------------------------------------
    var bit, row = 0,
        col = 0,
        blocks = type.blocks[dir];

    for (bit = 0x8000; bit > 0; bit = bit >> 1) {
        if (blocks & bit) {
            fn(x + col, y + row);
        }
        if (++col === 4) {
            col = 0;
            ++row;
        }
    }
}

function randomPiece() {
    var type;
    if (mode == "puyu")
        type = randomPuyoPiece();
    else if (mode == "tetris")
        type = randomTetrisPiece();
    return {type: type, dir: DIR.UP, x: Math.round(nx / 2 - 2), y: -2};
}

export {setBlock, eachblock, randomPiece}