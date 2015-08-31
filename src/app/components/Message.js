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
            fontSize: '2vh'
        };
        return (
            <div style={messageStyle}>
                {this.state.text}
            </div>
        );
    }
}

export default Message;