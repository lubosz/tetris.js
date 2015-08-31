/**
 * Created by bmonkey on 8/31/15.
 */
import React from 'react';
import OneBlockCanvas from './OneBlockCanvas'
import {randomPiece} from '../logic';

class Next extends OneBlockCanvas {
    constructor(props) {
        super(props);
    }
    randomPiece() {
        this.piece = randomPiece();
        this.draw();
    }
    render() {
        let style = {
            background: 'url(img/next.png)',
            backgroundSize: 'contain',
            height: '15vh'
        };
        return (
            <canvas ref="canvas" style={style} />
        );
    }
}

export default Next;