//import {keydown, handleGamePadAction} from './inputhandle.jsx'
import {randomTetrisPiece} from './tetris.jsx'


var GeneralKEYs = 
{
    ESC: 27,
    SPACE: 32
};

var gamepads = {};

function gamepadHandler(event, connecting) 
{
    var gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) 
    {
        if (gamepad.index == 0) 
        {
            show('connGP_P1');
        }
        if (gamepad.index == 1) 
        {
            show('connGP_P2');
        }
        gamepads[gamepad.index] = gamepad;
    } 
    else 
    {
        delete gamepads[gamepad.index];
    }
}

var deltaTick = 200;    //update tick in ms for gamepad button if pressed

function handleGamePadAction() 
{
    for (var i = 0; i < gamepads.length; i++) 
    {
        var gp = gamepads[i];

        if (gp != undefined) {

            if (!playing && gp.buttons[0].pressed) 
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



//-------------------------------------------------------------------------
// public game vars
//-------------------------------------------------------------------------
var playing = false;
//set to "puyp" or "tetris"
var mode = "tetris";
var nx = 10;    // width of tetris court (in blocks)
var ny = 20;    // height of tetris court (in blocks)
var nu = 5;     // width/height of upcoming preview (in blocks)
var puyucolors = ['cyan','yellow','green','red','purple'];
var dx;
var dy;

var DIR = 
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

var Players = [];
var gamepads = [];

function canGame() 
{
    return "getGamepads" in navigator;
}

//-------------------------------------------------------------------------
// base helper methods
//-------------------------------------------------------------------------
function get(id) 
{
    return document.getElementById(id);
}

function hide(id) 
{
    get(id).style.visibility = 'hidden';
}

function show(id) 
{
    get(id).style.visibility = null;
}

function html(id, html) 
{
    get(id).innerHTML = html;
}

function timestamp() 
{
    return new Date().getTime();
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


function getRandomPuyuColor()
{
    return puyucolors[Math.floor(Math.random() * puyucolors.length)];
}

function randomPuyoPiece() {
    return ({
        size: 2,
        blocks: [0x0C00, 0x4400, 0x0C00, 0x4400],
        color: getRandomPuyuColor(), 
        color2: getRandomPuyuColor()
    });
}


function randomPiece() 
{
    var type;
    if(mode == "puyu")
        type = randomPuyoPiece();
    else if(mode == "tetris")
        type = randomTetrisPiece();
    return {type: type, dir: DIR.UP, x: Math.round(nx / 2 - 2), y: -2};
}

//-------------------------------------------------
// This is the Player class containing all Player's
// Informations
//-------------------------------------------------
function Player(playerNum) 
{
    this.score = 0;
    this.actions = [];
    this.KEYs = 
    {
        ESC: 27,
        SPACE: 32,
        LEFT: 65,
        UP: 87,
        RIGHT: 68,
        DOWN: 83
    };
    this.invalid = {};
    this.wins = 0;
    this.hold = undefined,
    this.playerNum = playerNum;
    this.invalid.court = false;
    this.holdUsed = false;
    this.speed = 
    {
        start: 0.6,
        decrement: 0.005,
        min: 0.1
    }; // how long before piece drops by 1 row (seconds)

    //gamepad timestamp variables
    this.lastCall = {};
    this.lastCall.arrow_down = timestamp();
    this.lastCall.arrow_left = timestamp();
    this.lastCall.arrow_right = timestamp();
    this.lastCall.arrow_up = timestamp();
    this.lastCall.x = timestamp();
    this.lastCall.o = timestamp();
    this.lastCall.r1 = timestamp();
}

Player.prototype.eachblock = function (type, x, y, dir, fn) 
{
    //---------------------------------------------------
    // do the bit manipulation and iterate through each
    // occupied block (x,y) for a given piece applying fn
    //---------------------------------------------------
    var bit, result, row = 0,
        col = 0,
        blocks = type.blocks[dir];


    for (bit = 0x8000; bit > 0; bit = bit >> 1) 
    {
        if (blocks & bit) 
        {
            fn(x + col, y + row);
        }
        if (++col === 4) 
        {
            col = 0;
            ++row;
        }
    }
}

//-----------------------------------------------------
// check if a piece can fit into a position in the grid
//-----------------------------------------------------
Player.prototype.occupied = function (type, x, y, dir) 
{
    var result = false
    var actualBlocks = this.blocks;

    this.eachblock(type, x, y, dir, function (x, y) 
    {
        if ((x < 0) || (x >= nx) || (y >= ny) || (actualBlocks && actualBlocks[x] ? actualBlocks[x][y] : null)) 
        {
            result = true;
        }
    });
    return result;
}

Player.prototype.puyuoccupied = function (type, x, y, dir) 
{
    var result = undefined;
    var actualBlocks = this.blocks;

    this.eachblock(type, x, y+1, dir, function (x, y) 
    {
        if (!((x < 0) || (x >= nx) || (y >= ny) || (actualBlocks && actualBlocks[x] ? actualBlocks[x][y] : null))) 
        {
            result = 
            {
                type: type = 
                {
                    size: 1,
                    blocks: [0x8000, 0x8000, 0x8000, 0x8000],
                    color: "yellow"
                }, 
                dir: DIR.UP, 
                x: x, 
                y: y-1
            };
        }
    });
    return result;
}

Player.prototype.unoccupied = function (type, x, y, dir) 
{
    return !this.occupied(type, x, y, dir);
}

Player.prototype.handle = function (action) 
{
    switch (action) 
    {
        case DIR.LEFT:
            this.move(DIR.LEFT);
            break;
        case DIR.RIGHT:
            this.move(DIR.RIGHT);
            break;
        case DIR.UP:
            this.instantDrop();
            break;
        case DIR.DOWN:
            this.drop();
            break;
        case DIR.TURNLEFT:
            this.rotate(DIR.TURNLEFT);
            break;
        case DIR.TURNRIGHT:
            this.rotate(DIR.TURNRIGHT);
            break;
        case DIR.HOLD:
            this.setHold(this.current);
            break;
    }
}

Player.prototype.move = function (dir) 
{
    var x = this.current.x,
        y = this.current.y;
    switch (dir) 
    {
        case DIR.RIGHT:
            x = x + 1;
            break;
        case DIR.LEFT:
            x = x - 1;
            break;
        case DIR.DOWN:
            y = y + 1;
            break;
    }
    if (this.unoccupied(this.current.type, x, y, this.current.dir)) 
    {
        this.current.x = x;
        this.current.y = y;
        this.invalid.court = true;
        return true;
    } 
    else 
    {
        return false;
    }
}

Player.prototype.rotate = function (dir) 
{
    if (DIR.TURNRIGHT == dir) 
    {
        var newdir = (this.current.dir == DIR.MAX ? DIR.MIN : this.current.dir + 1);
        var dir;
        var inval = false;
        var turned = false;

        if (this.unoccupied(this.current.type, this.current.x, this.current.y, newdir)) 
        {
            dir = newdir;
            turned = true;
        }
    } 
    else if (DIR.TURNLEFT == dir) 
    {
        var newdir = (this.current.dir == DIR.MIN ? DIR.MAX : this.current.dir - 1);
        if (this.unoccupied(this.current.type, this.current.x, this.current.y, newdir)) 
        {
            dir = newdir;
            turned = true;
        }
    }

    if (turned) 
    {
        this.current.dir = dir;
        this.invalid.court = true;
    }
}

Player.prototype.instantDrop = function () 
{
    var flying = this.move(DIR.DOWN)
    while (flying) 
    {
        flying = this.move(DIR.DOWN)
    }

    this.addScore(10);
    this.dropPiece();
    this.removeLines();
    this.setCurrentPiece(this.next);
    this.setNextPiece(randomPiece());
    this.clearActions();
    if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) 
    {
        this.lose();
    }
}

Player.prototype.puyuGravityDrop = function () 
{
    var flying = this.move(DIR.DOWN)

    var last = timestamp();
    var now = last;

    while (flying) 
    {
        now = timestamp();
        var deltatime = now - last;
        if(deltatime > 100)
        {
            flying = this.move(DIR.DOWN);
        }
    }

    this.addScore(10);
    this.dropPiece();
    this.removeLines();
    this.setCurrentPiece(this.next);
    this.setNextPiece(randomPiece());
    this.clearActions();
    if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) 
    {
        this.lose();
    }
}

Player.prototype.drop = function () 
{
    if (!this.move(DIR.DOWN)) 
    {
        this.addScore(10);
        this.dropPiece();
        this.removeLines();
        this.setCurrentPiece(this.next);
        this.setNextPiece(randomPiece());
        this.clearActions();
        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) 
        {
            this.lose();
        }
    }
}

Player.prototype.dropPiece = function () 
{
    var type = this.current.type;
    var playerBlocks = this.blocks;
    var inval = false;

        this.eachblock(this.current.type, this.current.x, this.current.y, this.current.dir, function (x, y) 
        {
            inval = true;
            playerBlocks = setBlock(x, y, playerBlocks, type);
        });
        this.blocks = playerBlocks;

        if (inval) 
        {
            this.invalid.court = true;
        }

    if(mode == "puyu")
    {
        //check if a bean is still falling
        var fallingBean = this.puyuoccupied(this.current.type, this.current.x, this.current.y, this.current.dir);
        if( fallingBean != undefined)
        {
            this.current = fallingBean;
            this.puyuGravityDrop();
        }
    }
}

Player.prototype.removeLines = function () 
{
    var x, y, complete, n = 0;
    for (y = ny; y > 0; --y) 
    {
        complete = true;
        for (x = 0; x < nx; ++x) 
        {
            if (!(this.blocks && this.blocks[x] ? this.blocks[x][y] : null)) 
            {
                complete = false;
            }
        }
        if (complete) 
        {
            this.removeLine(y);
            y = y + 1; // recheck same line
            n++;
        }
    }
    if (n > 0) 
    {
        this.addRows(n);
        this.addScore(100 * Math.pow(2, n - 1)); // 1: 100, 2: 200, 3: 400, 4: 800

        //send lines to an opponent player if 2, 3 or 4 lines where removed
        if (n == 4) 
        {
            //tetris: send all 4 lines
            this.addOpponentLines(4);
        }

        if (n == 2 || n == 3) 
        {
            //send n-1 lines
            this.addOpponentLines(n - 1);
        }
    }
}

Player.prototype.removeLine = function (n) 
{
    var x, y;
    for (y = n; y >= 0; --y) 
    {
        for (x = 0; x < nx; ++x) 
        {
            setBlock(x, y, this.blocks, (y == 0) ? null : (this.blocks && this.blocks[x] ? this.blocks[x][y - 1] : null));
        }
    }
}

Player.prototype.addOpponentLines = function (n) 
{
    //select opponent to receive lines
    var oppNum = this.playerNum + 1;
    if (oppNum >= Players.length) 
    {
        oppNum = 0;
    }
    Players[oppNum].receiveLines(n);
}

Player.prototype.receiveLines = function (n) 
{
    var gap = 0;
    gap = Math.floor(Math.random() * nx);

    //do n times:
    for (var i = 0; i < n; i++) 
    {
        //shift blocks 1 to top
        for (var y = 0; y < ny + 1; y++) 
        {
            for (x = 0; x < nx; ++x) 
            {
                setBlock(x, y, this.blocks, (y == 0) ? null : (this.blocks && this.blocks[x] ? this.blocks[x][y + 1] : null));
            }
        }
    }

    //then add received rows
    for (var y = ny - n; y < ny; y++) 
    {
        for (var x = 0; x < nx; ++x) 
        {
            if (x != gap) 
            {
                setBlock(x, y, this.blocks, 'cyan');
            }
        }
    }
}

Player.prototype.draw = function () 
{
    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.translate(0.5, 0.5); // for crisp 1px black lines
    this.drawCourt();
    this.drawNext();
    this.drawHold();
    this.drawScore();
    this.drawRows();
    this.drawWins();
    this.drawEnd();
    this.ctx.restore();
}

Player.prototype.drawCourt = function () 
{
    if (this.invalid.court) 
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'white';
        this.drawPiece(this.ctx, this.current.type, this.current.x, this.current.y, this.current.dir);

        var x, y, block; 
        for (y = 0; y < ny; y++) 
        {
            for (x = 0; x < nx; x++) 
            {
                if (block = (this.blocks && this.blocks[x] ? this.blocks[x][y] : null)) 
                {
                    drawBlock(this.ctx, x, y, dx, dy, block.color);
                }
            }
        }

        this.ctx.strokeRect(0, 0, nx * dx - 1, ny * dy - 1); // court boundary
        this.invalid.court = false;
    }
}

