import React from 'react';

import {randomPiece, nx, ny, nu, mode, DIR, setBlock, eachblock} from '../logic'
import {get, html, sound} from '../utils';
import {drawBlock} from '../renderer';

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
        this.state = {
            rows: 0,
            score: 0
        };
        this.updateStep();
    }

    componentDidMount() {
        this.canvas = this.refs.court.getDOMNode();
        this.ctx = this.canvas.getContext('2d');
    }

    updateStep () {
        this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * this.state.rows));
    }

    setRows(n) {
        this.setState({rows : n});
        this.updateStep();
    }
    addRows(n) {
        this.setRows(this.state.rows + n);
    }
    setScore(n) {
        this.setState({score: n});
    }
    addScore(n) {
        this.setScore(this.state.score + n);
    }

    checkLose() {
        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) {
            this.lose();
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
            this.draw();
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

    drawPiece(ctx, type, x, y, dir) {
        var dx = this.dx;
        var dy = this.dy;
        eachblock(type, x, y, dir, function (x, y) {
            drawBlock(ctx, x, y, dx, dy, type.color);
        });
    }

    clearBlocks() {
        this.blocks = [];
        if (this.current)
            this.draw();
    }

    setCurrentPiece(piece) {
        this.current = piece || randomPiece();
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

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [];
        this.KEYs = {};
        this.wins = 0;
        this.score = 0;
        this.hold = null;

        //gamepad timestamp variables
        this.lastCall = {};
        this.lastCall.arrow_down = 0;
        this.lastCall.arrow_left = 0;
        this.lastCall.arrow_right = 0;
        this.lastCall.arrow_up = 0;
        this.lastCall.x = 0;
        this.lastCall.o = 0;
        this.lastCall.r1 = 0;

        this.state = {
            score: 0,
            rows: 0,
            wins: 0,
            end: ''
        };
    }

    componentDidMount() {
        this.ucanvas = this.refs.next.getDOMNode();
        this.hcanvas = this.refs.hold.getDOMNode();

        this.uctx = this.ucanvas.getContext('2d');
        this.hctx = this.hcanvas.getContext('2d');

        this.refs.court.dropCb = this.dropCb.bind(this);
        this.refs.court.addOpponentLines = this.addOpponentLines.bind(this);
        this.refs.court.lose = this.lose.bind(this);
    }

    handle(action) {
        switch (action) {
            case DIR.LEFT:
                this.refs.court.move(DIR.LEFT);
                break;
            case DIR.RIGHT:
                this.refs.court.move(DIR.RIGHT);
                break;
            case DIR.UP:
                this.refs.court.instantDrop();
                break;
            case DIR.DOWN:
                this.refs.court.drop();
                break;
            case DIR.TURNLEFT:
                this.refs.court.rotate(DIR.TURNLEFT);
                break;
            case DIR.TURNRIGHT:
                this.refs.court.rotate(DIR.TURNRIGHT);
                break;
            case DIR.HOLD:
                this.setHold();
                break;
        }
    }

    setOpponent(player) {
        this.opponent = player;
    }

    addOpponentLines(n) {
        this.opponent.refs.court.receiveLines(n);
    }

    dropCb() {
        this.refs.court.setCurrentPiece(this.next);
        this.setNextPiece(randomPiece());
        this.clearActions();
    }

    drawNext() {
        // TODO: center block in box
        // half-arsed attempt at centering next piece display
        // var padding = ((nu - this.next.type.size) / 2 - 1);
        this.uctx.save();
        this.uctx.scale(0.7, 0.7);
        this.uctx.clearRect(0, 0, nu * this.refs.court.dx, nu * this.refs.court.dy);
        this.uctx.strokeStyle = 'white';
        this.drawPiece(this.uctx, this.next.type, 1, 1, this.next.dir);
        this.uctx.restore();
    }

    drawHold() {
        // TODO: center block in box
        // half-arsed attempt at centering next piece display
        // var padding = (nu - this.hold.type.size) / 2;
        this.hctx.save();
        this.hctx.scale(0.7, 0.7);
        this.hctx.clearRect(0, 0, nu * this.refs.court.dx, nu * this.refs.court.dy);
        this.hctx.strokeStyle = 'white';
        this.drawPiece(this.hctx, this.hold.type, 1, 1, this.hold.dir);
        this.hctx.restore();
    }

    drawPiece(ctx, type, x, y, dir) {
        var dx = this.refs.court.dx;
        var dy = this.refs.court.dy;
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
        this.setState({end : win});
    }
    incrWins() {
        this.setState({wins : this.state.wins + 1});
    }
    clearActions() {
        this.actions = [];
    }

    setNextPiece(piece) {
        this.next = piece || randomPiece();
        this.drawNext();
    }

    setHold() {
        let toHold = this.refs.court.current;
        if (this.hold == undefined)
            this.refs.court.setCurrentPiece(this.next);
        else
            this.refs.court.setCurrentPiece(this.hold);
        this.hold = toHold;
        this.setNextPiece(randomPiece());
        this.refs.court.current.y = -2;
        this.refs.court.checkLose();
        this.drawHold();
    }

    resize() {
        this.ucanvas.width = this.ucanvas.clientWidth;
        this.ucanvas.height = this.ucanvas.clientHeight;
        this.hcanvas.width = this.hcanvas.clientWidth;
        this.hcanvas.height = this.hcanvas.clientHeight;

        this.refs.court.resize();
        this.refs.court.draw();

        if (this.hold)
            this.drawHold();
        if (this.next)
            this.drawNext();
    }

    reset() {
        this.clearActions();
        this.refs.court.reset();
        this.refs.court.setCurrentPiece(this.next);
        this.setNextPiece();
        this.setState({
            score: 0,
            rows : 0,
            end: ''
        });
    }

    update(idt) {
        this.handle(this.actions.shift());
        this.refs.court.update(idt);
    }

    render() {
        let avatarStyle = {
            background: "url(img/avatars/" + this.props.background + ")",
            backgroundSize: "contain",
            height: "15vh"
        };

        let nameStyle = {
            fontWeight: "bold",
            color: this.props.color
        };

        let playerStyle = {
            display: "inline-block",
            padding: 0,
            fontSize: "1.0vw"
        };

        let tableStyle = {
            display: "inline-block",
            textAlign: "right"
        };

        let statStyle = {
            color: "white",
            fontWeight: "bold",
            textAlign: "left"
        };

        let endStyle = {
            color: 'red',
            fontWeight: 'bold'
        };

        let scoreString = ("00000" + Math.floor(this.state.score)).slice(-5);

        return (
            <div style={playerStyle}>
                <div className="hud">
                    <canvas ref="hold" className="hold" />
                    <div style={avatarStyle} />
                    <div>
                        <span style={nameStyle}>{this.props.name}</span><br/>
                        <table style={tableStyle}>
                            <tr><td>Score</td><td style={statStyle}>{scoreString}</td></tr>
                            <tr><td>Rows</td><td style={statStyle}>{this.state.rows}</td></tr>
                            <tr><td>Wins</td><td style={statStyle}>{this.state.wins}</td></tr>
                        </table>
                    </div>
                    <div style={endStyle}>{this.state.end}</div>
                </div>
                <Court ref="court" />
                <div className="hud">
                    <canvas ref="next" className="next" />
                </div>
            </div>
        );
    }
}

export default Player;