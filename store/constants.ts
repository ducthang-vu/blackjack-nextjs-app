import { Action } from "redux";

enum ActionTypes {
    StartHand = 'StartHand',
    MakeBet = 'MakeBet',
    InitialDeal = 'InitialDeal',
    Surrender = 'Surrender',
    DoubleDown = 'DoubleDown',
    PlayerDraw = 'PlayerDraw',
    PlayerStay = 'PlayerStay',
    BankerDraw = 'BankerDraw',
    EndgameAction = 'EndgameAction'
}

enum GamePhases {
    BettinStage = 'BettingStage',
    InitialDraw = 'InitialDraw',
    FirstUserAction = 'FirstUserAction',
    UserAction = 'UserAction',
    BankerAction = 'BankerAction',
    Endgame = 'Endgame',
    GameEnded = 'GameEnded'
}

export { ActionTypes, GamePhases }