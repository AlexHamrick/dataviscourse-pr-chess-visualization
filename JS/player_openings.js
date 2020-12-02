class PlayerOpening {
    constructor(playerOpeningsData) {
        this.openingsData = {};
        for (let i = 0; i < playerOpeningsData.length; i++) {
            let name = playerOpeningsData[i]['name'];
            if (!(name in this.openingsData)) {
                this.openingsData[name] = [];
            }
            this.openingsData[name].push(playerOpeningsData[i])
        }
        this.drawPlot("Kasparov, Garry");
    }

    drawPlot(name) {
        let that = this;
        let svg = d3.select('#best-players');
        svg.attr('height', this.vizHeight + this.margin.top + this.margin.bottom);
        svg.attr('width', this.vizWidth + this.margin.left + this.margin.right);
        let plot = svg.append('g')
            .attr('id', 'rankPlot')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        plot.append("g")
            .call(d3.axisLeft(that.scaleElo));
        let parseYear = d3.timeParse("%Y")
        plot.append("g").attr('transform', 'translate(0, ' + that.vizHeight + ')')
            .call(d3.axisBottom(that.scaleDates)
                .tickFormat(d3.format("d")));
	}
}