Player.prototype.drawNext = function () 
{
    if (this.invalid.next) 
    {
        var padding = ((nu - this.next.type.size) / 2 - 1); // half-arsed attempt at centering next piece display
        this.uctx.save();
        this.uctx.translate(0.5, 0.5);
        this.uctx.clearRect(0, 0, nu * dx, nu * dy);
        this.uctx.strokeStyle = 'white';
        this.drawPiece(this.uctx, this.next.type, 1, 1, this.next.dir);
        this.uctx.restore();
        this.invalid.next = false;
    }
}

Player.prototype.drawHold = function () 
{
    if (this.invalid.hold) 
    {
        var padding = (nu - this.next.type.size) / 2; // half-arsed attempt at centering next piece display
        this.hctx.save();
        this.hctx.translate(0.5, 0.5);
        this.hctx.clearRect(0, 0, nu * dx, nu * dy);
        this.hctx.strokeStyle = 'white';
        this.drawPiece(this.hctx, this.hold.type, 1, 1, this.hold.dir);
        this.hctx.restore();
        this.invalid.hold = false;
    }
}

Player.prototype.drawScore = function () 
{
    if (this.invalid.score) 
    {
        html(this.scoreView, ("00000" + Math.floor(this.score)).slice(-5));
        this.invalid.score = false;
    }
}

