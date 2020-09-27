enum GameActionTypes {
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

enum UserActionTypes {
    SetUser = 'SetUser',
    SetCredit ='SetCredit'
}

enum GamePhases {
    PreGame = 'PreGame',
    BettinStage = 'BettingStage',
    InitialDraw = 'InitialDraw',
    FirstUserAction = 'FirstUserAction',
    UserAction = 'UserAction',
    BankerAction = 'BankerAction',
    Endgame = 'Endgame',
    GameEnded = 'GameEnded'
}

export { GameActionTypes, UserActionTypes, GamePhases }