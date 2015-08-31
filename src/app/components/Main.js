import React from 'react';
import Player from './Player';
import {timestamp, sound} from '../utils';
import {gamepadHandler, queryGamePads, clearDelayed, delayedPressed} from '../gamepad';
import _ from 'lodash';
import {DIR} from '../logic';

class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibility: 'visible',
            text: 'Press X to Play'
        }
    }
    setText(text) {
        this.setState({text: text});
    }
    hide() {
        this.setState({visibility: 'hidden'});
    }
    show() {
        this.setState({visibility: 'visible'});
    }
    render() {
        let messageStyle = {
            visibility: this.state.visibility,
            position: 'absolute',
            fontSize: '2vh'
        };
        return (
            <div style={messageStyle}>
                {this.state.text}
            </div>
        );
    }
}


var GeneralKEYs = {
    ESC: 27,
    SPACE: 32
};

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.playing = false;
        this.players = [];
        this.paused = false;
        this.last = timestamp();
        this.gamePadCallback = this.gamePadCallback.bind(this);
        this.loseCb = this.loseCb.bind(this);
    }

    componentDidMount() {
        this.run();
    }

    gamePadCallback(pad, idx, type) {
        console.log(pad, idx, type);
        var i = pad.index;
        if (type == "pressed") {
            switch (idx) {
                case 13:
                    //arrow down
                    delayedPressed(idx, function () {
                        this.players[i].actions.push(DIR.DOWN);
                        sound("move");
                    }.bind(this));
                    break;
                case 14:
                    //arrow left
                    delayedPressed(idx, function () {
                        this.players[i].actions.push(DIR.LEFT);
                        sound("move");
                    }.bind(this));
                    break;
                case 15:
                    //arrow right
                    delayedPressed(idx, function () {
                        this.players[i].actions.push(DIR.RIGHT);
                        sound("move");
                    }.bind(this));
                    break;
                case 12:
                    //arrow up
                    this.players[i].actions.push(DIR.UP);
                    sound("drop");
                    break;
                case 0:
                    //x
                    this.play();
                    this.players[i].actions.push(DIR.TURNLEFT);
                    sound("rotate");
                    break;
                case 1:
                    //'o'
                    this.players[i].actions.push(DIR.TURNRIGHT);
                    sound("rotate");
                    break;
                case 5:
                    //'r1'
                    this.players[i].actions.push(DIR.HOLD);
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

    keydown(ev) {
        console.log("getting key event", ev.keyCode, ev);
        var handled = false;
        if (this.playing) {
            for (var i = 0; i < this.players.length; i++) {
                switch (ev.keyCode) {
                    case this.players[i].KEYs.LEFT:
                        this.players[i].actions.push(DIR.LEFT);
                        handled = true;
                        break;
                    case this.players[i].KEYs.RIGHT:
                        this.players[i].actions.push(DIR.RIGHT);
                        handled = true;
                        break;
                    case this.players[i].KEYs.UP:
                        this.players[i].actions.push(DIR.UP);
                        handled = true;
                        break;
                    case this.players[i].KEYs.DOWN:
                        this.players[i].actions.push(DIR.DOWN);
                        handled = true;
                        break;
                    case this.players[i].KEYs.TURNLEFT:
                        this.players[i].actions.push(DIR.TURNLEFT);
                        handled = true;
                        break;
                    case this.players[i].KEYs.TURNRIGHT:
                        this.players[i].actions.push(DIR.TURNRIGHT);
                        handled = true;
                        break;
                    case this.players[i].KEYs.HOLD:
                        this.players[i].actions.push(DIR.HOLD);
                        handled = true;
                        break;
                    case GeneralKEYs.ESC:
                        this.players[i].lose();
                        handled = true;
                        break;
                }
            }
        } else if (ev.keyCode == GeneralKEYs.SPACE) {
            play();
            handled = true;
        }
        if (handled) {
            ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
        }
    }

    loseCb(player) {
        player.setEnd('LOSE');
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] != player) {
                this.players[i].setEnd('WIN');
                this.players[i].incrWins();
            }
        }
        this.playing = false;
    }

    initPlayers() {
        //player 1 KEYs: left_arrow, up_arrow, right_arrow, down_arrow, o, p, i
        this.refs.player1.KEYs =
        {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            TURNLEFT: 79,
            TURNRIGHT: 80,
            HOLD: 73
        };

        //player 2 KEYs: w, a, s, d, q, e, r
        this.refs.player2.KEYs =
        {
            LEFT: 65,
            UP: 87,
            RIGHT: 68,
            DOWN: 83,
            TURNLEFT: 81,
            TURNRIGHT: 69,
            HOLD: 82
        };

        this.refs.player1.setOpponent(this.refs.player2);
        this.refs.player2.setOpponent(this.refs.player1);
        this.refs.player1.setLoseCallback(this.loseCb);
        this.refs.player2.setLoseCallback(this.loseCb);

        this.players.push(this.refs.player1);
        this.players.push(this.refs.player2);
    }



    //-------------------------------------------------------------------------
    // GAME LOOP
    //-------------------------------------------------------------------------

    run() {
        this.initPlayers();
        this.addEvents();
        this.players.forEach(p => {
            p.resize();
            p.reset();
        });

        let self = this;

        function frame () {
            queryGamePads(self.gamePadCallback);
            // using requestAnimationFrame have to be able to handle large delta's caused
            // when it 'hibernates' in a background or non-visible tab
            if (!self.paused) {
                let now = timestamp();
                self.update(Math.min(1, (now - self.last) / 1000.0));
                self.last = now;
            }
            requestAnimationFrame(frame, self.players[0].canvas);
        }

        // start the first frame
        frame();
    }

    play() {
        if (this.playing) return;
        this.playing = true;
        this.refs.messages.hide();
        this.reset();
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.refs.messages.setText("Paused");
            this.refs.messages.show();
        } else
            this.refs.messages.hide();
    }

    resize() {
        if (this.players)
            this.players.forEach(p => {
                p.resize()
            });
    }

    reset() {
        this.players.forEach(p => {
            p.reset()
        });
    }

    addEvents() {
        addEventListener('keydown', this.keydown);
        addEventListener('resize', this.resize);
        addEventListener("gamepadconnected", function (e) {
            gamepadHandler(e, true);
        });
        addEventListener("gamepaddisconnected", function (e) {
            gamepadHandler(e, false);
        });
    }

    update(idt) {
        if (this.playing)
            this.players.forEach(p => {
                p.update(idt)
            });
    }

    render() {
        return (
            <div id="outer">
                <div id="inner">
                    <Messages ref="messages" />
                    <Player number="1" name="Lubosz" background="lubosz.jpg" color="blue" ref="player1" />
                    <Player number="2" name="Jessi" background="porenta.gif" color="purple" ref="player2" />
                </div>
            </div>
        );
    }
}

export default Main;