Player.prototype.drawRows = function () 
{
    if (this.invalid.rows) 
    {
        html(this.rowsView, this.rows);
        this.invalid.rows = false;
    }
}

Player.prototype.drawWins = function () 
{
    if (this.invalid.wins) 
    {
        html(this.winsView, this.wins);
        this.invalid.wins = false;
    }
}

Player.prototype.drawEnd = function () 
{
    if (this.invalid.end) 
    {
        html(this.endView, this.end);
        this.invalid.end = false;
    }
}

Player.prototype.drawPiece = function (ctx, type, x, y, dir)
{
    this.eachblock(type, x, y, dir, function (x, y)
    {
        drawBlock(ctx, x, y, dx, dy, type.color);
    });
}

Player.prototype.play = function () 
{
    this.playing = true;
}

Player.prototype.lose = function ()
{
    this.setEnd('LOSE');

    for (var i = 0; i < Players.length; i++)
    {
        Players[i].playing = false;
        Players[i].setVisualScore();

        if (Players[i] != this)
        {
            Players[i].setEnd('WIN');
            Players[i].incrWins();
        }
    }

    playing = false;
}

Player.prototype.setEnd = function(win)
{
    this.end = win;
    this.invalidateEnd();
}

Player.prototype.setScore = function (n)
{
    this.score = n;
    this.score = n || this.score;
    this.invalid.score = true;
}

