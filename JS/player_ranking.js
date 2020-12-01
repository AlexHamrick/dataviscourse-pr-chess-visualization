class PlayerRanking {
    constructor(rankingData, careerData, updateOtherViews) {
        ////////////////
        this.topPlayerName = ""
        ////////////////
        this.updateOtherViews = updateOtherViews;
        this.rankingData = {};
        this.careerData = {};
        this.currentYear = 1952;
        for (let i = 0; i < rankingData.length; i++) {
            let date = rankingData[i]['date'];
            if (!(date in this.rankingData)) {
                this.rankingData[date] = [];
            }
            this.rankingData[date].push(rankingData[i])
        }

        for (let i = 0; i < careerData.length; i++) {
            let name = careerData[i]['name'];
            if (!(name in this.careerData)) {
                this.careerData[name] = [];
            }
            this.careerData[name].push(careerData[i])
        }
        this.PLAYER_COUNT = 3;
        this.playerColors = [ "red", "blue", "green", "cyan", "purple", "orange","lime", "pink", "brown", "maroon"];
        // console.log('rankingData', this.rankingData);
        // console.log('careerData', this.careerData);
        this.minYear = rankingData[0]['date'];
        this.maxYear = rankingData[rankingData.length-1]['date'];
        let elos = careerData.map(d => d.elo)
        // console.log('elos', elos)
        this.maxElo = d3.max(elos);
        //this.minElo = d3.min(elos);
        this.minElo = 2000;
        this.margin = { top: 10, right: 30, bottom: 45, left: 75 };
        this.vizWidth = 1080-this.margin.left-this.margin.right;
        this.vizHeight = 400-this.margin.top-this.margin.bottom;
        this.legendWidth = 370;
        this.dates = [...new Set(rankingData.map(d => d.date))]
        // console.log('dates', this.dates);
        this.scaleElo = d3.scaleLinear()
            .domain([this.minElo, this.maxElo])
            .range([this.vizHeight, 0]);
        this.scaleDates = d3.scaleLinear()
            .domain([this.dates[0], this.dates[this.dates.length - 1]])
            .range([0, this.vizWidth-this.legendWidth]);
        this.drawPlot();
        this.updateTopPlayerLines(1952);
        // console.log(this.rankingData[1952][0]['elo']);
        // console.log(this.minElo, this.maxElo);
    }

    drawPlot() {
        let that = this;
        let svg = d3.select('#best-players');
        svg.attr('height', this.vizHeight+this.margin.top+this.margin.bottom);
        svg.attr('width', this.vizWidth+this.margin.left+this.margin.right);
        let plot = svg.append('g')
            .attr('id', 'rankPlot')
            .attr('transform', 'translate('+this.margin.left+','+this.margin.top+')')
        plot.append("g")
            .call(d3.axisLeft(that.scaleElo));
        let parseYear = d3.timeParse("%Y")
        plot.append("g").attr('transform', 'translate(0, ' + that.vizHeight + ')')
            .call(d3.axisBottom(that.scaleDates)
            .tickFormat(d3.format("d")));

        //plot.attr('transform', 'scale(1, 1)');
        //plot.selectAll('circle')
        //    .data(this.dates)
        //    .join('circle')
        //    .attr('r', 2)
        //    .attr('cx', d => that.scaleDates(d))
        //    .attr('cy', d => that.scaleElo(that.rankingData[d][0]['elo']));
        plot.append("path")
            .datum(this.dates)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return that.scaleDates(d) })
                .y(function (d) { return that.scaleElo(that.rankingData[d][0]['elo']) })
            )
        plot.append("text")
            .attr("transform",
                "translate(" + ((this.vizWidth-this.legendWidth) / 2) + " ," +
                (this.vizHeight + this.margin.top + 35) + ")")
            .style("text-anchor", "middle")
            .text("Date")
            .attr('class', 'axisLabel');

        plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15 - this.margin.left)
            .attr("x", 0 - (this.vizHeight / 2))
            //.attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Elo")
            .attr('class', 'axisLabel');

        //*@@@@@@ The below code section is based off of HW4 @@@@@@//
        let yearScale = d3.scaleLinear().domain([this.minYear, this.maxYear]).range([25, 600]);

        let yearSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', this.minYear)
            .attr('max', this.maxYear)
            .attr('value', this.minYear);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.minYear);

        sliderText.attr('x', yearScale(this.minYear));
        sliderText.attr('y', 25);
        sliderText.attr("fill", "darkblue");
        sliderText.attr("font-size","22px");

        yearSlider.on('input', function () {
            let currentYear = yearSlider.property("value");
            sliderText.attr("x", yearScale(currentYear))
            sliderText.text(currentYear);
            that.updateTopPlayerLines(currentYear);
            that.updateOtherViews(currentYear, that.topPlayerName);
        });
        
        //*@@@@@@ The above code section is based off of HW4 @@@@@@//
        let legend = d3.select("#legend");
        legend.attr("transform", "translate(30,0)");
        let numSelect = d3.select("#playernum").property("value", that.PLAYER_COUNT);
        numSelect.on("change", function () {
            that.PLAYER_COUNT = this.value;
            that.updateTopPlayerLines(that.currentYear);
        });
    }

    updateTopPlayerLines(currentYear) {
        this.currentYear = currentYear;
        d3.select("#rankPlot").selectAll(".topPaths").remove();
        let plot = d3.select("#rankPlot");
        let that = this;
        let currYearTopPlayers = that.rankingData[currentYear];
        let i = 1;
        while (!currYearTopPlayers) {
            currYearTopPlayers = that.rankingData[currentYear - i];
            i += 1;
        }
        if (currYearTopPlayers) {
            for (let i = 0; i < that.PLAYER_COUNT; i++) {
                let first = currYearTopPlayers[i];
                let firstCareer = that.careerData[first.name];
                plot.append("path")
                    .classed("topPaths", true)
                    .datum(firstCareer)
                    .attr("fill", "none")
                    .attr("stroke", that.playerColors[i])
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(function (d) { return that.scaleDates(d.date) })
                        .y(function (d) {
                            let e = d.elo;
                            if (e < that.minElo)
                                e = that.minElo;
                            return that.scaleElo(e);
                        })
                );
                plot.append('circle')
                    .classed("topPaths", true)
                    .datum(first)
                    .attr("cx", d => that.scaleDates(currentYear))
                    .attr("cy", d => that.scaleElo(d.elo))
                    .attr('r', 3)
                    .attr('fill', that.playerColors[i]);
                plot.append("text")
                    .text((i+1) + '. ' + first.name + '; Elo: ' + first.elo)
                    .attr('class', 'topPaths')
                    .attr("stroke", that.playerColors[i])
                    .attr("font-size", "22px")
                    .attr('transform', 'translate('+(that.vizWidth-that.legendWidth+20)+','+ (70+i*25) +' )');

                /////////////////////
                if(i == 0) {
                    this.topPlayerName = first.name
                }
                /////////////////////
            }
        }
        plot.append("text")
            .text(currentYear)
            .attr('class', 'topPaths')
            .attr("font-size", "28px")
            .attr("font-weight", "777")
            .attr('transform', 'translate(' + (that.vizWidth - that.legendWidth + 60) + ',' + (30) + ' )');
    }
}