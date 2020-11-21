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
        this.densityYAxisScale = d3.scaleLinear()
            .domain([minYRange, maxYRange])
            .range([0, this.dimensions.height])

        // let minYRange = 1200
        // let maxYRange = 0
        // this.densityYAxisScale = d3.scaleLinear()
        //     .domain([minYRange, maxYRange])
        //     .range([0, this.dimensions.height])


        this.setUp()

        this.drawHistogram()
    }

    drawHistogram() {
        let histogram = d3.histogram()
            .value(d => d["GiniImpurity"])
            .domain(this.xAxisScale.domain())
            .thresholds(this.xAxisScale.ticks(10))

        let bins = histogram(this.data)

        let foundName = false
        let selectedName = "Blauert, Joerg"


        for(let bin of bins) {
            for(let binItem of bin) {
                if (binItem["WhiteName"] === selectedName) {
                    foundName = true
                    break
                }
            }

            if(foundName) {
                bin["selectedBin"] = true
                break
            } else {
                bin["selectedBin"] = false
            }
        }

        console.log(bins)
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

        // this.drawHistogram()
        


    //     ///////////////////
    //     // set the parameters for the histogram
    //     var histogram = d3.histogram()
    //         .value(function(d) { return d['GiniImpurity']; })   // I need to give the vector of value
    //         .domain(this.xAxisScale.domain())  // then the domain of the graphic
    //         .thresholds(this.xAxisScale.ticks(10)); // then the numbers of bins

    //       // And apply this function to data to get the bins
    //     var bins = histogram(this.data);

    // //     let thresholds = this.xAxisScale.ticks(10)

    // //     let bins = d3.bin()
    // //         .thresholds(thresholds)
    // //         (this.data)

    //     console.log(bins)

    //       // append the bar rectangles to the svg element
    // svg.selectAll("rect")
    // .data(bins)
    // .enter()
    // .append("rect")
    //     .attr("x", 0)
    //     .attr("transform", d => "translate(" + this.xAxisScale(d["x0"]) + "," + this.densityYAxisScale(d["length"]) + ")" )
    //     .attr("width", d => this.xAxisScale(d.x1) - this.xAxisScale(d.x0) -1 )
    //     .attr("height", d => this.dimensions.height - this.densityYAxisScale(d.length))
    //     .style("fill", "#69b3a2")

    //     svg.append("g")
    //     .attr("fill", "#bbb")
    //   .selectAll("rect")
    //   .data(bins)
    //   .join("rect")
    //     .attr("x", d => this.xAxisScale(d.x0) ? 0 : this.xAxisScale(d.x0) + 1)
    //     .attr("y", d => this.yAxisScale(d.length / this.data.length))
    //     .attr("width", d => this.xAxisScale(d.x0) ? 0 : this.xAxisScale(d.x1) - this.xAxisScale(d.x0) - 1)
    //     .attr("height", d => this.yAxisScale(0) - this.yAxisScale(d.length / this.data.length));

        // svg.selectAll("rect")
        //     .data(bins)
        //     .enter()
        //     .append("rect")
        //     .attr("transform", function(d) { return "translate(" + this.xAxisScale(d.x0) + "," + this.yAxisScale(d.length) + ")"; })
        //     .attr("width", function(d) { return this.xAxisScale(d.x1) - this.xAxisScale(d.x0) -1 ; })
        //     .attr("height", function(d) { return height - this.yAxisScale(d.length); })
        //     .style("fill", "#69b3a2")


        //////////////////////////

    //     function kde(kernel, thresholds, data) {
    //         return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
    //       }

    //       function epanechnikov(bandwidth) {
    //         return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
    //       }

    //     let bandwidth = 0.05

    //     let line = d3.line()
    //         .curve(d3.curveBasis)
    //         .x(d => this.xAxisScale(d[0]))
    //         .y(d => this.yAxisScale(d[1]))

    // let thresholds = this.xAxisScale.ticks(40)

    // let giniScores = this.data.map(d => d["GiniImpurity"])

    // let density = kde(epanechnikov(bandwidth), thresholds, giniScores)

    // console.log(density)

    // svg.append("path")
    //     .datum(density)
    //     .attr("fill", "none")
    //     .attr("stroke", "#000")
    //     .attr("stroke-width", 1.5)
    //     .attr("stroke-linejoin", "round")
    //     .attr("d", line);

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
            .call(d3.axisLeft(this.densityYAxisScale))
    }
}