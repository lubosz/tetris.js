/**
 * Created by bmonkey on 8/31/15.
 */
import React from 'react';
import {nu} from '../logic';
import {drawPiece} from '../renderer';

class OneBlockCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.dy = 0;
        this.dx = 0;
        this.piece = null;
    }
    componentDidMount() {
        this.canvas = this.refs.canvas.getDOMNode();
        this.ctx = this.canvas.getContext('2d');
    }
    draw() {
        // TODO: center block in box
        // half-arsed attempt at centering next piece display
        // var padding = ((nu - this.next.type.size) / 2 - 1);
        this.ctx.save();
        this.ctx.scale(0.7, 0.7);
        this.ctx.clearRect(0, 0, nu * this.dx, nu * this.dy);
        this.ctx.strokeStyle = 'white';
        drawPiece(this.ctx, this.piece.type, 1, 1, this.dx, this.dy, this.piece.dir);
        this.ctx.restore();
    }
    resize(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        if (this.piece)
            this.draw();
    }
}

export default OneBlockCanvas;