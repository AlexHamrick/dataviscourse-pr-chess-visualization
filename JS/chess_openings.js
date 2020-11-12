class ChessOpenings {

    constructor(data) {
        this.data = data;

        let tempReducedData = new Map();
        for (let d of this.data) {
            tempReducedData.set(d.eco, {
                    "eco": d.eco,
                    "games": 0,
                    "white": 0,
                    "draw": 0,
                    "black": 0
                });
        };

        this.data.forEach(function (d) {
            let tempReducedDataVal = tempReducedData.get(d.eco);
            tempReducedDataVal['games'] += 1;
            if (d.result == "1-0") {
                tempReducedDataVal['white'] += 1;
            } else if (d.result == "1/2-1/2") {
                tempReducedDataVal['draw'] += 1;
            } else {
                tempReducedDataVal['black'] += 1;
            }
        });

        this.reducdedData = [];
        let that = this;
        tempReducedData.forEach(function(value, key) {
            that.reducdedData.push(value);
        });

        this.drawTable();
    }

    drawTable() {
        let rowSelection = d3.select("#openingsBody").selectAll("tr").data(this.reducdedData).join("tr");
        let tdSelection = rowSelection.selectAll("td").data(d => [d, d, d]).join("td");
        let openingCol = tdSelection.filter((d, i) => i === 0);
        openingCol.text(d => d.eco);
        let gamesCol = tdSelection.filter((d, i) => i === 1);
        gamesCol.text(d => d.games);
        let resultCol = tdSelection.filter((d,i) => i === 2);
        resultCol.text(d => `white:${d.white} draw:${d.draw} black:${d.black}`);
    }

}