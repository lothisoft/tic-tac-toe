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
            winningTiles:[]
        };

        this.tileClickHandler = this.tileClickHandler.bind(this);
        this.newGameButtonClicked = this.newGameButtonClicked.bind(this);
    }

    /**
     *  createNewBoard() returns an array with 9 entries all of which are undefined
     * @returns {undefined[]}
     */
    createNewBoard = () => {
        return Array.from({length: 9}, () => {return undefined;});
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
            statusMessage: this.statusMessages.humanPlayerTurn
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
     * @returns {{winner: number, scenario: number[]}|null}
     */
    wasGameWon(board) {
        const winningScenario = this.possibleWinScenarios.find((winScenario) => {
            if ((board[winScenario[0]] ===
                board[winScenario[1]] &&
                board[winScenario[1]] ===
                board[winScenario[2]]) &&
                board[winScenario[0]]) {
                return true;
            }
            return false;
        });

        if (!winningScenario) {
            return null;
        }

        // somebody did win, but who?
        const symbol = board[winningScenario[0]];

        if (symbol === this.playerMarker[this.humanPlayer - 1]) {
            return {
                winner:this.humanPlayer,
                scenario: winningScenario
            };
        } else {
            return {
                winner: this.computerPlayer,
                scenario: winningScenario
            };
        }
    };

    /**
     * isGameADraw() returns true it the game is a draw, otherwise false
     * @param board
     * @returns {boolean}
     */
    isGameADraw(board) {
        let isTheGameADraw = true;
        this.tileIds.forEach((tileId) => {
            if (!board[tileId]) {
                isTheGameADraw =false;
            }
        });
        return isTheGameADraw;
    }


    /**
     * determineNextComputerMove() is passed the current board and returnd the next best move for the computer
     * based on an implementation of the Minimax algorithm
     * @param board
     * @returns {*}
     */
    determineNextComputerMove(board) {
        //adapt my data structures to the minimax implementation

        const minimaxBoard = [];
        board.forEach((_, index) => {
            if (!board[index]) {
                minimaxBoard.push(index);
            } else {
                minimaxBoard.push(board[index]);
            }
        });
        // player marker
        const player = this.playerMarker[this.computerPlayer-1];

        return minimax(minimaxBoard, player).index;
    }

    /**
     * tileClickHandler() is the handler when the user clicks any tile
     * @param tileId
     */
    tileClickHandler(tileId) {
        // was the tile already selected or is no game being played
        if (this.state.board[tileId] || !this.state.playerActive) {
            //yes, then don't make any changes
            return;
        }

        // get the current board
        const board = this.state.board;
        //update the board in memory
        board[tileId] = this.playerMarker[this.humanPlayer-1];

        // check if the human one
        const didHumanPlayerWin = this.wasGameWon(board);
        if (didHumanPlayerWin) {
            // and if the human did, record the win and update the state
            this.recordWin(this.humanPlayer);
            this.setState({
                board:board,
                winningTiles:didHumanPlayerWin.scenario,
                playerActive: 0,
                statusMessage: this.statusMessages.HumanWins
            });
            // and we are done here
            return;
        }

        // is the game a draw?
        if (this.isGameADraw(board)) {
            // yes, the game is a draw
            // update the board
            this.setState({
                board: board,
                playerActive: 0,
                statusMessage: this.statusMessages.Draw
            });
            // and we are done here
            return;
        }

        // the human hasn't won yet, so let the computer make the next move
        const nextComputerMove = this.determineNextComputerMove(board, this.computerPlayer);
        // and update the board in memory
        board[nextComputerMove] = this.playerMarker[this.computerPlayer-1];

        // did the computer win?
        const didComputerWin = this.wasGameWon(board);
        if (didComputerWin)  {
            // yes, the computer won
            // record the win for the display
            this.recordWin(this.computerPlayer);
            // and update the board
            this.setState({
                board:board,
                winningTiles:didComputerWin.scenario,
                playerActive: 0,
                statusMessage: this.statusMessages.ComputerWins
            });
            // and we are done here
            return;
        }

        // is the game a draw?
        if (this.isGameADraw(board)) {
            //yes, game is a draw
            this.setState({
                board: board,
                playerActive: 0,
                statusMessage: this.statusMessages.Draw
            });
            return;
        }

        // the game is still on, the player is now up
        this.setState({
            board: board,
            playerActive: this.humanPlayer,
            statusMessage: this.statusMessages.humanPlayerTurn
        });
    };

    /**
     * renderSingleTile() renders one tile.  The tile id determines the position of the tile on the board and set's the
     * className properties according to the position on the board.  The tile is clickable if it has no content and
     * one player is active.
     *
     * @param tileId  The id of the tile
     * @returns {*}
     */
    renderSingleTile(tileId) {
        return (
            <div    key={tileId}
                    className={cx("tile",   {"top-row":tileId<=2},
                                            {"left-column":tileId===0||tileId===3||tileId===6},
                                            {"right-column":tileId===2||tileId===5||tileId===8},
                                            {"bottom-row":tileId>=6},
                                            {"click-able":(!this.state.board[tileId]) && this.state.playerActive} ,
                                            {"winning-tile": (this.state.winningTiles.length && this.state.winningTiles.findIndex((id) => {return id===tileId}) !== -1) })}
                    onClick={() => { return this.tileClickHandler(tileId);}}>
                {this.state.board[tileId]}
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




