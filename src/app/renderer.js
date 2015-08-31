import {eachblock} from './logic';

function drawBlock(ctx, x, y, dx, dy, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * dx, y * dy, dx, dy);
    ctx.strokeRect(x * dx, y * dy, dx, dy)
}

function drawPiece(ctx, type, x, y, dx, dy, dir) {
    eachblock(type, x, y, dir, function (x, y) {
        drawBlock(ctx, x, y, dx, dy, type.color);
    });
}

export { drawBlock, drawPiece };