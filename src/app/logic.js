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

export {setBlock, eachblock}