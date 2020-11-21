// KERNAL RESOURCES FOR LATER
// https://en.wikipedia.org/wiki/Kernel_(statistics)
// https://observablehq.com/@d3/kernel-density-estimation  

class GiniImpurity {
    constructor(data) {
        this.data = data

        // Set up dimensions and margins
        this.margins = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }

        this.dimensions = {
            width: 600,
            height: 350
        }

        // Set up scales
        let minXRange = 0.5
        let maxXRange = 1
        this.xAxisScale = d3.scaleLinear()
            .domain([minXRange, maxXRange])
            .range([0, this.dimensions.width])

        let minYRange = 15
        let maxYRange = 0
        this.yAxisScale = d3.scaleLinear()
            .domain([minYRange, maxYRange])
            .range([0, this.dimensions.height])

        this.setUp()
    }

    setUp() {
        // Get svg
        let svg = d3.select("#gini")
            .select("svg")

        // Set svg size
        svg.attr("width", this.margins.left + this.dimensions.width + this.margins.right)
            .attr("height", this.margins.top + this.dimensions.height + this.margins.bottom)

        // Create a group to put plot in
        let giniPlot = svg.append("g")
            .attr("class", "gini-plot")
            .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

        // Create x-axis
        this.setUpAxes(giniPlot)
        


        ///////////////////
        function kde(kernel, thresholds, data) {
            return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
          }

          function epanechnikov(bandwidth) {
            return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
          }

        let bandwidth = 0.001

        let line = d3.line()
            .curve(d3.curveBasis)
            .x(d => this.xAxisScale(d[0]))
            .y(d => this.yAxisScale(d[1]))

    let thresholds = this.xAxisScale.ticks(40)

    let giniScores = this.data.map(d => d["GiniImpurity"])

    let density = kde(epanechnikov(bandwidth), thresholds, giniScores)

    console.log(density)

    svg.append("path")
        .datum(density)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("d", line);

  }      

    setUpAxes(giniPlot) {
        // Create x-axis
        giniPlot.append("g")
            .attr("class", "gini-x-axis")
            .attr("transform", "translate(0," + this.dimensions.height + ")")
            .call(d3.axisBottom(this.xAxisScale))

        // Create y-axis
        giniPlot.append("g")
            .attr("class", "gini-y-axis")
            .call(d3.axisLeft(this.yAxisScale))
    }
}