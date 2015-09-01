/**
 * Created by bmonkey on 8/31/15.
 */

import React from 'react';
import {randomPiece, nx, ny, nu, mode, DIR, setBlock, eachblock} from '../logic';
import {drawBlock, drawPiece} from '../renderer';
import {sound} from '../utils';

class Court extends React.Component {
    constructor(props) {
        super(props);
        this.dx = 0;
        this.dy = 0;
        this.speed =
        {
            start: 0.6,
            decrement: 0.005,
            min: 0.1
        }; // how long before piece drops by 1 row (seconds)
        this.updateStep(0);
    }

    componentDidMount() {
        this.canvas = this.refs.court.getDOMNode();
        this.ctx = this.canvas.getContext('2d');
    }

    updateStep (rows) {
        this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * rows));
    }
    checkLose() {
        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
            this.lose();
            sound("lose");
        }
    }
//-----------------------------------------------------
// check if a piece can fit into a position in the grid
//-----------------------------------------------------
    occupied(type, x, y, dir) {
        var result = false;
        var actualBlocks = this.blocks;

        eachblock(type, x, y, dir, function (x, y) {
            if ((x < 0) || (x >= nx) || (y >= ny) || (actualBlocks && actualBlocks[x] ? actualBlocks[x][y] : null)) {
                result = true;
            }
        });
        return result;
    }

    puyuoccupied(type, x, y, dir) {
        var result = null;
        var actualBlocks = this.blocks;

        eachblock(type, x, y + 1, dir, function (x, y) {
            if (!((x < 0) || (x >= nx) || (y >= ny) || (actualBlocks && actualBlocks[x] ? actualBlocks[x][y] : null))) {
                result =
                {
                    type: type =
                    {
                        size: 1,
                        blocks: [0x8000, 0x8000, 0x8000, 0x8000],
                        color: "yellow"
                    },
                    dir: DIR.UP,
                    x: x,
                    y: y - 1
                };
            }
        });
        return result;
    }

    unoccupied(type, x, y, dir) {
        return !this.occupied(type, x, y, dir);
    }

    move(dir) {
        var x = this.current.x,
            y = this.current.y;
        switch (dir) {
            case DIR.RIGHT:
                x = x + 1;
                break;
            case DIR.LEFT:
                x = x - 1;
                break;
            case DIR.DOWN:
                y = y + 1;
                break;
        }
        if (this.unoccupied(this.current.type, x, y, this.current.dir)) {
            this.current.x = x;
            this.current.y = y;
            this.draw();
            return true;
        }
        else {
            return false;
        }
    }

    // offset the piece at the borders for rotation
    horizontalFitOffset(type, x, y, dir) {
        let offset = 0;
        let step = 0;
        let wouldFit = true;

        // try to offset at screen border
        if (this.current.x <= 0)
            step = 1;
        else if (this.current.x >= 7)
            step = -1;

        while (this.occupied(type, x + offset, y, dir)) {
            //console.log(type.name, "would not fit", x+offset, y);
            offset += step;
            // max offset is 2, required for I, break if not at border
            if (Math.abs(offset) > 2 || step == 0) {
                wouldFit = false;
                break;
            }
        }
        //console.log(type.name, "seems that would fit", wouldFit, x+offset, y);
        return [wouldFit, offset];
    }

    rotate(dir) {
        let newdir = this.current.dir;

        if (dir == DIR.TURNRIGHT)
            newdir++;
        else if (dir == DIR.TURNLEFT)
            newdir--;
        newdir = (newdir + 4) % 4;

        let offset = this.horizontalFitOffset(this.current.type, this.current.x, this.current.y, newdir);

        if (offset[0]) {
            this.current.x += offset[1];
            this.current.dir = newdir;
            this.draw();
            sound("rotate");
        }
    }

    instantDrop() {
        var flying = this.move(DIR.DOWN);
        while (flying) {
            flying = this.move(DIR.DOWN);
        }
        this.addScore(10);
        this.dropPiece();
        this.removeLines();
        this.dropCb();
        this.checkLose();
    }

    puyuGravityDrop() {
        var flying = this.move(DIR.DOWN);

        var last = timestamp();
        var now = last;

        while (flying) {
            now = timestamp();
            var deltatime = now - last;
            if (deltatime > 100) {
                flying = this.move(DIR.DOWN);
            }
        }

        this.addScore(10);
        this.dropPiece();
        this.removeLines();
        this.dropCb();
        this.checkLose();
    }

    drop() {
        if (!this.move(DIR.DOWN)) {
            this.addScore(10);
            this.dropPiece();
            this.removeLines();
            this.dropCb();
            this.checkLose();
        }
    }

    dropPiece() {
        var type = this.current.type;
        var playerBlocks = this.blocks;
        var inval = false;

        eachblock(this.current.type, this.current.x, this.current.y, this.current.dir, function (x, y) {
            inval = true;
            playerBlocks = setBlock(x, y, playerBlocks, type);
        });
        this.blocks = playerBlocks;

        sound("drop");

        if (inval)
            this.draw();

        if (mode == "puyu") {
            //check if a bean is still falling
            var fallingBean = this.puyuoccupied(this.current.type, this.current.x, this.current.y, this.current.dir);
            if (fallingBean != undefined) {
                this.current = fallingBean;
                this.puyuGravityDrop();
            }
        }
    }

    removeLines() {
        var x, y, complete, n = 0;
        for (y = ny; y > 0; --y) {
            complete = true;
            for (x = 0; x < nx; ++x) {
                if (!(this.blocks && this.blocks[x] ? this.blocks[x][y] : null)) {
                    complete = false;
                }
            }
            if (complete) {
                this.removeLine(y);
                y = y + 1; // recheck same line
                n++;
            }
        }
        if (n > 0) {
            this.addRows(n);
            this.addScore(100 * Math.pow(2, n - 1)); // 1: 100, 2: 200, 3: 400, 4: 800

            switch (n) {
                case 4:
                    sound("tetris");
                    break;
                default:
                    sound("line");
                    break;
            }

            //send lines to an opponent player if 2, 3 or 4 lines where removed
            if (n == 4) {
                //tetris: send all 4 lines
                this.addOpponentLines(4);
            }

            if (n == 2 || n == 3) {
                //send n-1 lines
                this.addOpponentLines(n - 1);
            }
        }
        //sound("line");
    }

    removeLine(n) {
        var x, y;
        for (y = n; y >= 0; --y) {
            for (x = 0; x < nx; ++x) {
                setBlock(x, y, this.blocks, (y == 0) ? null : (this.blocks && this.blocks[x] ? this.blocks[x][y - 1] : null));
            }
        }
    }

    receiveLines(n) {
        var gap = Math.floor(Math.random() * nx);

        //do n times:
        for (var i = 0; i < n; i++) {
            //shift blocks 1 to top
            for (var y = 0; y < ny + 1; y++) {
                for (x = 0; x < nx; ++x) {
                    setBlock(x, y, this.blocks, (y == 0) ? null : (this.blocks && this.blocks[x] ? this.blocks[x][y + 1] : null));
                }
            }
        }

        //then add received rows
        for (var y = ny - n; y < ny; y++) {
            for (var x = 0; x < nx; ++x) {
                if (x != gap) {
                    setBlock(x, y, this.blocks, 'cyan');
                }
            }
        }
    }

    draw() {
        if (!this.current)
            return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'white';
        drawPiece(this.ctx, this.current.type, this.current.x, this.current.y, this.dx, this.dy, this.current.dir);

        //ghost
        this.ctx.globalAlpha = 0.4;

        let y = 0;
        while (!this.occupied(this.current.type, this.current.x, y+1, this.current.dir)) {
            y++;
        }

        drawPiece(this.ctx, this.current.type, this.current.x, y, this.dx, this.dy, this.current.dir);
        this.ctx.globalAlpha = 1.0;

        let x, block;
        for (y = 0; y < ny; y++) {
            for (x = 0; x < nx; x++) {
                if (block = (this.blocks && this.blocks[x] ? this.blocks[x][y] : null)) {
                    drawBlock(this.ctx, x, y, this.dx, this.dy, block.color);
                }
            }
        }
        this.ctx.strokeRect(0, 0, nx * this.dx - 1, ny * this.dy - 1); // court boundary
    }

    clearBlocks() {
        this.blocks = [];
        if (this.current)
            this.draw();
    }

    setCurrentPiece(piece = randomPiece()) {
        this.current = piece;
        this.draw();
    }

    resize() {
        if (!this.canvas)
            return;
        this.canvas.width = this.canvas.clientWidth; // set canvas logical size equal to its physical size
        this.canvas.height = this.canvas.clientHeight; // (ditto)

        this.dx = this.canvas.width / nx;      // pixel size of a single tetris block
        this.dy = this.canvas.height / ny;     // (ditto)

        if (this.current)
            this.draw();
    }

    reset() {
        this.dt = 0;
        this.clearBlocks();
        this.setCurrentPiece();
    }

    update(idt) {
        this.dt = this.dt + idt;
        if (this.dt > this.step) {
            this.dt = this.dt - this.step;
            this.drop();
        }
    }

    render() {
        let style = {
            display: 'inline-block',
            background: '#01093a',
            border: '2px solid #333',
            opacity: 0.8,
            width: '45vh',
            height: '90vh',
            marginTop: '5vh'
        };
        return (
            <canvas style={style} ref="court" />
        );
    }
}

export default Court;