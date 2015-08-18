import {randomTetrisPiece} from './tetris.jsx'
import {randomPuyoPiece} from './puyo.jsx'
import {Player, UserInterface} from './player.jsx';
import {get, timestamp, show, hide} from './utils.jsx';
import _ from 'lodash';

//set to "puyp" or "tetris"
export const mode = "tetris";

export const DIR = 
{
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    MIN: 0,
    MAX: 3,
    TURNLEFT: 4,
    TURNRIGHT: 5,
    HOLD: 6
};

var GeneralKEYs = 
{
    ESC: 27,
    SPACE: 32
};

export const nx = 10;    // width of tetris court (in blocks)
export const ny = 20;    // height of tetris court (in blocks)
export const nu = 5;     // width/height of upcoming preview (in blocks)

//-------------------------------------------------------------------------
// public game vars
//-------------------------------------------------------------------------
var playing = false;
var Players = [];
var gamepads = [];

// update tick in ms for gamepad button if pressed
var deltaTick = 200;

var paused = false;

function randomPiece()
{
    var type;
    if(mode == "puyu")
        type = randomPuyoPiece();
    else if(mode == "tetris")
        type = randomTetrisPiece();
    return {type: type, dir: DIR.UP, x: Math.round(nx / 2 - 2), y: -2};
}

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

var last_pressed = {};
var interval_ids = {};
var timeout_ids = {};
const repeat_interval = 80; //ms
const repeat_timeout = 300; //ms


function delayedPressed(idx, callback) {
    callback();
    timeout_ids[idx] = setTimeout(function(){
        callback();
        interval_ids[idx] = setInterval(function(){
            callback();
        }, repeat_interval);
    }, repeat_timeout);
}

function gamePadCallback(pad, idx, type) {
    //console.log(pad, idx, type);
    var i = pad.index;
    if (type == "pressed") {
        switch(idx) {
            case 13:
                //arrow down
                delayedPressed(idx, function() {Players[i].actions.push(DIR.DOWN);} );
                break;
            case 14:
                //arrow left
                delayedPressed(idx, function() {Players[i].actions.push(DIR.LEFT);} );
                break;
            case 15:
                //arrow right
                delayedPressed(idx, function() {Players[i].actions.push(DIR.RIGHT);} );
                break;
            case 12:
                //arrow up
                Players[i].actions.push(DIR.UP);
                break;
            case 0:
                //x
                play();
                Players[i].actions.push(DIR.TURNLEFT);
                break;
            case 1:
                //'o'
                Players[i].actions.push(DIR.TURNRIGHT);
                break;
            case 5:
                //'r1'
                Players[i].actions.push(DIR.HOLD);
                break;
            case 9:
                //'options
                togglePause();
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
        clearInterval(interval_ids[idx]);
        clearInterval(timeout_ids[idx]);
    }
}

function handleGamePadAction() 
{
    gamepads = navigator.getGamepads();

    _.each(gamepads, function(pad) {
        if(pad) {
            var pressed = {};
            _.each(pad.buttons, function(button, idx) {
                if(button.pressed) {
                    pressed[idx] = true;
                    if (Object.keys(last_pressed[pad.index]).indexOf(idx.toString()) < 0)
                        gamePadCallback(pad, idx, "pressed");
                }
            });
            _.each(last_pressed[pad.index], function(isPressed, idx) {
                if (Object.keys(pressed).indexOf(idx) < 0)
                    gamePadCallback(pad, idx, "released");
            });
            last_pressed[pad.index] = Object.assign({}, pressed);
        }
    });
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
        handleGamePadAction();

        // using requestAnimationFrame have to be able to handle large delta's caused
        // when it 'hibernates' in a background or non-visible tab
        if (!paused) {
            now = timestamp();
            update(Math.min(1, (now - last) / 1000.0));
            Players.forEach(p => {p.draw()});
            last = now;
        }
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

function togglePause() {
    paused = !paused;
    if (paused)
        show('paused');
    else
        hide('paused');
}

function addEvents() 
{
    window.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);
    //window.addEventListener("MozGamepadButtonUp", function(e) { console.log(e); }, false);
    //window.addEventListener("MozGamepadButtonDown", buttonHandler);
    window.addEventListener("gamepadconnected", function (e) { gamepadHandler(e, true);});
    window.addEventListener("gamepaddisconnected", function (e) {gamepadHandler(e, false);});
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
    if (playing) {
        for (var i = 0; i < Players.length; i++) 
            Players[i].update(idt);
    }
}

export { run, randomPiece };