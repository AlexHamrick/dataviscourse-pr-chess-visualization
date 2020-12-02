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
        this.margin = { top: 10, right: 30, bottom: 65, left: 75 };
        this.vizWidth = 700 - this.margin.left - this.margin.right;
        this.vizHeight = 420 - this.margin.top - this.margin.bottom;


        this.drawPlot("Smyslov, Vassily", "red");
    }

    drawPlot(name, color) {
        let that = this;
        d3.select('#openingName').text(name).style('color', color);
        let data = this.openingsData[name];
        let scaleY = d3.scaleLinear()
            .domain([0, data[0].pct])
            .range([this.vizHeight, 0]);
        let scaleX = d3.scaleLinear()
            .domain([-1, data.length])
            .range([0, this.vizWidth]);
        d3.select('#openingsSVG').remove(); //Is this a problem at the start?
        let svg = d3.select('#bestPlayerOpenings').append('svg').attr('id', 'openingsSVG');
        svg.attr('height', this.vizHeight + this.margin.top + this.margin.bottom);
        svg.attr('width', this.vizWidth + this.margin.left + this.margin.right);
        let plot = svg.append('g')
            .attr('id', 'openingsChart')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        plot.append("g")
            .call(d3.axisLeft(scaleY));
        //let parseYear = d3.timeParse("%Y")
        //plot.append("g").attr('transform', 'translate(0, ' + that.vizHeight + ')')
        //    .call(d3.axisBottom(that.scaleDates)
        //        .tickFormat(d3.format("d")));

        plot.selectAll('axisLabel opening')
            .data(data)
            .join('text')
            .text(d => d.eco)
            .attr("transform",(d, i)=>
                "translate(" + scaleX(i) + " ," +
                (this.vizHeight + this.margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .attr('class', 'axisLabel opening');
        plot.append("text")
            .attr("transform",
                "translate(" + ((this.vizWidth) / 2) + " ," +
                (this.vizHeight + this.margin.top + 45) + ")")
            .style("text-anchor", "middle")
            .text("Openings")
            .attr('class', 'axisLabel');
        plot.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15 - this.margin.left)
            .attr("x", 0 - (this.vizHeight / 2))
            //.attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency")
            .attr('class', 'axisLabel');
        let w = 30;
        plot.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', (d, i) => scaleX(i)-w/2)
            .attr('y', d=>scaleY(d.pct))
            .attr('height', d=>scaleY(0)-scaleY(d.pct))
            .attr('width', w)
            .attr('fill', color);
	}
}