import React from 'react';
import cx from 'classnames'

import {minimax} from "../util/minimax.js";

import './css/TicTacToeBoard.scss';

export class TicTacToeBoard extends React.Component {

    tileIds = [0,1,2,3,4,5,6,7,8];   // a list of all valid tile ids
    humanPlayer = 1;                 // define Player Ids
    computerPlayer = 2;

    playerMarker = ['X','O'];        // the markers for player 1 and player 2

    possibleWinScenarios = [         // all possible winning tic tac toe scenarios
        [0,1,2],   //horizontal
        [3,4,5],
        [6,7,8],

        [0,3,6],  //vertical
        [1,4,7],
        [2,5,8],

        [0,4,8],  //diagonal
        [2,4,6]
    ];

    statusMessages = {
        NewGame:"Click the New Game button to start a new game -->",
        humanPlayerTurn:"It's the Human's (X) turn",
        computerPlayerTurn:"It's the Computer's (O) turn",
        Draw:"The game is a draw" ,
        HumanWins: "Human (X) wins",
        ComputerWins: "Computer (O) wins"
    };


    constructor(props) {
        super(props);

        const anEmptyBoard =  this.createNewBoard();
        this.state = {
            board:anEmptyBoard,
            playerActive:0,
            statusMessage:this.statusMessages.NewGame,
            winningTiles:[],
            isTheBoardClickable:false
        };

        this.tileClickHandler = this.tileClickHandler.bind(this);
        this.newGameButtonClicked = this.newGameButtonClicked.bind(this);
    }

    /**
     *  createNewBoard() returns an array with 9 entries all of which are the tileId
     * @returns {[]}
     */
    createNewBoard = () => {
        return Array.from({length: 9}, (_,index) => {return index;});
    };

    /**
     *  newGameButtonClicked() is the click handler the the "New Game" button
     */
    newGameButtonClicked() {
        const newBoard = this.createNewBoard();
        // randomly determine which player does the next move
        const playerStartingTheNextGame = Math.floor(Math.random() * 2) + 1;

        if (playerStartingTheNextGame === this.computerPlayer) {
            const randomFirstMove = (board) => {
                function getRandomInt(max) {
                    return Math.floor(Math.random() * Math.floor(max));
                }
                return getRandomInt(board.length-1);
            };


            //let the computer make the first random move, if you use the MiniMax algorithm this game is really boring
            // (it's bad enough the the human can't win in this game)
            const nextComputerMove = randomFirstMove(newBoard);

            newBoard[nextComputerMove] = this.playerMarker[this.computerPlayer-1];
            // no need to check for winning or draws because it's the first move
        }

        this.setState({
            board: newBoard,
            winningTiles: [],
            playerActive: this.humanPlayer,
            statusMessage: this.statusMessages.humanPlayerTurn,
            isTheBoardClickable:true
        });
    }

    /**
     * recordWin() saved the player id of the most recent winner in the localstorage
     * @param playerId
     */
    recordWin(playerId) {
        localStorage.setItem('WeHaveAWinner', ""+playerId);

        // the localstorage setItem call generates a "storage" event which cannot be caught on the same page
        // that's why we have to generate a custom event that we can listen to on this page

        // create an event the old fashioned way to preserve IE compatibility
        const event = document.createEvent('Event');
        event.initEvent('WeHaveAWinner', true, true);
        document.dispatchEvent(event);
    };

    /**
     * wasGameWon() returns an object with the winner and the winning scenario if the game was won, otherwise null
     * @param board
     * @param player
     * @returns {{winner: number, scenario: number[]}|null}
     */
    wasGameWon(board, player) {
        const playerMarker = this.playerMarker[player-1];
        const winningScenario = this.possibleWinScenarios.find((winScenario) => {
            return (board[winScenario[0]] ===
                board[winScenario[1]] &&
                board[winScenario[1]] ===
                board[winScenario[2]]) &&
                board[winScenario[0]] === playerMarker;

        });

        if (!winningScenario) {
            return null;
        }
        return {
            winner:player,
            scenario: winningScenario
        };
    };

    /**
     * isGameADraw() returns true it the game is a draw, otherwise false
     * @param board
     * @returns {boolean}
     */
    isGameADraw(board) {
        let isTheGameADraw = true;
        this.tileIds.forEach((tileId) => {
            // if there is a number on the board it means that the field hasn't been clicked yet
            if (typeof (board[tileId]) === "number") {
                isTheGameADraw =false;
            }
        });
        return isTheGameADraw;
    }


    /**
     * determineNextComputerMove() is passed the current board and returns the next best move for the computer
     * based on an implementation of the Minimax algorithm
     * @param board
     * @returns {*}
     */
    determineNextComputerMove(board) {
        return minimax(board, this.playerMarker[this.computerPlayer-1]).index;
    }

