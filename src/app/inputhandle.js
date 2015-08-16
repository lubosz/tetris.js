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

var deltaTick = 200;	//update tick in ms for gamepad button if pressed

function handleGamePadAction() 
{
	for (var i = 0; i < gamepads.length; i++) 
	{
		var gp = gamepads[i];

		if (gp != undefined) {

			if (!playing && gp.buttons[0] != undefined && gp.buttons[0].pressed) 
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