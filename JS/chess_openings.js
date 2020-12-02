class ChessOpenings {
    // 29 Nov 2020 - Performance can be improved by pre-calculating game results in csv file
    constructor(data, allEco, gameResults) {
        this.data = data;
        this.ecoToOpening = new Map();
        for (let d of allEco) {
            this.ecoToOpening.set(d.eco, d.opening);
        }
        this.gameResults = gameResults;

        let tempAllYearsData = new Map();
        for (let d of gameResults) {
            if (tempAllYearsData.has(d.eco)) {
                tempAllYearsData.get(d.eco)['games'] += d.games;
                tempAllYearsData.get(d.eco)['white'] += d.white;
                tempAllYearsData.get(d.eco)['draw'] += d.draw;
                tempAllYearsData.get(d.eco)['black'] += d.black;
            } else {
                tempAllYearsData.set(d.eco, {
                    "eco": d.eco,
                    "games": d.games,
                    "white": d.white,
                    "draw": d.draw,
                    "black": d.black
                });
            }
        }
        this.allYearsData = Array.from(tempAllYearsData.values());
        this.currentData = this.allYearsData;

        this.yearMap = new Map();
        for (let d of this.gameResults) {
            if (this.yearMap.has(d.year)) {
                this.yearMap.get(d.year)
                    .push({
                        "year": d.year,
                        "eco": d.eco,
                        "games": d.games,
                        "white": d.white,
                        "draw": d.draw,
                        "black": d.black
                    })
            } else {
                this.yearMap.set(d.year, []);
            }
        }

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

        this.attachRadioButtonHandlers();
        this.attachSortHandlers();
        // draws initial down-arrow sorting symbol
        this.updateHeaders();
        this.drawTable();

        // Initialize chess openings year text
        let allDataButton = d3.select("#radioAllData");
        if (allDataButton.property("checked")) {
            d3.select("#chessOpeningsYear").text("1921-2007");
        } else {
            let currentYear = d3.select(".slider").property("value");
            d3.select("#chessOpeningsYear").text(currentYear);
        }
    }

    // Attaches handlers for buttons: ECO, Games, White, Draw, and Black
    // Updates the headerData according to which button is pressed, then draws table
    attachSortHandlers() {
        let headers = d3.select("#openingsHeaders")
            .selectAll(".sortable")
            .data(this.headerData);
        let that = this;
        // e == event, d == thing you clicked
        headers.on("click", function (e, d) {
            let key = d.key;
            that.headerData.forEach(function (d) {
                if (d.key == key) {
                    d.sorted = true;
                    d.ascending = !d.ascending;
                } else {
                    d.sorted = false;
                }
            });
            that.updateHeaders();
            that.drawTable();
        });
    }

    // Attaches handlers for buttons: All years and Years on slider
    attachRadioButtonHandlers() {
        let allDataButton = d3.select("#radioAllData");
        let that = this;
        // e == event, d == thing you clicked
        allDataButton.on("click", function (e, d) {
            d3.select("#chessOpeningsYear").text("1921-2007");
            that.currentData = that.allYearsData;
            that.drawTable();
        });

        let sliderButton = d3.select("#radioSlider");
        sliderButton.on("click", function (e, d) {
            let currentYear = d3.select(".slider").property("value");
            that.updateYear(currentYear);
        });
    }

    // Removes any previous existing rows and draws the table
    drawTable() {
        d3.select("#openingsBody").selectAll("tr").remove();
        this.sortTable();
        let rowSelection = d3.select("#openingsBody").selectAll("tr").data(this.currentData).join("tr");
        let tdSelection = rowSelection.selectAll("td").data(d => [d, d, d]).join("td");
        let openingCol = tdSelection.filter((d, i) => i === 0);
        openingCol.text(d => d.eco).attr('class', 'eco');
        let gamesCol = tdSelection.filter((d, i) => i === 1);
        gamesCol.text(d => d.games);
        let resultCol = tdSelection.filter((d, i) => i === 2);
        let series = d3.stack().keys(["white", "draw", "black"])(this.currentData);
        let transpose = d3.transpose(series);
        let xScale = d3.scaleLinear().domain([0, 1]).range([0, 400]);
        let svgHeight = 80;
        let barHeight = 20;
        let svg = resultCol.append("svg").attr("width", 410).attr("height", svgHeight);
        let group = svg.append("g");
        let bars = group
            .selectAll("rect").data((d, i) => transpose[i]).join("rect");
        bars.attr("x", 5)
            .attr("y", (d, i) => 11 + i * (barHeight + 2))
            .attr("width", d => xScale((d[1] - d[0]) / d.data['games']))
            .attr("height", barHeight)
            .attr("fill", function (d, i) {
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
            .selectAll("text").data((d, i) => transpose[i]).join("text")
            .text(function (d) {
                let percent = Math.round(100 * (d[1] - d[0]) / d.data['games']);
                // text doesn't fit well when <= 6%, so only draw when > 6%.
                //if (percent > 6) {
                return `${percent}%`;
                //}
            })
            .attr("x", d => 15 + xScale((d[1] - d[0]) / d.data['games']))
            .attr("y", (d, i) => 26 + i * (barHeight + 2))
            .attr("fill", function (d, i) {
                if (i == 0) {
                    return "black";
                } else if (i == 1) {
                    return "black";
                } else {
                    return "black";
                }
            });

        let that = this;

        d3.select("#openingsBody")
            .select('div')
            .data([null])
            .enter()
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        const tooltip = d3.select(".tooltip");
        rowSelection.on("mouseenter", function (d, i) {
            //console.log(svg.selectAll('title'));
            //let tooltip = svg.selectAll("title").data(d => [d]).join("title")
            //    .text(function (d) {
            //        let y = "Opening: " + that.ecoToOpening.get(d.eco) + "\n" +
            //        "White:  " + d.white + "\n" +
            //            "Draw:   " + d.draw + "\n" +
            //            "Black:   " + d.black + "\n";
            //        return y;
            //    });
            let rect = d3.select(this).node().getBoundingClientRect();
            //let coords = d3.mouse(this);
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.97);
            tooltip.html(that.tooltipRender(i))
                .style('left', `${(window.pageXOffset + rect['x']) + 400}px`)
                .style('top', `${(window.pageYOffset + rect['y']) + 100}px`);

        });
        rowSelection.on('mouseleave', function (d, i) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    }

    tooltipRender(d) {
        return "<h3>" +"Opening: " + this.ecoToOpening.get(d.eco) + "<\h3>" +
            "<h4>" + "White:  " + d.white + "</h4>" +
            "<h4>" + "Draw:   " + d.draw + "</h4>" +
            "<h4>" + "Black:   " + d.black + "</h4>";
    }

    // Calculates the table data for the current year on run-time and updates this.currentData.
    // After this, draws the table
    updateYear(currentYear) {
        let showAllData = d3.select("#radioAllData").property("checked");
        if (!showAllData) {
            d3.select("#chessOpeningsYear").text(currentYear);
            d3.select("#openingsBody").selectAll("tr").remove();
            this.currentData = this.yearMap.get(currentYear)
            this.drawTable();
        }
    }

    // Updates data tied to #openingsHeaders to current this.headerData and
    // updates the up-arrow and down-arrow icons for buttons: ECO, Games, White, Draw, and Black
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


    // Sorts table according to header data
    // Sorting is only done one 'one-level' for white/draw/black, for example
    // if the user has chosen to sort based upon white, then
    // no additional level of sorting is done based upon draw/black.
    sortTable() {
        let hdr = null;
        for (let val of this.headerData) {
            if (val.sorted) {
                hdr = val;
            }
        }

        let key = hdr.key;
        if (hdr.ascending) {
            switch (key) {
                case ('thOpenings'):
                    this.currentData.sort(function (a, b) {
                        return d3.ascending(a.eco, b.eco);
                    });
                    break;
                case ('thGames'):
                    this.currentData.sort(function (a, b) {
                        return d3.ascending(a.games, b.games);
                    });
                    break;
                case ('thWhite'):
                    this.currentData.sort(function (a, b) {
                        return d3.ascending(a.white / a.games, b.white / b.games);
                    });
                    break;
                case ('thDraw'):
                    this.currentData.sort(function (a, b) {
                        return d3.ascending(a.draw / a.games, b.draw / b.games);
                    });
                    break;
                case ('thBlack'):
                    this.currentData.sort(function (a, b) {
                        return d3.ascending(a.black / a.games, b.black / b.games);
                    });
                    break;
            }
        } else {
            switch (key) {
                case ('thOpenings'):
                    this.currentData.sort(function (a, b) {
                        return d3.descending(a.eco, b.eco);
                    });
                    break;
                case ('thGames'):
                    this.currentData.sort(function (a, b) {
                        return d3.descending(a.games, b.games);
                    });
                    break;
                case ('thWhite'):
                    this.currentData.sort(function (a, b) {
                        return d3.descending(a.white / a.games, b.white / b.games);
                    });
                    break;
                case ('thDraw'):
                    this.currentData.sort(function (a, b) {
                        return d3.descending(a.draw / a.games, b.draw / b.games);
                    });
                    break;
                case ('thBlack'):
                    this.currentData.sort(function (a, b) {
                        return d3.descending(a.black / a.games, b.black / b.games);
                    });
                    break;
            }
        }
    }

}