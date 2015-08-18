const puyucolors = ['cyan', 'yellow', 'green', 'red', 'purple'];

function getRandomPuyuColor() {
    return puyucolors[Math.floor(Math.random() * puyucolors.length)];
}

export function randomPuyoPiece() {
    return ({
        size: 2,
        blocks: [0x0C00, 0x4400, 0x0C00, 0x4400],
        color: getRandomPuyuColor(),
        color2: getRandomPuyuColor()
    });
}