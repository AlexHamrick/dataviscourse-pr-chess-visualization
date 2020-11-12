loadData().then(data => {
    let bestPlayers = data;

    let chessOpenings = new ChessOpenings(bestPlayers);
});

async function loadData() {
    let path = 'Data/BestPlayersReformat.csv';
    let bestPlayers = await d3.csv(path, function (d) {
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

    return bestPlayers;
}