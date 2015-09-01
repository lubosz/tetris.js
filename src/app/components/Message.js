/**
 * Created by bmonkey on 8/31/15.
 */
import React from 'react';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibility: 'visible',
            text: 'Press X to Play'
        }
    }
    setText(text) {
        this.setState({text: text});
    }
    hide() {
        this.setState({visibility: 'hidden'});
    }
    show() {
        this.setState({visibility: 'visible'});
    }
    render() {
        let messageStyle = {
            visibility: this.state.visibility,
            position: 'absolute',
            fontSize: '2vh',
            width: '100vw',
            top: '45vh',
            paddingTop: '5vh',
            paddingBottom: '5vh',
            left: 0,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 'bold'
        };
        return (
            <div style={messageStyle}>
                {this.state.text}
            </div>
        );
    }
}

export default Message;