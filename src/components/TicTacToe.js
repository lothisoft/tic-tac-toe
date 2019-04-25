import React from 'react';

import {TicTacToeDisplay} from './TicTacToeDisplay.js';
import {TicTacToeBoard} from './TicTacToeBoard.js';

import "./css/TicTacToe.scss";

export const TicTacToe = () => {
    return (
        <div className="tic-tac-toe-component">
            <TicTacToeDisplay />
            <TicTacToeBoard />
        </div>
    );
};
