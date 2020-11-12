class ChessOpenings {

    constructor(data) {
        this.data = data;
        this.openings = this.data.map(d => d.eco);

        let tempOpeningCount = {};
        for (let eco of this.openings) {
            tempOpeningCount[eco] = 0;
        }
        for (let eco of this.openings) {
            tempOpeningCount[eco] += 1;
        }
        this.openingCount = []
        for (let val in tempOpeningCount) {
            this.openingCount.push({
                "eco": val,
                "count": tempOpeningCount[val]
            });
        }

        this.drawTable();
    }

    drawTable() {
        let rowSelection = d3.select("#openingsBody").selectAll("tr").data(this.openingCount).join("tr");
        let tdSelection = rowSelection.selectAll("td").data(d => [d, d, d]).join("td");
        let openingCol = tdSelection.filter((d, i) => i === 0);
        openingCol.text(d => d.eco);
        let gamesCol = tdSelection.filter((d, i) => i === 1);
        gamesCol.text(d => d.count);
    }

}