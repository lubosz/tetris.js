import React from 'react';


class Player extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        // TODO: use react, not DOM IDs
        let hold = "holdP" + this.props.number;
        let score = "scoreP" + this.props.number;
        let rows = "rowsP" + this.props.number;
        let wins = "winsP" + this.props.number;
        let end = "endP" + this.props.number;
        let canvas = "canvasP" + this.props.number;
        let upcoming = "upcomingP" + this.props.number;

        let avatarStyle = {
            background: "url(img/avatars/" + this.props.background + ")",
            backgroundSize: "contain",
            height: "15vh",
        };

        let nameStyle = {
            fontWeight: "bold",
            color: this.props.color
        };

        let playerStyle = {
            display: "inline-block",
            padding: 0,
            fontSize: "1.0vw"
        }

        let tableStyle = {
            display: "inline-block",
            textAlign: "right"
        }

        return (
            <div style={playerStyle}>
                <div className="hud">
                    <canvas id={hold} />
                    <div style={avatarStyle} />
                    <div>
                        <span style={nameStyle}>{this.props.name}</span><br/>
                        <table style={tableStyle}>
                            <tr><td>Score</td><td id={score}>00000</td></tr>
                            <tr><td>Rows</td><td id={rows}>0</td></tr>
                            <tr><td>Wins</td><td id={wins}>0</td></tr>
                        </table>
                    </div>
                    <div id={end} />
                </div>
                <canvas id={canvas} />
                <div className="hud">
                    <canvas id={upcoming} />
                </div>
            </div>
        );
    }
}

class Messages extends React.Component {
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
            <div id="messages" style={absoluteStyle}>
                <div id="start" className="message">Press X to Play</div>
                <div id="paused" className="message" style={hiddenStyle}>Paused</div>
            </div>
        );
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id="outer">
                <div id="inner">
                    <Messages />
                    <Player number="1" name="Lubosz" background="lubosz.jpg" color="blue" />
                    <Player number="2" name="Jessi" background="porenta.gif" color="purple" />
                </div>
            </div>
        );
    }
}

export default Main;