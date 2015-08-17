import {randomTetrisPiece} from './tetris.jsx'
import {randomPuyoPiece} from './puyo.jsx'
import {Player, UserInterface} from './player.jsx';
import {get, timestamp, show, hide} from './utils.jsx';

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

export function randomPiece() 
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

var _ = require('lodash');

function handleGamePadAction() 
{
/*
        _.each(gp.buttons, function(button, idx) {
            if(button > 0) {
                console.log("pushed", idx);
            }
        });

*/
    gamepads = navigator.getGamepads();

    var foo = {};
    var pressed = {};
    _.each(gamepads, function(pad) {
      if(pad)
        _.each(pad.buttons, function(button, idx) {
            if(button.pressed) {
                pressed[idx] = true;
                //console.log(pad, "pushed", idx, button);
                //foo = button;
                console.log(pad.id, idx, button.value, button.pressed);
            }
        });

    });

    _.each(last_pressed, function(pressed, idx) {
        console.log(idx)
    });

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
export function run() 
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
        handleGamePadAction();
        update(Math.min(1, (now - last) / 1000.0)); 
        for (var i = 0; i < Players.length; i++) 
            Players[i].draw();
        last = now;
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