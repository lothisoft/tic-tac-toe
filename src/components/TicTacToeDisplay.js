import React from 'react';
import {TicTacToeScoreBoard} from './TicTacToeScoreBoard.js'

import "./css/TicTacToeDisplay.scss";

export const TicTacToeDisplay = () => {
    return (
        <div className="toc-tac-toe-display">
            {<TicTacToeScoreBoard/>}
        </div>
    );
}