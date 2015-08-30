//-------------------------------------------------------------------------
// tetris pieces
//
// blocks: each element represents a rotation of the piece (0, 90, 180, 270)
//       each element is a 16 bit integer where the 16 bits represent
//       a 4x4 set of blocks, e.g. j.blocks[0] = 0x44C0
//
//           0100 = 0x4 << 3 = 0x4000
//           0100 = 0x4 << 2 = 0x0400
//           1100 = 0xC << 1 = 0x00C0
//           0000 = 0x0 << 0 = 0x0000
//                             ------
//                             0x44C0
//
//-------------------------------------------------------------------------
var i =
{
    size: 4,
    blocks: [0x0F00, 0x2222, 0x00F0, 0x4444],
    color: '#20c8f8' // cyan
};
var j =
{
    size: 3,
    blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20],
    color: '#6060f8' // blue
};
var l =
{
    size: 3,
    blocks: [0x4460, 0x0E80, 0xC440, 0x2E00],
    color: '#f87820' // orange
};
var o =
{
    size: 2,
    blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00],
    color: '#f8d000' // yellow
};
var s =
{
    size: 3,
    blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620],
    color: '#00d000' // green
};
var t =
{
    size: 3,
    blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640],
    color: '#d828d8' // purple / pink
};
var z =
{
    size: 3,
    blocks: [0x0C60, 0x4C80, 0xC600, 0x2640],
    color: '#f01818' // red
};

function random(min, max) {
    return (min + (Math.random() * (max - min)));
}

function randomChoice(choices) {
    return choices[Math.round(random(0, choices.length - 1))];
}

export function randomTetrisPiece() {
    let pieces = [i, i, i, i, j, j, j, j, l, l, l, l, o, o, o, o, s, s, s, s, t, t, t, t, z, z, z, z];
    return pieces.splice(random(0, pieces.length - 1), 1)[0];
}
