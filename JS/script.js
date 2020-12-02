loadData().then(data => {
    // Gini Impurity Results
    let giniImpurityData = data["GiniImpurites"]
    const giniImpurity = new GiniImpurity(giniImpurityData);

    function updateOtherPlots(currentYear, selectedName, color) {
        chessOpenings.updateYear(currentYear);
        giniImpurity.drawHistogram(selectedName)
        playerOpenings.drawPlot(selectedName, color);

    }
    let playerOpeningData = data['PlayerOpenings'];
    let playerOpenings = new PlayerOpening(playerOpeningData);

    // Top Players Results
    let topRankedPlayersData = data["TopRankedPlayers"];
    let playerCareerData = data["PlayerCareers"];
    let playerRanking = new PlayerRanking(topRankedPlayersData, playerCareerData, updateOtherPlots);

    // Chess Openings Table must be initialized after Player Ranking Plot because
    // slider must be made prior to setting the 'on-click' handler for 'year on slider' radio button.
    // Chess Opening Results
    let bestPlayers = data["BestPlayers"];
    let allEco = data["allEco"];
    let gameResults = data["gameResults"];
    let chessOpenings = new ChessOpenings(bestPlayers, allEco, gameResults);

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

    let aECOPath = 'Data/a.tsv';
    let aEco = await d3.dsv('\t', aECOPath, function (d) {
        return {
            eco: d.eco,
            opening: d.name
        };
    });
    let bECOPath = 'Data/b.tsv';
    let bEco = await d3.dsv('\t', bECOPath, function (d) {
        return {
            eco: d.eco,
            opening: d.name
        };
    });
    let cECOPath = 'Data/c.tsv';
    let cEco = await d3.dsv('\t', cECOPath, function (d) {
        return {
            eco: d.eco,
            opening: d.name
        };
    });
    let dECOPath = 'Data/d.tsv';
    let dEco = await d3.dsv('\t', dECOPath, function (d) {
        return {
            eco: d.eco,
            opening: d.name
        };
    });
    let eECOPath = 'Data/e.tsv';
    let eEco = await d3.dsv('\t', eECOPath, function (d) {
        return {
            eco: d.eco,
            opening: d.name
        };
    });
    let allEco = d3.merge([aEco,bEco,cEco,dEco,eEco]);

    let gameResultsPath = 'Data/ECO.csv';
    let gameResults = await d3.dsv(';', gameResultsPath, function (d) {
        return {
            year: d.Year,
            eco: d.ECO,
            games: +d.Games,
            white: +d.WhiteWins,
            draw: +d.Draws,
            black: +d.BlackWins
        };
    })

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

    // Load data for Player Openings
    let playerOpeningsPath = 'Data/TopPlayerOpenings.csv';
    let playerOpenings = await d3.dsv(';', playerOpeningsPath, function (d) {
        return {
            name: d.PlayerName,
            eco: d.ECO,
            count: d.count,
            pct: d.pct
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
        PlayerCareers: playerCareers,
        allEco: allEco,
        PlayerOpenings: playerOpenings,
        gameResults: gameResults
    };
}