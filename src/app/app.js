import {run} from './game.jsx'
/*
import injectTapEventPlugin from 'react-tap-event-plugin'
let React = require('react/addons');
let mui = require('material-ui');
let RaisedButton = mui.RaisedButton;
let Dialog = mui.Dialog;
let AppBar = mui.AppBar;
let Tab = mui.Tab;
let Tabs = mui.Tabs;
let IconButton = mui.IconButton;
let FlatButton = mui.FlatButton;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

injectTapEventPlugin();

let Main = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    },

    componentWillMount() {
        ThemeManager.setPalette({
            accent1Color: Colors.deepOrange500
        });
    },

    render() {

        let containerStyle = {
            textAlign: 'center',
        };

        let standardActions = [
            {text: 'OkayLOL'}
        ];

        return (
            <div>
                <AppBar
                    title="Foo"
                    iconClassNameLeft="muidocs-icon-navigation-expand-more"
                    iconElementRight={
                        <div>
                            <RaisedButton label="New Idea" primary={true} onTouchTap={this._showPost} />
                            <RaisedButton label="Login" primary={true} onTouchTap={this._showLogin} />
                            <RaisedButton label="Register" primary={true} onTouchTap={this._showRegistration} />
                        </div>
                    }/>
                <Dialog
                    title="Login"
                    actions={standardActions}
                    ref="loginDialog">
                    Oh hai
                </Dialog>
            </div>
        );
    },

    _showLogin() {
        this.refs.loginDialog.show()
    },
    _showRegistration() {
        this.refs.registerDialog.show()
    },
    _showPost() {
        this.refs.postDialog.show()
    }

});

React.render(<Main />, react);
*/
run();