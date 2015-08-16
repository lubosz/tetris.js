import {Player, UserInterface} from './player.jsx';
import {DIR, nx, ny} from './game.jsx';
import {get, timestamp, show, hide} from './utils.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin'

let React = require('react/addons');


let mui = require('material-ui');
let RaisedButton = mui.RaisedButton;
let Dialog = mui.Dialog;
let AppBar = mui.AppBar;
let Tab = mui.Tab;
let Tabs = mui.Tabs;
let IconButton = mui.IconButton;
//let NavigationClose = mui.NavigationClose;
let FlatButton = mui.FlatButton;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

injectTapEventPlugin();

let Main = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },

    componentWillMount() {
        ThemeManager.setPalette({
            accent1Color: Colors.deepOrange500
        });
    },

    render() {

        let containerStyle = {
            textAlign: 'center',
        };

        let standardActions = [
            { text: 'OkayLOL' }
        ];

        return (
            <div>
                <AppBar
                    title="Foo"
                    iconClassNameLeft="muidocs-icon-navigation-expand-more"
                    iconElementRight={
                        <div>
                            <RaisedButton label="New Idea" primary={true} onTouchTap={this._showPost} />
                            <RaisedButton label="Login" primary={true} onTouchTap={this._showLogin} />
                            <RaisedButton label="Register" primary={true} onTouchTap={this._showRegistration} />
                        </div>
                    } />
                    <Dialog
                        title="Login"
                        actions={standardActions}
                        ref="loginDialog">
                        Oh hai
                    </Dialog>
            </div>
        );
    },

    _showLogin() {
        this.refs.loginDialog.show()
    },
    _showRegistration() {
        this.refs.registerDialog.show()
    },
    _showPost() {
        this.refs.postDialog.show()
    }

});



React.render(<Main />, react);



var GeneralKEYs = 
{
    ESC: 27,
    SPACE: 32
};

//-------------------------------------------------------------------------
// public game vars
//-------------------------------------------------------------------------
var playing = false;
var Players = [];
var gamepads = [];

// update tick in ms for gamepad button if pressed
var deltaTick = 200;

function gamepadHandler(event, connecting) 
{
    var gamepad = event.gamepad;

    if (connecting) 
    {
        if (gamepad.index == 0) 
        {
            console.log("Gamepad", gamepad.index, "connected:", gamepad);
        }
        gamepads[gamepad.index] = gamepad;
    } 
    else 
    {
        console.log("Gamepad", gamepad.index, "disconnected:");
    }
}

function handleGamePadAction() 
{
    for (var i = 0; i < gamepads.length; i++) 
    {
        var gp = gamepads[i];

        if (gp != undefined) {

            if (gp.buttons[0].pressed) 
            {
                //x pressed
                play();
            }

            //two gamepads fix
            if (gp.buttons[13] != undefined && gp.buttons[13].pressed) 
            {
                if (timestamp() - Players[i].lastCall.arrow_down > deltaTick) 
                {
                    //arrow down *verified*
                    Players[i].actions.push(DIR.DOWN);
                    Players[i].lastCall.arrow_down = timestamp();
                }
            }

            if (gp.buttons[14] != undefined && gp.buttons[14].pressed) 
            {
                if (timestamp() - Players[i].lastCall.arrow_left > deltaTick) 
                {
                    //arrow left *verified*
                    Players[i].actions.push(DIR.LEFT);
                    Players[i].lastCall.arrow_left = timestamp();
                }
            }

            if (gp.buttons[15] != undefined && gp.buttons[15].pressed) 
            {
                if (timestamp() - Players[i].lastCall.arrow_right > deltaTick) 
                {
                    //arrow right *verified*
                    Players[i].actions.push(DIR.RIGHT);
                    Players[i].lastCall.arrow_right = timestamp();
                }
            }

            if (gp.buttons[12] != undefined && gp.buttons[12].pressed) 
            {
                if (timestamp() - Players[i].lastCall.arrow_up > deltaTick) 
                {
                    //arrow up *verified*
                    Players[i].actions.push(DIR.UP);
                    Players[i].lastCall.arrow_up = timestamp();
                }
            }

            if (gp.buttons[0] != undefined && gp.buttons[0].pressed) 
            {
                if (timestamp() - Players[i].lastCall.x > deltaTick) 
                {
                    //x *verified*
                    Players[i].actions.push(DIR.TURNLEFT);
                    Players[i].lastCall.x = timestamp();
                }
            }

            if (gp.buttons[1] != undefined && gp.buttons[1].pressed) 
            {
                if (timestamp() - Players[i].lastCall.o > deltaTick) 
                {
                    //'o' *verified*
                    Players[i].actions.push(DIR.TURNRIGHT);
                    Players[i].lastCall.o = timestamp();
                }
            }

            if (gp.buttons[2] != undefined && gp.buttons[2].pressed) 
            {
                //square *verified*
            }

            if (gp.buttons[3] != undefined && gp.buttons[3].pressed) 
            {
                //'triangle' *verified*
            }

            if (gp.buttons[4] != undefined && gp.buttons[4].pressed) 
            {
                //l1 *verified*
            }

            if (gp.buttons[5] != undefined && gp.buttons[5].pressed) 
            {
                if (timestamp() - Players[i].lastCall.r1 > deltaTick) 
                {
                    //'r1' *verified*
                    Players[i].actions.push(DIR.HOLD);
                    Players[i].lastCall.r1 = timestamp();
                }
            }

            if (gp.buttons[6] != undefined && gp.buttons[6].pressed) 
            {
                //l2 *verified*
            }

            if (gp.buttons[7] != undefined && gp.buttons[7].pressed) 
            {
                //r2 *verified*
            }
        }
    }
}