Player.prototype.addScore = function (n)
{
    this.score = this.score + n;
}

Player.prototype.clearScore = function ()
{
    this.setScore(0);
}

Player.prototype.clearRows = function ()
{
    this.setRows(0);
}

Player.prototype.setRows = function (n) 
{
    this.rows = n;
    this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * this.rows));
    this.invalid.rows = true;
}

Player.prototype.incrWins = function () 
{
    this.wins++;
    this.step = Math.max(this.speed.min, this.speed.start - (this.speed.decrement * this.wins));
    this.invalid.wins = true;
}

Player.prototype.addRows = function (n) 
{
    this.setRows(this.rows + n);
}

Player.prototype.clearBlocks = function () 
{
    this.blocks = [];
    this.invalid.court = true;
}

Player.prototype.clearActions = function () 
{
    this.actions = [];
}

Player.prototype.setCurrentPiece = function (piece) 
{
    this.current = piece || randomPiece();
    this.invalid.court = true;
    this.holdUsed = false;
}

Player.prototype.setNextPiece = function (piece) 
{
    this.next = piece || randomPiece();
    this.invalid.next = true;
}

Player.prototype.setHold = function (piece) 
{
    if (!this.holdUsed) 
    {
        if (this.hold == undefined) 
        {
            this.hold = piece;
            this.setCurrentPiece(this.next);
            this.setNextPiece(randomPiece());
        } 
        else 
        {
            this.setCurrentPiece(this.hold);
            this.hold = piece;
        }

        this.current.y = -2;

        if (this.occupied(this.current.type, this.current.x, this.current.y, this.current.dir)) 
        {
            this.lose();
        }

        this.invalid.hold = true;
        this.holdUsed = true;
    }
}

