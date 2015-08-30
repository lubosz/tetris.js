import React from 'react';

class Main extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let hiddenStyle = {
            visibility: 'hidden'
        };

        let absoluteStyle = {
            position: 'absolute'
        };

        return (
<div id="outer">
    <div id="inner">
        <div id="messages" style={absoluteStyle}>
            <div id="start" className="message">Press X to Play</div>
            <div id="paused" className="message" style={hiddenStyle}>Paused</div>
        </div>

        <div id="player1">
            <div className="hud">
                <canvas id="holdP1"></canvas>
                <div id="avatarP1"></div>
                <div>
                    <span id="nameP1">Lubosz</span><br/>
                    Score: <span id="scoreP1">00000</span><br/>
                    Rows: <span id="rowsP1">0</span><br/>
                    Total wins: <span id="winsP1">0</span><br/>
                </div>
                <div id="endP1"></div>
            </div>
            <canvas id="canvasP1">
                Sorry, this game cannot be run because your browser does not support the &lt;canvas&gt; element
            </canvas>
            <div className="hud">
                <canvas id="upcomingP1"></canvas>
            </div>
        </div>

        <div id="player2">
            <div className="hud">
                <canvas id="holdP2"></canvas>
                <div id="avatarP2"></div>
                <div>
                    <span id="nameP2">Jessi</span><br/>
                    Score: <span id="scoreP2">00000</span><br/>
                    Rows: <span id="rowsP2">0</span><br/>
                    Total wins: <span id="winsP2">0</span><br/>
                </div>
                <div id="endP2"></div>
            </div>
            <canvas id="canvasP2">
                Sorry, this game cannot be run because your browser does not support the &lt;canvas&gt; element
            </canvas>
            <div className="hud">
                <canvas id="upcomingP2"></canvas>
            </div>
        </div>
    </div>
</div>

        );
    }

}

export default Main;