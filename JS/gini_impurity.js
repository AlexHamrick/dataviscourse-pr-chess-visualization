// KERNAL RESOURCES FOR LATER
// https://en.wikipedia.org/wiki/Kernel_(statistics)
// https://observablehq.com/@d3/kernel-density-estimation  

class GiniImpurity {
    constructor(data) {
        this.data = data

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
  }      

    setUpAxes(giniPlot) {
        let minXRange = 0.5
        let maxXRange = 1

        let xAxisScale = d3.scaleLinear()
            .domain([minXRange, maxXRange])
            .range([0, this.dimensions.width])


        giniPlot.append("g")
            .attr("class", "gini-x-axis")
            .attr("transform", "translate(0," + this.dimensions.height + ")")
            .call(d3.axisBottom(xAxisScale))

        // Create y-axis
        let minYRange = 15
        let maxYRange = 0

        let yAxisScale = d3.scaleLinear()
            .domain([minYRange, maxYRange])
            .range([0, this.dimensions.height])


        giniPlot.append("g")
            .attr("class", "gini-y-axis")
            .call(d3.axisLeft(yAxisScale))
    }
}