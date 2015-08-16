import {randomPiece, DIR, nx, ny, nu, mode} from './game.jsx'

//-------------------------------------------------------------------------
// base helper methods
//-------------------------------------------------------------------------
function get(id) 
{
    return document.getElementById(id);
}



function html(id, html) 
{
    get(id).innerHTML = html;
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


//-------------------------------------------------
// This is the Player class containing all Player's
// Informations
//-------------------------------------------------
export function Player(playerNum) 
{
    this.score = 0;
    this.dx = 0;
    this.dy = 0;
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
    this.lastCall.arrow_down = 0;
    this.lastCall.arrow_left = 0;
    this.lastCall.arrow_right = 0;
    this.lastCall.arrow_up = 0;
    this.lastCall.x = 0;
    this.lastCall.o = 0;
    this.lastCall.r1 = 0;
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
                    drawBlock(this.ctx, x, y, this.dx, this.dy, block.color);
                }
            }
        }

        this.ctx.strokeRect(0, 0, nx * this.dx - 1, ny * this.dy - 1); // court boundary
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
        this.uctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
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
        this.hctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
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
    var dx = this.dx;
    var dy = this.dy;
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
        Players[i].setScore();

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
    this.invalid.end = true;
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

export default Player;