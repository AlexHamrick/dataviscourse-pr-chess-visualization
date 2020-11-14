loadData().then(data => {
    // Chess Opening Results
    let bestPlayers = data["BestPlayers"];
    let chessOpenings = new ChessOpenings(bestPlayers);

    // Gini Impurity Results
    
});

async function loadData() {
    // Load data for Chess Opening Results
    let bestPlayersReformatPath = 'Data/BestPlayersReformat.csv';
    let bestPlayers = await d3.csv(bestPlayersReformatPath, function (d) {
        return {
            date: d.Date,
            whiteName: d.WhiteName,
            whiteElo: +d.WhiteElo,
            blackName: d.BlackName,
            blackElo: +d.BlackElo,
            result: d.Result,
            eco: d.ECO,
            decade: +d.Decade,
        };
    });

    // Load data for Gini Impurity Results
    let giniImpuritiesPath = 'Data/GiniImpurity.csv';
    let giniImpurites = await d3.dsv(';', giniImpuritiesPath, function (d) {
        return {
            whiteName: d.WhiteName,
            giniImpurity: d.GiniImpurity,
            talliedGames: d.GamesInDataset,
            maxElo : d.MaxElo
        };
    });

    return {
        BestPlayers: bestPlayers,
        GiniImpurites: giniImpurites
    };
}