    /**
     * tileClickHandler() is the handler when the user clicks any tile
     * @param tileId
     */
    tileClickHandler(tileId) {

        /**
         * Simulate a click event.
         * @public
         * @param {Element} elem  the element to simulate a click on
         * from: https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/
         */
        function simulateClick(elem) {
            // Create a click event programmatically
            const evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            elem.dispatchEvent(evt);
        }

        // was the tile already selected (is there an X or O on the board?) or is no game being played
        // this should never happen but just in case
        if (typeof (this.state.board[tileId]) !== "number" || !this.state.playerActive) {
            //yes, then don't make any changes
            return;
        }

        // get the current board
        const board = this.state.board;
        //update the board in memory
        board[tileId] = this.playerMarker[this.state.playerActive - 1];

        // now, turn off the click handlers for the entire board
        this.setState({isTheBoardClickable: false},

            () => {
                // the state has been updated, the board click handler are all disabled
                // check if the active player won
                const didPlayerWin = this.wasGameWon(board, this.state.playerActive);
                if (didPlayerWin) {
                    let statusMessage = this.statusMessages.ComputerWins;
                    if (this.state.playerActive === this.humanPlayer) {
                        statusMessage = this.statusMessages.HumanWins;
                    }
                    this.recordWin(this.state.playerActive);
                    this.setState({
                        board: board,
                        winningTiles: didPlayerWin.scenario,
                        playerActive: 0,
                        statusMessage: statusMessage,
                        isTheBoardClickable: false
                    });
                    // and we are done here
                    return;
                }

                // or was the the game a draw?
                if (this.isGameADraw(board)) {
                    // yes, the game is a draw
                    // update the board
                    this.setState({
                        board: board,
                        playerActive: 0,
                        statusMessage: this.statusMessages.Draw,
                        isTheBoardClickable: false
                    });
                    // and we are done here
                    return;
                }

                // the game is still on, the next player is now up
                let nextPlayer = this.humanPlayer;
                let nextStatusMessage = this.statusMessages.humanPlayerTurn;
                if (this.state.playerActive === this.humanPlayer) {
                    nextPlayer = this.computerPlayer;
                    nextStatusMessage = this.statusMessages.computerPlayerTurn
                }

                this.setState({
                    board: board,
                    playerActive: nextPlayer,
                    statusMessage: nextStatusMessage,
                    isTheBoardClickable: nextPlayer === this.humanPlayer
                }, () => {
                    if (this.state.playerActive === this.humanPlayer) {
                        // for the human player, wait for his mouse click
                        // so we are done here and can just exit
                        return;
                    }

                    // but if the computer is the next player
                    // the timeout here is to simulate a lag between the human click handling and waiting for the
                    // computer's move
                    setTimeout(() => {
                        // determine the next move
                        const nextComputerMove = this.determineNextComputerMove(board, this.computerPlayer);
                        // if determineNextComputerMove() would take a long time, which it doesn't, it could be made asynchronous

                        // make the board clickable again
                        this.setState({
                                isTheBoardClickable: true
                            }, () => {
                                // the board is now clickable again
                                // now simulate the mouse click by the computer on the tile
                                simulateClick(document.getElementById(`${nextComputerMove}`));
                            });
                    }, 1000);

                })
            })
    };




    /**
     * renderSingleTile() renders one tile.  The tile id determines the position of the tile on the board and set's the
     * className properties according to the position on the board.  The tile is clickable if the tile has a numeric content
     * and if the board is clickable
     *
     * @param tileId  The id of the tile
     * @returns {*}
     */
    renderSingleTile(tileId) {
        return (
            <div    key={tileId}
                    id={(typeof(this.state.board[tileId]) === "number" && ""+this.state.board[tileId]) || "" }
                    className={cx("tile",   {"top-row":tileId<=2},
                                            {"left-column":tileId===0||tileId===3||tileId===6},
                                            {"right-column":tileId===2||tileId===5||tileId===8},
                                            {"bottom-row":tileId>=6},
                                            {"click-able":(typeof(this.state.board[tileId]) === "number")  && this.state.isTheBoardClickable} ,
                                            {"winning-tile": (this.state.winningTiles.length && this.state.winningTiles.findIndex((id) => {return id===tileId}) !== -1) })}
                    onClick={() => {(this.state.isTheBoardClickable) && (typeof(this.state.board[tileId]) === "number") && this.tileClickHandler(tileId)}}>
                {typeof(this.state.board[tileId]) !== "number" && this.state.board[tileId]}
            </div>
        );
    };

    /**
     * renderAllNineTiles() renders all tiles on the Tic Tac Toe board
     * @returns {*[]}
     */
    renderAllNineTiles() {
       return this.tileIds.map((tileId)=> {
                   return  this.renderSingleTile(tileId);
               });

    };

    render () {
        return (
            <div className="tic-tac-toe-board-parent">
                <div className="tic-tac-toe-board">
                    {this.renderAllNineTiles()}
                </div>
                <div className="status-display">
                    <div className="status-message">
                        {this.state.statusMessage}
                    </div>
                    {(!this.state.playerActive) && <button className="new-game-button"
                                                            onClick={this.newGameButtonClicked}>
                        New Game
                    </button>}
                </div>
            </div>
        );
    };
}