function keydown(ev) 
{

    console.log("getting key event", ev);
    var handled = false;
    if (playing) 
    {
        for (var i = 0; i < Players.length; i++) 
        {
            switch (ev.keyCode) 
            {
                case Players[i].KEYs.LEFT:
                    Players[i].actions.push(DIR.LEFT);
                    handled = true;
                    break;
                case Players[i].KEYs.RIGHT:
                    Players[i].actions.push(DIR.RIGHT);
                    handled = true;
                    break;
                case Players[i].KEYs.UP:
                    Players[i].actions.push(DIR.UP);
                    handled = true;
                    break;
                case Players[i].KEYs.DOWN:
                    Players[i].actions.push(DIR.DOWN);
                    handled = true;
                    break;
                case Players[i].KEYs.TURNLEFT:
                    Players[i].actions.push(DIR.TURNLEFT);
                    handled = true;
                    break;
                case Players[i].KEYs.TURNRIGHT:
                    Players[i].actions.push(DIR.TURNRIGHT);
                    handled = true;
                    break;
                case Players[i].KEYs.HOLD:
                    Players[i].actions.push(DIR.HOLD);
                    handled = true;
                    break;
                case 37:
                    Players[i].actions.push(DIR.UP);
                    handled = true;
                    break;
                //case 37:
                //    Players[i].actions.push(DIR.UP);
                //    break;
                case GeneralKEYs.ESC:
                    Players[i].lose();
                    handled = true;
                    break;
            }
        }
    } else if (ev.keyCode == GeneralKEYs.SPACE) 
    {
        play();
        handled = true;
    }
    if (handled) 
    {
        ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
    }
}

function loseCb (player) {

    player.setEnd('LOSE');

    for (var i = 0; i < Players.length; i++)
    {
        if (Players[i] != this)
        {
            Players[i].setEnd('WIN');
            Players[i].incrWins();
        }
    }
    playing = false;
}

function initPlayers () {
    var Player1 = new Player(0);
    //player 1 KEYs: left_arrow, up_arrow, right_arrow, down_arrow, o, p, i
    Player1.KEYs = 
    {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        TURNLEFT: 79,
        TURNRIGHT: 80,
        HOLD: 73
    };

    var Player2 = new Player(1);
    //player 2 KEYs: w, a, s, d, q, e, r
    Player2.KEYs = 
    {
        LEFT: 65,
        UP: 87,
        RIGHT: 68,
        DOWN: 83,
        TURNLEFT: 81,
        TURNRIGHT: 69,
        HOLD: 82
    };

    Player1.setOpponent(Player2);
    Player2.setOpponent(Player1);
    Player1.setLoseCallback(loseCb);
    Player2.setLoseCallback(loseCb);

    Players.push(Player1);
    Players.push(Player2);
}

function haveGamePads() 
{
    return "getGamepads" in navigator;
}

//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------
function run() 
{
    var last = timestamp();
    var now = timestamp();

    if (haveGamePads()) 
        show('start');

    initPlayers();

    // attach keydown and resize events
    addEvents(); 

    function frame() 
    {
        now = timestamp();
        // using requestAnimationFrame have to be able to handle large delta's caused
        // when it 'hibernates' in a background or non-visible tab
        update(Math.min(1, (now - last) / 1000.0)); 
        for (var i = 0; i < Players.length; i++) 
            Players[i].draw();
        last = now;
        //actualize gamepads
        gamepads = navigator.getGamepads();
        requestAnimationFrame(frame, Players[0].canvas);
    }

    resize(); // setup all our sizing information
    reset(); // reset the per-game variables
    frame(); // start the first frame
}

function play() 
{
    if (playing) return;
    playing = true;
    hide('start');
    reset();
}

function addEvents() 
{
    window.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);
    //window.addEventListener("MozGamepadButtonUp", function(e) { console.log(e); }, false);
    //window.addEventListener("MozGamepadButtonDown", buttonHandler);
    //initialize gamepad listener (functions implemented in inputhandle.js)
    window.addEventListener("gamepadconnected", function (e) 
    {
        gamepadHandler(e, true);
    }, false);

    window.addEventListener("gamepaddisconnected", function (e) 
    {
        gamepadHandler(e, false);
    }, false);
}

function resize(event) 
{
    for (var i = 0; i < Players.length; i++)
        Players[i].resize();
}

function reset() 
{
    for (var i = 0; i < Players.length; i++) 
        Players[i].reset();
}

function update(idt) 
{
    handleGamePadAction();
    if (playing) {
        for (var i = 0; i < Players.length; i++) 
            Players[i].update(idt);
    }
}

if (!window.requestAnimationFrame) 
{
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) 
    {
        window.setTimeout(callback, 1000 / 60);
    }
}

run();