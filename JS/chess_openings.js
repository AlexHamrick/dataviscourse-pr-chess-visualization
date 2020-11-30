class ChessOpenings {

    constructor(data) {
        this.data = data;

        let tempReducedData = new Map();
        for (let d of this.data) {
            tempReducedData.set(d.eco, {
                    "date": d.date.substring(0,4),
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
        this.currentData = [...this.reducdedData];

        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'thOpenings'
            },
            {
                sorted: true,
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
        this.updateHeaders();
        this.drawTable();
    }

    drawTable() {
        d3.select("#openingsBody").selectAll("tr").remove();
        this.updateHeaders();
        // sort table data according the header data before attaching to DOM
        for (let hdr of this.headerData) {
            if (hdr.sorted) {
                this.sortTable(hdr);
            }
        }
        let rowSelection = d3.select("#openingsBody").selectAll("tr").data(this.currentData).join("tr");
        let tdSelection = rowSelection.selectAll("td").data(d => [d, d, d]).join("td");
        let openingCol = tdSelection.filter((d, i) => i === 0);
        openingCol.text(d => d.eco);
        let gamesCol = tdSelection.filter((d, i) => i === 1);
        gamesCol.text(d => d.games);
        let resultCol = tdSelection.filter((d,i) => i === 2);
        let series = d3.stack().keys(["white", "draw", "black"])(this.currentData);
        let transpose = d3.transpose(series);
        let xScale = d3.scaleLinear().domain([0,1]).range([0,400]);
        let svg = resultCol.append("svg").attr("width",410).attr("height", 50);
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
            .attr("stroke", "black")
            .attr("transform", "translate(5,0)");

        let percentages = group.append("svg")
            .selectAll("text").data((d,i) => transpose[i]).join("text")
            .text(function(d) {
                let percent = Math.round(100*(d[1]-d[0])/d.data['games']);
                // text doesn't fit well when <= 6%, so only draw when > 6%.
                if (percent > 6) {
                    return `${percent}%`;
                }
            })
            .attr("x",d => 8 + xScale(d[0]/d.data['games']))
            .attr("y", 30)
            .attr("fill", function (d, i) {
                if (i == 0) {
                    return "black";
                } else if (i == 1) {
                    return "white";
                } else {
                    return "white";
                }
            });
    }

    updateYear(currentYear) {
        d3.select("#chessOpeningsYear").text(currentYear);
        d3.select("#openingsBody").selectAll("tr").remove();
        let tempReducedData = new Map();
        for (let d of this.data) {
            if (d.date.substring(0,4) == currentYear) {
                tempReducedData.set(d.eco, {
                    "date": d.date.substring(0,4),
                    "eco": d.eco,
                    "games": 0,
                    "white": 0,
                    "draw": 0,
                    "black": 0
                });
            }
        };

        this.data.forEach(function (d) {
            let tempReducedDataVal = tempReducedData.get(d.eco);
                if (d.date.substring(0,4) == currentYear) {
                    tempReducedDataVal['games'] += 1;
                    if (d.result == "1-0") {
                        tempReducedDataVal['white'] += 1;
                    } else if (d.result == "1/2-1/2") {
                        tempReducedDataVal['draw'] += 1;
                    } else {
                        tempReducedDataVal['black'] += 1;
                    }
                }
        });

        this.currentData = [];
        let that = this;
        tempReducedData.forEach(function(value, key) {
            that.currentData.push(value);
        });

        this.drawTable();
    }

    updateHeaders() {
        let openingsHeaders = d3.select("#openingsHeaders")
            .selectAll(".sortable")
            .data(this.headerData);

        openingsHeaders.classed("sorting", d => d.sorted);
        let icons = openingsHeaders.selectAll("i").data(d => [d]);
        icons.classed("fas", true);
        icons.classed("no-display", d => !d.sorted);
        icons.classed("fa-sort-up", d => d.ascending);
        icons.classed("fa-sort-down", d => !d.ascending);
    }

    // sorts table according to header data
    sortTable(hdr) {
        let key = hdr.key;
        if (hdr.ascending) {
            switch (key) {
                case ('thOpenings'):
                    this.currentData.sort(function(a,b) {
                        return d3.ascending(a.eco, b.eco);
                    });
                    break;
                case ('thGames'):
                    this.currentData.sort(function(a,b) {
                        return d3.ascending(a.games, b.games);
                    });
                    break;
                case ('thWhite'):
                    this.currentData.sort(function(a,b) {
                        return d3.ascending(a.white/a.games, b.white/b.games);
                    });
                    break;
                case ('thDraw'):
                    this.currentData.sort(function(a,b) {
                        return d3.ascending(a.draw/a.games, b.draw/b.games);
                    });
                    break;
                case ('thBlack'):
                    this.currentData.sort(function(a,b) {
                        return d3.ascending(a.black/a.games, b.black/b.games);
                    });
                    break;
            }
        } else {
            switch (key) {
                case ('thOpenings'):
                    this.currentData.sort(function(a,b) {
                        return d3.descending(a.eco, b.eco);
                    });
                    break;
                case ('thGames'):
                    this.currentData.sort(function(a,b) {
                        return d3.descending(a.games, b.games);
                    });
                    break;
                case ('thWhite'):
                    this.currentData.sort(function(a,b) {
                        return d3.descending(a.white/a.games, b.white/b.games);
                    });
                    break;
                case ('thDraw'):
                    this.currentData.sort(function(a,b) {
                        return d3.descending(a.draw/a.games, b.draw/b.games);
                    });
                    break;
                case ('thBlack'):
                    this.currentData.sort(function(a,b) {
                        return d3.descending(a.black/a.games, b.black/b.games);
                    });
                    break;
            }
        }
    }

    // sorts table according to which sort button is clicked
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
            that.sortTable(hdr);
            hdr.ascending = !hdr.ascending;
            that.drawTable();
        });
    }

}