loadData().then(data => {
    // Chess Opening Results
    let bestPlayers = data["BestPlayers"];
    let chessOpenings = new ChessOpenings(bestPlayers);

    // Gini Impurity Results
    let giniImpurityData = data["GiniImpurites"]
    const giniImpurity = new GiniImpurity(giniImpurityData);

    function updateOtherPlots(currentYear, selectedName) {
        chessOpenings.updateYear(currentYear);
        giniImpurity.drawHistogram(selectedName)
    }

    // Top Players Results
    let topRankedPlayersData = data["TopRankedPlayers"];
    let playerCareerData = data["PlayerCareers"];
    let playerRanking = new PlayerRanking(topRankedPlayersData, playerCareerData, updateOtherPlots);
});

async function loadData() {
    // Load data for Chess Opening Results
    let bestPlayersPath = 'Data/BestPlayers.csv';
    let bestPlayers = await d3.dsv(';', bestPlayersPath, function (d) {
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
            WhiteName: d.WhiteName,
            GiniImpurity: d.GiniImpurity,
            TalliedGames: d.GamesInDataset,
            MaxElo : d.MaxElo
        };
    });

    // Load data for Best Players
    let topPlayersPath = 'Data/TopPlayersByYear.csv';
    let playerCareersPath = 'Data/TopPlayerCareers.csv';
    let topPlayers = await d3.dsv(';', topPlayersPath, function (d) {
        return {
            name: d.PlayerName,
            date: d.Date,
            elo: d.Elo
        };
    });

    let playerCareers = await d3.dsv(';', playerCareersPath, function (d) {
        return {
            name: d.PlayerName,
            date: d.Date,
            elo: d.Elo
        };
    });

    return {
        BestPlayers: bestPlayers,
        GiniImpurites: giniImpurites,
        TopRankedPlayers: topPlayers,
        PlayerCareers: playerCareers
    };
}