//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------
function run() 
{
    function canGame() 
    {
        return "getGamepads" in navigator;
    }

    if (canGame()) 
    {
        show('start');
    }

    var Player1 = new Player(0);

    Player1.canvas = get('canvasP1');
    Player1.ucanvas = get('upcomingP1');
    Player1.hcanvas = get('holdP1');
    Player1.ctx = Player1.canvas.getContext('2d');
    Player1.uctx = Player1.ucanvas.getContext('2d');
    Player1.hctx = Player1.hcanvas.getContext('2d');
    Player1.scoreView = 'scoreP1';
    Player1.rowsView = 'rowsP1';
    Player1.endView = 'endP1';
    Player1.winsView = 'winsP1';
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
    Player2.canvas = get('canvasP2');
    Player2.ucanvas = get('upcomingP2');
    Player2.hcanvas = get('holdP2');
    Player2.ctx = Player2.canvas.getContext('2d');
    Player2.uctx = Player2.ucanvas.getContext('2d');
    Player2.hctx = Player2.hcanvas.getContext('2d');
    Player2.scoreView = 'scoreP2';
    Player2.rowsView = 'rowsP2';
    Player2.endView = 'endP2';
    Player2.winsView = 'winsP2';
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

    Players.push(Player1);
    Players.push(Player2);

    addEvents(); // attach keydown and resize events

    var last = timestamp();
    var now = timestamp();
    function frame() 
    {
        now = timestamp();
        update(Math.min(1, (now - last) / 1000.0)); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        for (var i = 0; i < Players.length; i++) 
        {
            Players[i].draw();
        }
        last = now;
        //actualize gamepads
        gamepads = navigator.getGamepads();
        requestAnimationFrame(frame, Player1.canvas);
    }

    resize(); // setup all our sizing information
    reset(); // reset the per-game variables
    frame(); // start the first frame
}

function play() 
{
    playing = true;
    hide('start');
    reset();
    //start the game for each player
    for (var i = 0; i < Players.length; i++) 
    {
        Players[i].play();
    }
}

function drawBlock(ctx, x, y, dx, dy, color) 
{
    ctx.fillStyle = color;
    ctx.fillRect(x * dx, y * dy, dx, dy);
    ctx.strokeRect(x * dx, y * dy, dx, dy)
}

function setBlock(x, y, blocks, type) 
{
    blocks[x] = blocks[x] || [];
    blocks[x][y] = type;

    return blocks;
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
    {
        Players[i].canvas.width = Players[i].canvas.clientWidth; // set canvas logical size equal to its physical size
        Players[i].canvas.height = Players[i].canvas.clientHeight; // (ditto)
        Players[i].ucanvas.width = Players[i].ucanvas.clientWidth;
        Players[i].ucanvas.height = Players[i].ucanvas.clientHeight;
        Players[i].hcanvas.width = Players[i].hcanvas.clientWidth;
        Players[i].hcanvas.height = Players[i].hcanvas.clientHeight;
        Players[i].invalid.court = true;
        Players[i].invalid.next = true;
    }
    dx = Players[0].canvas.width / nx;      // pixel size of a single tetris block
    dy = Players[0].canvas.height / ny;     // (ditto)
}


//-------------------------------------------------------------------------
// GAME LOGIC
//-------------------------------------------------------------------------

function reset() 
{
    for (var i = 0; i < Players.length; i++) 
    {
        Players[i].dt = 0;
        Players[i].clearActions();
        Players[i].clearBlocks();
        Players[i].clearRows();
        Players[i].clearScore();
        Players[i].setCurrentPiece(Players[i].next);
        Players[i].setNextPiece();
    }
}

function update(idt) 
{
    handleGamePadAction();
    if (playing) {
        for (var i = 0; i < Players.length; i++) 
        {
            Players[i].handle(Players[i].actions.shift());
            Players[i].dt = Players[i].dt + idt;
            if (Players[i].dt > Players[i].step) 
            {
                Players[i].dt = Players[i].dt - Players[i].step;
                Players[i].drop();
            }
        }
    }
}

run();