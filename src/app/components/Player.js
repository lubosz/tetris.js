import React from 'react';
import Court from './Court'
import {get, html, sound} from '../utils';
import {drawPiece} from '../renderer';
import {randomPiece, nu, nx, ny, eachblock, DIR} from '../logic';


class OneBlockCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.dy = 0;
        this.dx = 0;
        this.piece = null;
    }
    componentDidMount() {
        this.canvas = this.refs.canvas.getDOMNode();
        this.ctx = this.canvas.getContext('2d');
    }
    draw() {
        // TODO: center block in box
        // half-arsed attempt at centering next piece display
        // var padding = ((nu - this.next.type.size) / 2 - 1);
        this.ctx.save();
        this.ctx.scale(0.7, 0.7);
        this.ctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
        this.ctx.strokeStyle = 'white';
        drawPiece(this.ctx, this.piece.type, 1, 1, this.dx, this.dy, this.piece.dir);
        this.ctx.restore();
    }
    resize(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        if (this.piece)
            this.draw();
    }
}

class Next extends OneBlockCanvas {
    constructor(props) {
        super(props);
    }
    randomPiece() {
        this.piece = randomPiece();
        this.draw();
    }
    render() {
        let style = {
            background: 'url(img/next.png)',
            backgroundSize: 'contain',
            height: '15vh'
        };
        return (
            <canvas ref="canvas" style={style} />
        );
    }
}

class Hold extends OneBlockCanvas {
    constructor(props) {
        super(props);
        this.holdUsedThisTurn = false;
    }
    drop() {
        this.holdUsedThisTurn = false;
    }
    setHold(court, next) {
        if (this.holdUsedThisTurn)
            return;

        let toHold = court.current;

        if (this.piece == undefined)
            court.setCurrentPiece(next.piece);
        else
            court.setCurrentPiece(this.piece);
        this.piece = toHold;
        next.randomPiece();
        court.current.y = -2;
        court.checkLose();
        this.draw();
        this.holdUsedThisTurn = true;
    }
    reset() {
        this.piece = null;
    }
    render() {
        let style = {
            background: 'url(img/hold.png)',
            backgroundSize: 'contain',
            height: '15vh'
        };
        return (
            <canvas ref="canvas" style={style} />
        );
    }
}

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.actions = [];
        this.KEYs = {};
        this.state = {
            score: 0,
            rows: 0,
            wins: 0,
            end: ''
        };
    }
    componentDidMount() {
        this.refs.court.dropCb = this.dropCb.bind(this);
        this.refs.court.addOpponentLines = this.addOpponentLines.bind(this);
        this.refs.court.lose = this.lose.bind(this);
    }
    handle(action) {
        switch (action) {
            case DIR.LEFT:
            case DIR.RIGHT:
                this.refs.court.move(action);
                break;
            case DIR.UP:
                this.refs.court.instantDrop();
                break;
            case DIR.DOWN:
                this.refs.court.drop();
                break;
            case DIR.TURNLEFT:
            case DIR.TURNRIGHT:
                this.refs.court.rotate(action);
                break;
            case DIR.HOLD:
                this.refs.hold.setHold(this.refs.court, this.refs.next);
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
        this.refs.court.setCurrentPiece(this.refs.next.piece);
        this.refs.next.randomPiece();
        this.clearActions();
        this.refs.hold.drop();
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
    resize() {
        this.refs.court.resize();
        this.refs.next.resize(this.refs.court.dx, this.refs.court.dy);
        this.refs.hold.resize(this.refs.court.dx, this.refs.court.dy);
    }

    reset() {
        this.clearActions();
        this.refs.court.reset();
        this.refs.next.randomPiece();
        this.refs.hold.reset();
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
                    <Hold ref="hold" />
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
                    <Next ref="next" />
                </div>
            </div>
        );
    }
}

export default Player;