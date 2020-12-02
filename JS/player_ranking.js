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
        this.margin = { top: 10, right: 30, bottom: 55, left: 85 };
        this.legendWidth = 370;
        this.vizWidth = 1280 - this.margin.left - this.margin.right - this.legendWidth;
        this.vizHeight = 480-this.margin.top-this.margin.bottom;
        
        this.dates = [...new Set(rankingData.map(d => d.date))]
        // console.log('dates', this.dates);
        this.scaleElo = d3.scaleLinear()
            .domain([this.minElo, this.maxElo])
            .range([this.vizHeight, 0]);
        this.scaleDates = d3.scaleLinear()
            .domain([this.dates[0], this.dates[this.dates.length - 1]])
            .range([0, this.vizWidth]);
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
            .attr('class', 'axis')
            .call(d3.axisLeft(that.scaleElo));
        let parseYear = d3.timeParse("%Y")
        plot.append("g")
            .attr('class', 'axis')
            .attr('transform', 'translate(0, ' + that.vizHeight + ')')
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
                "translate(" + ((this.vizWidth) / 2) + " ," +
                (this.vizHeight + this.margin.top + 35) + ")")
            .style("text-anchor", "middle")
            .text("Date")
            .attr('class', 'axisLabel');

        plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25 - this.margin.left)
            .attr("x", 0 - (this.vizHeight / 2))
            //.attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Elo")
            .attr('class', 'axisLabel');

        //*@@@@@@ The below code section is based off of HW4 @@@@@@//
        let yearScale = d3.scaleLinear().domain([this.minYear, this.maxYear]).range([25, 820]);

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
            that.updateOtherViews(currentYear, that.topPlayerName, "red");
        });
        
        //*@@@@@@ The above code section is based off of HW4 @@@@@@//
        let legend = d3.select("#legend");
        legend.attr("transform", "translate(30,0)");
        let numSelect = d3.select("#playernum").property("value", that.PLAYER_COUNT);
        numSelect.on("change", function () {
            that.PLAYER_COUNT = this.value;
            that.updateTopPlayerLines(that.currentYear);
        });

        that.updateOtherViews(this.currentYear, "Smyslov, Vassily", "red");
    }

    updateTopPlayerLines(currentYear) {
        this.currentYear = currentYear;
        d3.select("#bestPlayersDiv").selectAll(".topPaths").remove();
        let plot = d3.select("#rankPlot");
        let legend = d3.select('#legendDiv');
        let that = this;
        let currYearTopPlayers = that.rankingData[currentYear];
        let i = 1;
        while (!currYearTopPlayers) {
            currYearTopPlayers = that.rankingData[currentYear - i];
            i += 1;
        }
        legend.append("h1")
            .attr('class', 'topPaths')
            .append('text')
            .text(currentYear)
            .attr("font-size", "28px")
            .attr("font-weight", "777")
            .attr('transform', 'translate(' + (120) + ',' + (30) + ' )');
        if (currYearTopPlayers) {
            for (let i = 0; i < that.PLAYER_COUNT; i++) {
                let first = currYearTopPlayers[i];
                let firstCareer = that.careerData[first.name];
                plot.append("path")
                    .classed("topPaths", true)
                    //.classed('selectedPath', () => i==0 ? true : false)
                    .datum(firstCareer)
                    .attr("fill", "none")
                    .attr("stroke", that.playerColors[i])
                    .attr("stroke-width", 2)
                    .attr("d", d3.line()
                        .x(function (d) { return that.scaleDates(d.date) })
                        .y(function (d) {
                            let e = d.elo;
                            if (e < that.minElo)
                                e = that.minElo;
                            return that.scaleElo(e);
                        }));
                    //.on('mouseover', function (d, i) {
                    //        d3.select(this).classed('selectedPath', true);
                    //})
                    //.on('mouseleave', function (d, i) {
                    //    d3.select(this).classed('selectedPath', false);
                    //});
                plot.append('circle')
                    .classed("topPaths", true)
                    .datum(first)
                    .attr("cx", d => that.scaleDates(currentYear))
                    .attr("cy", d => that.scaleElo(d.elo))
                    .attr('r', 5)
                    .attr('fill', that.playerColors[i]);
                let b = legend.append('button')
                    .attr('class', 'topPaths')
                    .attr('id', 'button'+i)
                    .style('color', that.playerColors[i])
                    .attr("stroke", that.playerColors[i])
                    .style("font-size", "22px")
                    .text((i + 1) + '. ' + first.name + '; Elo: ' + first.elo)
                    .on('click', () => that.updateOtherViews(that.currentYear, first.name, that.playerColors[i]));
                /////////////////////
                if(i == 0) {
                    this.topPlayerName = first.name
                }
                /////////////////////
            }
        }
        document.getElementById("button0").focus();
    }
}