import React from 'react';
import Player from './Player';
import {timestamp, sound} from '../utils';
import {queryGamePads, gamepadHandler} from '../gamepad';
import _ from 'lodash';
import {DIR} from '../logic';
import Message from './Message';
import { MenuItem, LeftNav, Styles, FloatingActionButton, FontIcon, AppBar, Toggle } from 'material-ui';

let ThemeManager = new Styles.ThemeManager();
let Colors = Styles.Colors;

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.playing = false;
        this.players = [];
        this.paused = false;
        this.last = timestamp();
        this.end = this.end.bind(this);
        this.play = this.play.bind(this);
        this.togglePause = this.togglePause.bind(this);
    }

    getChildContext() {
        return {muiTheme: ThemeManager.getCurrentTheme()};
    }

    componentWillMount() {
        ThemeManager.setPalette({
            accent1Color: Colors.deepOrange500
        });
    }

    componentDidMount() {
        this.refs.leftNav.toggle();
        this.initPlayers();
        this.addEvents();
        this.players.forEach(p => {
            p.resize();
            p.reset();
        });

        let self = this;

        function frame () {
            // using requestAnimationFrame have to be able to handle large delta's caused
            // when it 'hibernates' in a background or non-visible tab
            if (!self.paused) {
                self.players.forEach(p => {queryGamePads(p.gamepadCallback);});
                let now = timestamp();
                let idt = Math.min(1, (now - self.last) / 1000.0);
                if (self.playing)
                    self.players.forEach(p => {p.update(idt)});
                self.last = now;
            } else {
                self.players.forEach(p => {queryGamePads(p.gamepadCallbackPaused);});
            }
            requestAnimationFrame(frame);
        }
        // start the first frame
        frame();
    }

    play() {
        if (this.playing) return;
        this.playing = true;
        this.refs.message.hide();
        this.reset();
    }

    togglePause() {
        this.paused = !this.paused;
        this.refs.leftNav.toggle();
        if (this.paused) {
            this.refs.message.setText("Paused");
            this.refs.message.show();
        } else
            this.refs.message.hide();
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
        addEventListener('resize', this.resize);
        addEventListener("gamepadconnected", function (e) {
            gamepadHandler(e, true);
        });
        addEventListener("gamepaddisconnected", function (e) {
            gamepadHandler(e, false);
        });
    }
}


Game.childContextTypes = {
    muiTheme: React.PropTypes.object
};

let menuItems = [
    { route: 'singleplayer', text: 'Marathon' },
    {
        type: MenuItem.Types.LINK,
        payload: '/#/battle',
        text: 'Battle'
    },
    { type: MenuItem.Types.SUBHEADER, text: 'Options' },
];

class Battle extends Game {
    constructor(props) {
        super(props);
    }

    end(player) {
        player.setEnd('LOSE');
        this.players.forEach(p => {
            if (p != player) {
                p.setEnd('WIN');
                p.incrWins();
                this.refs.message.setText("Player " + p.props.number.toString() + " Wins");
                this.refs.message.show();
            }
        });
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

        this.refs.player1.bindGame(this);
        this.refs.player2.bindGame(this);

        addEventListener('keydown', this.refs.player1.keyboardCallback);

        this.players.push(this.refs.player1);
        this.players.push(this.refs.player2);
    }
    render() {
        return (
            <div id="outer">
                <div id="inner">
                    <LeftNav ref="leftNav" menuItems={menuItems} menuItemClassName="Toggle" header={
                        <FloatingActionButton mini={true} secondary={true} onTouchTap={this.togglePause} >
                            <FontIcon className="material-icons">menu</FontIcon>
                        </FloatingActionButton>
                    }/>
                    <Message ref="message" />
                    <Player number="1" name="Lubosz" background="lubosz.jpg" color="blue" ref="player1" />
                    <div id="seperator" />
                    <Player number="2" name="Jessi" background="porenta.gif" color="purple" ref="player2" />
                </div>
            </div>
        );
    }
}



class Marathon extends Game {
    constructor(props) {
        super(props);
    }

    end(player) {
        player.setEnd('LOSE');
        this.playing = false;
        this.refs.message.setText("Game Over");
        this.refs.message.show();
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
        this.refs.player1.bindGame(this);
        addEventListener('keydown', this.refs.player1.keyboardCallback);
        this.players.push(this.refs.player1);
    }
    render() {
        return (
            <div id="outer">
                <div id="inner">

                    <LeftNav ref="leftNav" menuItems={menuItems} header={
                        <FloatingActionButton mini={true} secondary={true} onTouchTap={this.togglePause} >
                            <FontIcon className="material-icons">menu</FontIcon>
                        </FloatingActionButton>
                    }/>
                    <Message ref="message" />
                    <Player number="1" name="Lubosz" background="lubosz.jpg" color="blue" ref="player1" />
                </div>
            </div>
        );
    }
}

export {Battle, Marathon};