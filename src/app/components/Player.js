import React from 'react';

import {randomPiece, nx, ny, nu, mode, DIR, setBlock, eachblock} from '../logic'
import {get, html, sound} from '../utils';
import {drawBlock} from '../renderer';

class UserInterface {
    constructor(scoreView, rowsView, winsView, endView) {
        this.scoreView = scoreView;
        this.rowsView = rowsView;
        this.winsView = winsView;
        this.endView = endView;
    }

    setScore(score) {
        html(this.scoreView, ("00000" + Math.floor(score)).slice(-5));
    }

    setRows(rows) {
        html(this.rowsView, rows);
    }

    setWins(wins) {
        html(this.winsView, wins);
    }

    setEnd(end) {
        html(this.endView, end);
    }
}

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.dx = 0;
        this.dy = 0;
        this.actions = [];
        this.KEYs = {};
        this.wins = 0;
        this.score = 0;
        this.hold = null;
        this.holdUsed = false;
        this.speed =
        {
            start: 0.6,
            decrement: 0.005,
            min: 0.1
        }; // how long before piece drops by 1 row (seconds)

        let playerStr = "P" + (this.props.number).toString();
        this.canvas = get('canvas' + playerStr);
        this.ucanvas = get('upcoming' + playerStr);
        this.hcanvas = get('hold' + playerStr);
        this.ctx = this.canvas.getContext('2d');
        this.uctx = this.ucanvas.getContext('2d');
        this.hctx = this.hcanvas.getContext('2d');

        this.ui = new UserInterface(
            'score' + playerStr,
            'rows' + playerStr,
            'wins' + playerStr,
            'end' + playerStr);

        //gamepad timestamp variables
        this.lastCall = {};
        this.lastCall.arrow_down = 0;
        this.lastCall.arrow_left = 0;
        this.lastCall.arrow_right = 0;
        this.lastCall.arrow_up = 0;
        this.lastCall.x = 0;
        this.lastCall.o = 0;
        this.lastCall.r1 = 0;
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

    handle(action) {
        switch (action) {
            case DIR.LEFT:
                this.move(DIR.LEFT);
                break;
            case DIR.RIGHT:
                this.move(DIR.RIGHT);
                break;
            case DIR.UP:
                this.instantDrop();
                break;
            case DIR.DOWN:
                this.drop();
                break;
            case DIR.TURNLEFT:
                this.rotate(DIR.TURNLEFT);
                break;
            case DIR.TURNRIGHT:
                this.rotate(DIR.TURNRIGHT);
                break;
            case DIR.HOLD:
                this.setHold(this.current);
                break;
        }
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
            this.drawCourt();
            return true;
        }
        else {
            return false;
        }
    }

    rotate(dir) {
        let newdir;
        if (DIR.TURNRIGHT == dir) {
            newdir = (this.current.dir == DIR.MAX ? DIR.MIN : this.current.dir + 1);
            var turned = false;

            if (this.unoccupied(this.current.type, this.current.x, this.current.y, newdir)) {
                dir = newdir;
                turned = true;
            }
        }
        else if (DIR.TURNLEFT == dir) {
            newdir = (this.current.dir == DIR.MIN ? DIR.MAX : this.current.dir - 1);
            if (this.unoccupied(this.current.type, this.current.x, this.current.y, newdir)) {
                dir = newdir;
                turned = true;
            }
        }

        if (turned) {
            this.current.dir = dir;
            this.drawCourt();
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
        this.setCurrentPiece(this.next);
        this.setNextPiece(randomPiece());
        this.clearActions();
        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
            this.lose();
        }
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
        this.setCurrentPiece(this.next);
        this.setNextPiece(randomPiece());
        this.clearActions();
        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
            this.lose();
        }
    }

    drop() {
        if (!this.move(DIR.DOWN)) {
            this.addScore(10);
            this.dropPiece();
            this.removeLines();
            this.setCurrentPiece(this.next);
            this.setNextPiece(randomPiece());
            this.clearActions();
            if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
                this.lose();
            }
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

        if (inval)
            this.drawCourt();

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

    setOpponent(player) {
        this.opponent = player;
    }

    addOpponentLines(n) {
        this.opponent.receiveLines(n);
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

    drawCourt() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'white';
        this.drawPiece(this.ctx, this.current.type, this.current.x, this.current.y, this.current.dir);

        //ghost
        this.ctx.globalAlpha = 0.4;

        let y = 0;
        while (!this.occupied(this.current.type, this.current.x, y+1, this.current.dir)) {
            y++;
        }

        this.drawPiece(this.ctx, this.current.type, this.current.x, y, this.current.dir);
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

    drawNext() {
        var padding = ((nu - this.next.type.size) / 2 - 1); // half-arsed attempt at centering next piece display
        this.uctx.save();
        this.uctx.scale(0.7, 0.7);
        this.uctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
        this.uctx.strokeStyle = 'white';
        this.drawPiece(this.uctx, this.next.type, 1, 1, this.next.dir);
        this.uctx.restore();
    }

    drawHold() {
        var padding = (nu - this.hold.type.size) / 2; // half-arsed attempt at centering next piece display
        this.hctx.save();
        this.hctx.scale(0.7, 0.7);
        this.hctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
        this.hctx.strokeStyle = 'white';
        this.drawPiece(this.hctx, this.hold.type, 1, 1, this.hold.dir);
        this.hctx.restore();
    }

    drawPiece(ctx, type, x, y, dir) {
        var dx = this.dx;
        var dy = this.dy;
        eachblock(type, x, y, dir, function (x, y) {
            drawBlock(ctx, x, y, dx, dy, type.color);
        });
    }

    setLoseCallback(loseCb) {
        this.loseCb = loseCb;
    }

    lose() {
        this.loseCb(this);
    }

    setEnd(win) {
        this.ui.setEnd(win);
    }

    setScore(n) {
        this.score = n;
        this.ui.setScore(this.score);
    }

    addScore(n) {
        this.setScore(this.score + n);
    }

    clearScore() {
        this.setScore(0);
    }

    clearRows() {
        this.setRows(0);
    }

    setRows(n) {
        this.rows = n;
        this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * this.rows));
        this.ui.setRows(this.rows);
    }

    incrWins() {
        this.wins++;
        this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * this.wins));
        this.ui.setWins(this.wins);
    }

    addRows(n) {
        this.setRows(this.rows + n);
    }

    clearBlocks() {
        this.blocks = [];
        if (this.current)
            this.drawCourt();
    }

    clearActions() {
        this.actions = [];
    }

    setCurrentPiece(piece) {
        this.current = piece || randomPiece();
        this.drawCourt();
        this.holdUsed = false;
    }

    setNextPiece(piece) {
        this.next = piece || randomPiece();
        this.drawNext();
    }

    setHold(piece) {
        if (!this.holdUsed) {
            if (this.hold == undefined) {
                this.hold = piece;
                this.setCurrentPiece(this.next);
                this.setNextPiece(randomPiece());
            }
            else {
                this.setCurrentPiece(this.hold);
                this.hold = piece;
            }

            this.current.y = -2;

            if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
                this.lose();
            }

            this.drawHold();
            this.holdUsed = true;
        }
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth; // set canvas logical size equal to its physical size
        this.canvas.height = this.canvas.clientHeight; // (ditto)
        this.ucanvas.width = this.ucanvas.clientWidth;
        this.ucanvas.height = this.ucanvas.clientHeight;
        this.hcanvas.width = this.hcanvas.clientWidth;
        this.hcanvas.height = this.hcanvas.clientHeight;

        this.dx = this.canvas.width / nx;      // pixel size of a single tetris block
        this.dy = this.canvas.height / ny;     // (ditto)

        if (this.current)
            this.drawCourt();
        if (this.hold)
            this.drawHold();
        if (this.next)
            this.drawNext();
    }

    reset() {
        this.dt = 0;
        this.clearActions();
        this.clearBlocks();
        this.clearRows();
        this.clearScore();
        this.setCurrentPiece(this.next);
        this.setNextPiece();
    }

    update(idt) {
        this.handle(this.actions.shift());
        this.dt = this.dt + idt;
        if (this.dt > this.step) {
            this.dt = this.dt - this.step;
            this.drop();
        }
    }

    render() {
        // TODO: use react, not DOM IDs
        let hold = "holdP" + this.props.number;
        let score = "scoreP" + this.props.number;
        let rows = "rowsP" + this.props.number;
        let wins = "winsP" + this.props.number;
        let end = "endP" + this.props.number;
        let canvas = "canvasP" + this.props.number;
        let upcoming = "upcomingP" + this.props.number;

        let avatarStyle = {
            background: "url(img/avatars/" + this.props.background + ")",
            backgroundSize: "contain",
            height: "15vh",
        };

        let nameStyle = {
            fontWeight: "bold",
            color: this.props.color
        };

        let playerStyle = {
            display: "inline-block",
            padding: 0,
            fontSize: "1.0vw"
        }

        let tableStyle = {
            display: "inline-block",
            textAlign: "right"
        }

        return (
            <div style={playerStyle}>
                <div className="hud">
                    <canvas id={hold} />
                    <div style={avatarStyle} />
                    <div>
                        <span style={nameStyle}>{this.props.name}</span><br/>
                        <table style={tableStyle}>
                            <tr><td>Score</td><td id={score}>00000</td></tr>
                            <tr><td>Rows</td><td id={rows}>0</td></tr>
                            <tr><td>Wins</td><td id={wins}>0</td></tr>
                        </table>
                    </div>
                    <div id={end} />
                </div>
                <canvas id={canvas} />
                <div className="hud">
                    <canvas id={upcoming} />
                </div>
            </div>
        );
    }
}

export default Player;