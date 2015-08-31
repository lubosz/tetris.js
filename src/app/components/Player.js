import React from 'react';
import Court from './Court'
import Next from './Next'
import Hold from './Hold'
import {sound} from '../utils';
import {drawPiece} from '../renderer';
import {randomPiece, nu, nx, ny, eachblock, DIR} from '../logic';
import {clearDelayed, delayedPressed} from '../gamepad';

let GeneralKEYs = {
    ESC: 27,
    SPACE: 32
};

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
        this.gamepadCallback = this.gamepadCallback.bind(this);
        this.keyboardCallback = this.keyboardCallback.bind(this);
    }

    bindGame(game) {
        this.end = game.end;
        this.play = game.play;
        this.togglePause = game.togglePause;
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

    gamepadCallback(pad, idx, type) {
        //console.log(pad, idx, type);
        if (type == "pressed") {
            switch (idx) {
                case 13:
                    //arrow down
                    delayedPressed(idx, function () {
                        this.actions.push(DIR.DOWN);
                        sound("move");
                    }.bind(this));
                    break;
                case 14:
                    //arrow left
                    delayedPressed(idx, function () {
                        this.actions.push(DIR.LEFT);
                        sound("move");
                    }.bind(this));
                    break;
                case 15:
                    //arrow right
                    delayedPressed(idx, function () {
                        this.actions.push(DIR.RIGHT);
                        sound("move");
                    }.bind(this));
                    break;
                case 12:
                    //arrow up
                    this.actions.push(DIR.UP);
                    sound("drop");
                    break;
                case 0:
                    //x
                    this.play();
                    this.actions.push(DIR.TURNLEFT);
                    sound("rotate");
                    break;
                case 1:
                    //'o'
                    this.actions.push(DIR.TURNRIGHT);
                    sound("rotate");
                    break;
                case 5:
                    //'r1'
                    this.actions.push(DIR.HOLD);
                    break;
                case 9:
                    //'options
                    this.togglePause();
                    break;
                case 6:
                //l2
                case 7:
                //r2
                case 2:
                //square
                case 3:
                //'triangle'
                case 4:
                    //l1
                    break;
            }
        } else if (type == "released") {
            clearDelayed(idx);
        }
    }

    keyboardCallback(ev) {
        //console.log("getting key event", ev.keyCode, ev);
        var handled = false;
        switch (ev.keyCode) {
            case this.KEYs.LEFT:
                this.actions.push(DIR.LEFT);
                handled = true;
                break;
            case this.KEYs.RIGHT:
                this.actions.push(DIR.RIGHT);
                handled = true;
                break;
            case this.KEYs.UP:
                this.actions.push(DIR.UP);
                handled = true;
                break;
            case this.KEYs.DOWN:
                this.actions.push(DIR.DOWN);
                handled = true;
                break;
            case this.KEYs.TURNLEFT:
                this.actions.push(DIR.TURNLEFT);
                handled = true;
                break;
            case this.KEYs.TURNRIGHT:
                this.actions.push(DIR.TURNRIGHT);
                handled = true;
                break;
            case this.KEYs.HOLD:
                this.actions.push(DIR.HOLD);
                handled = true;
                break;
            case GeneralKEYs.ESC:
                this.lose();
                handled = true;
                break;
            case GeneralKEYs.SPACE:
                this.play();
                handled = true;
                break;
        }
        // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
        if (handled)
            ev.preventDefault();

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
    lose() {
        this.end(this);
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