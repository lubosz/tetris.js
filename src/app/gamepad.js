/**
 * Created by bmonkey on 8/18/15.
 */
import _ from 'lodash';

var last_pressed = {};
var interval_ids = {};
var timeout_ids = {};

const repeat_interval = 80; //ms
const repeat_timeout = 150; //ms

function haveGamePads() {
    return "getGamepads" in navigator;
}

function gamepadHandler(event, connecting) {
    var pad = event.gamepad;
    if (connecting) {
        if (pad.index == 0)
            console.log("Gamepad", pad.index, "connected:", pad);
    } else {
        console.log("Gamepad", pad.index, "disconnected:");
    }
}

function delayedPressed(idx, callback) {
    callback();
    timeout_ids[idx] = setTimeout(function () {
        callback();
        interval_ids[idx] = setInterval(function () {
            callback();
        }, repeat_interval);
    }, repeat_timeout);
}

function clearDelayed(idx) {
    clearInterval(interval_ids[idx]);
    clearInterval(timeout_ids[idx]);
}

function queryGamePads(gamePadCallback) {
    let gamepads = navigator.getGamepads();
    _.each(gamepads, function (pad) {
        if (pad) {
            let pressed = {};
            _.each(pad.buttons, function (button, idx) {
                if (button.pressed) {
                    pressed[idx] = true;
                    let thisPadsLastPressed = last_pressed[pad.index];
                    if (thisPadsLastPressed != null) {
                        let lastPressedKeys = Object.keys(thisPadsLastPressed);
                        // if was not pressed last event
                        if(lastPressedKeys.indexOf(idx.toString()) < 0)
                            gamePadCallback(pad, idx, "pressed");
                    } else {
                        // if was never pressed before
                        gamePadCallback(pad, idx, "pressed");
                    }
                }
            });
            _.each(last_pressed[pad.index], function (isPressed, idx) {
                if (Object.keys(pressed).indexOf(idx) < 0)
                    gamePadCallback(pad, idx, "released");
            });
            if (pressed != undefined)
                last_pressed[pad.index] = Object.assign({}, pressed);
        }
    });
}

export {gamepadHandler, queryGamePads, clearDelayed, delayedPressed, haveGamePads};