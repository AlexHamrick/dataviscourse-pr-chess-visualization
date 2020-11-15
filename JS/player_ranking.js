class PlayerRanking {
    constructor(rankingData, careerData) {
        this.playersPerYear = 10;
        this.rankingData = {};
        this.careerData = {};
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
        this.minYear = rankingData[0]['date'];
        this.maxYear = rankingData[rankingData.length-1]['date'];
        let elos = careerData.map(d => d.elo)
        console.log(elos)
        this.maxElo = d3.max(elos);
        this.minElo = d3.min(elos);
        this.margin = { top: 10, right: 30, bottom: 45, left: 75 };
        this.vizWidth = 700-this.margin.left-this.margin.right;
        this.vizHeight = 400-this.margin.top-this.margin.bottom;
        this.dates = [...new Set(rankingData.map(d => d.date))]
        this.scaleElo = d3.scaleLinear()
            .domain([this.minElo, this.maxElo])
            .range([this.vizHeight, 0]);
        this.scaleDates = d3.scaleLinear()
            .domain([this.dates[0], this.dates[this.dates.length - 1]])
            .range([0, this.vizWidth]);
        this.drawPlot();
        console.log(this.rankingData[1952][0]['elo']);
        console.log(this.minElo, this.maxElo);
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
                "translate(" + (this.vizWidth / 2) + " ," +
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
    }
}