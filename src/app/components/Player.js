import React from 'react';
import Court from './Court'
import Next from './Next'
import Hold from './Hold'
import {sound} from '../utils';
import {drawPiece} from '../renderer';
import {randomPiece, nu, nx, ny, eachblock, DIR} from '../logic';

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