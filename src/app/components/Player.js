import React from 'react';
import Court from './Court'

import {get, html, sound} from '../utils';
import {drawBlock} from '../renderer';
import {randomPiece, nu, eachblock, DIR} from '../logic';

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