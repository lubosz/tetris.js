import React from 'react';
import { Battle, Marathon} from './components/Main';
import injectTapEventPlugin from 'react-tap-event-plugin';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

React.render(<Battle />, react);
//React.render(<Marathon />, react);