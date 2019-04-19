import React from 'react';
import {TicTacToeScoreBoard} from './TicTacToeScoreBoard.js'

import "./css/TicTacToeDisplay.scss";

export class TicTacToeDisplay extends React.Component {
    render () {
        return (
            <div className="toc-tac-toe-display">
                {<TicTacToeScoreBoard />}
            </div>
        );
    }
}