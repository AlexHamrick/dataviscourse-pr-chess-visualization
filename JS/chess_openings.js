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

        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'thOpenings'
            },
            {
                sorted: false,
                ascending: false,
                key: 'thGames'
            },
            {
                sorted: false,
                ascending: false,
                key: 'thWhite'
            },
            {
                sorted: false,
                ascending: false,
                key: 'thDraw'
            },
            {
                sorted: false,
                ascending: false,
                key: 'thBlack'
            },
        ]
        this.attachSortHandlers();
        // Start sorted by most games
        that.reducdedData.sort(function(a,b) {
            return d3.descending(a.games, b.games);
        });
        this.drawTable();
    }

    drawTable() {
        d3.select("#openingsBody").selectAll("tr").remove();
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
        let svg = resultCol.append("svg").attr("width",210).attr("height", 40);
        let group = svg.append("g");
        let bars = group
            .selectAll("rect").data((d,i) => transpose[i]).join("rect")
            .attr("x",d => xScale(d[0]/d.data['games']))
            .attr("y", 10)
            .attr("width", d => xScale((d[1]-d[0])/d.data['games']))
            .attr("height", 20)
            .attr("fill", function (d,i) {
                if (i == 0) {
                    return 'white';
                } else if (i == 1) {
                    return 'grey';
                } else {
                    return 'black';
                }
            })
            .attr("stroke", "black")
            .attr("transform", "translate(5,0)");
    }

    attachSortHandlers() {
        let headers = d3.select("#openingsHeaders")
            .selectAll(".sortable")
            .data(this.headerData);
        let that = this;
        // e == event, d == thing you clicked
        headers.on("click", function (e,d) {
          let key = d.key;
            let index = -1;
            that.headerData.forEach(function(d,i) {
                if (d.key == key) {
                    index = i;
                    d.sorted = true;
                } else {
                    d.sorted = false;
                }
            });
            let hdr = that.headerData[index];
            if (!hdr.ascending) {
                that.reducdedData.sort(function(a,b) {
                    return d3.ascending(a.eco, b.eco);
                });
            } else {
                that.reducdedData.sort(function(a,b) {
                    return d3.descending(a.eco, b.eco);
                });
            }
            if (!hdr.ascending) {
                switch (key) {
                    case ('thOpenings'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.ascending(a.eco, b.eco);
                        });
                        break;
                    case ('thGames'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.ascending(a.games, b.games);
                        });
                        break;
                    case ('thWhite'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.ascending(a.white/a.games, b.white/b.games);
                        });
                        break;
                    case ('thDraw'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.ascending(a.draw/a.games, b.draw/b.games);
                        });
                        break;
                    case ('thBlack'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.ascending(a.black/a.games, b.black/b.games);
                        });
                        break;
                }
            } else {
                switch (key) {
                    case ('thOpenings'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.descending(a.eco, b.eco);
                        });
                        break;
                    case ('thGames'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.descending(a.games, b.games);
                        });
                        break;
                    case ('thWhite'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.descending(a.white/a.games, b.white/b.games);
                        });
                        break;
                    case ('thDraw'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.descending(a.draw/a.games, b.draw/b.games);
                        });
                        break;
                    case ('thBlack'):
                        that.reducdedData.sort(function(a,b) {
                            return d3.descending(a.black/a.games, b.black/b.games);
                        });
                        break;
                }
            }
            hdr.ascending = !hdr.ascending;
            that.drawTable();
        });
    }

}