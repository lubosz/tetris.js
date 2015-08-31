/**
 * Created by bmonkey on 8/31/15.
 */
import React from 'react';
import OneBlockCanvas from './OneBlockCanvas'

class Hold extends OneBlockCanvas {
    constructor(props) {
        super(props);
        this.holdUsedThisTurn = false;
    }
    drop() {
        this.holdUsedThisTurn = false;
    }
    setHold(court, next) {
        if (this.holdUsedThisTurn)
            return;
        let toHold = court.current;
        if (this.piece == undefined)
            court.setCurrentPiece(next.piece);
        else
            court.setCurrentPiece(this.piece);
        this.piece = toHold;
        next.randomPiece();
        court.current.y = -2;
        court.checkLose();
        this.draw();
        this.holdUsedThisTurn = true;
    }
    reset() {
        this.piece = null;
    }
    render() {
        let style = {
            background: 'url(img/hold.png)',
            backgroundSize: 'contain',
            height: '15vh'
        };
        return (
            <canvas ref="canvas" style={style} />
        );
    }
}

export default Hold;