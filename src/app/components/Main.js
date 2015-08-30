import React from 'react';


class Player extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let pl = "player" + this.props.number;
        let hold = "holdP" + this.props.number;
        let avatar = "avatarP" + this.props.number;
        let name = "nameP" + this.props.number;
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

        return (
            <div id={pl}>
                <div className="hud">
                    <canvas id={hold}></canvas>
                    <div style={avatarStyle}></div>
                    <div>
                        <span id={name}>{this.props.name}</span><br/>
                        Score: <span id={score}>00000</span><br/>
                        Rows: <span id={rows}>0</span><br/>
                        Total wins: <span id={wins}>0</span><br/>
                    </div>
                    <div id={end}></div>
                </div>
                <canvas id={canvas}>
                    Sorry, this game cannot be run because your browser does not support the &lt;canvas&gt; element
                </canvas>
                <div className="hud">
                    <canvas id={upcoming}></canvas>
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
                    <Player number="1" name="Lubosz" background="lubosz.jpg" />
                    <Player number="2" name="Jessi" background="porenta.gif" />
                </div>
            </div>
        );
    }
}

export default Main;