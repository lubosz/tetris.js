function randomPiece() 
{
	//-----------------------------------------
	// start with 4 instances of each piece and
	// pick randomly until the 'bag is empty'
	//-----------------------------------------
	var pieces = [];
	if (pieces.length == 0) 
	{
		pieces = [foo, foo, foo, foo]
		///pieces = [i,i,i,i,j,j,j,j,l,l,l,l,o,o,o,o,s,s,s,s,t,t,t,t,z,z,z,z];
	}
	var type = pieces.splice(random(0, pieces.length - 1), 1)[0];
	return {type: type, dir: DIR.UP, x: Math.round(nx / 2 - 2), y: -2};
}