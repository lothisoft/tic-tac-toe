import React from 'react';

import "./css/TicTacToeScoreBoard.scss"

/**
 *  TicTacToeScoreBoard displays the win statistics of two Tic Tac Toe players.
 *  Instead of React state, localstorage is utilized to store and retrieve the player statistics.
 *  Updates to the localstorage by the Tic Tac Toe board are communicated using a custom event.
 */
export class TicTacToeScoreBoard extends React.Component {
    constructor(props) {
        super(props);

        // load the previous scores from localstorage
        this.playerOneScore = localStorage.getItem('PlayerOneWins') || 0;
        this.playerTwoScore = localStorage.getItem('PlayerTwoWins') || 0;

        this.weHaveANewWinnerUpdated = this.weHaveANewWinnerUpdated.bind(this);
        this.clearButtonClicked = this.clearButtonClicked.bind(this);
    }

    /**
     *  weHaveANewWinnerUpdated() is an event handler which is called when the "WeHaveAWinner" event is caught
     *  The event handler updates the number of games won for the player based on the player id found in the
     *  WeHaveAWinner item in local storage.
     */
    weHaveANewWinnerUpdated() {
        const playerIdWhoWon = localStorage.getItem('WeHaveAWinner');

        let numberOfGamesWon = 0;
        if (playerIdWhoWon === "1") {
            numberOfGamesWon = localStorage.getItem('PlayerOneWins') || 0;
            numberOfGamesWon++;
            localStorage.setItem('PlayerOneWins', ""+numberOfGamesWon);
            this.playerOneScore = numberOfGamesWon;
        } else if  (playerIdWhoWon === "2") {
            numberOfGamesWon = localStorage.getItem('PlayerTwoWins') || 0;
            numberOfGamesWon++;
            localStorage.setItem('PlayerTwoWins', ""+numberOfGamesWon);
            this.playerTwoScore = numberOfGamesWon;
        }

        // make sure this component re-renders
        this.forceUpdate();
    };

    /**
     * clearButtonClicked()nis called when a user clicked the "Clear" button.  It clears the games won statistics for
     * both players by removing the respective entries from the localstorage.
     */
    clearButtonClicked () {
        localStorage.removeItem('PlayerOneWins');
        localStorage.removeItem('PlayerTwoWins');
        this.playerOneScore = 0;
        this.playerTwoScore = 0;

        // make sure this component re-renders
        this.forceUpdate();
    }

    componentDidMount() {
        // add an event listener so that we notified when a new winner was determined
        if (typeof window !== 'undefined') {
            window.addEventListener('WeHaveAWinner', this.weHaveANewWinnerUpdated)
        }

        //load the previous games statistics for both players
        this.playerOneScore = localStorage.getItem('PlayerOneWins') || 0;
        this.playerTwoScore = localStorage.getItem('PlayerTwoWins') || 0;
    }

    componentWillUnmount(){
        // clean up the event listener when this component goes away
        if (typeof window !== 'undefined') {
            window.removeEventListener('WeHaveAWinner', this.weHaveANewWinnerUpdated)
        }
    }

    render () {
        return (
            <div className="tic-tac-toe-score-board">
                <div className="player-display">
                    <div className="caption">
                        Human (X)
                    </div>
                    <div className="score">
                        {this.playerOneScore}
                    </div>
                </div>
                <div className="vs-display">
                    vs
                </div>
                <div className="player-display" >
                    <div className="caption">
                     Computer (O)
                    </div>
                    <div className="score">
                        {this.playerTwoScore}
                    </div>
                </div>
                <button onClick={this.clearButtonClicked}
                        className="clear-button">
                    Clear
                </button>
            </div>
        );
    }
}