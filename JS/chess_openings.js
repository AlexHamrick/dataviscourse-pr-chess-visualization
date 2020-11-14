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
        let series = d3.stack().keys(["white", "draw", "black"])(this.reducdedData);
        let transpose = d3.transpose(series);
        let xScale = d3.scaleLinear().domain([0,1]).range([0,200]);
        let svg = resultCol.append("svg").attr("width",300).attr("height", 50);
        let group = svg.append("g");
        let bars = group
            .selectAll("rect").data((d,i) => transpose[i]).join("rect")
            .attr("x",d => xScale(d[0]/d.data['games']))
            .attr("y", 10)
            .attr("width", d => xScale((d[1]-d[0])/d.data['games']))
            .attr("height", 30)
            .attr("fill", function (d,i) {
                if (i == 0) {
                    return 'white';
                } else if (i == 1) {
                    return 'grey';
                } else {
                    return 'black';
                }
            })
            .attr("stroke", "black");
    }

}