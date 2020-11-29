// KERNAL RESOURCES FOR LATER


class GiniImpurity {
    constructor(data) {
        // Set up dimensions and margins
        this.margins = {
            top: 20,
            right: 10,
            bottom: 20,
            left: 30
        }

        this.dimensions = {
            width: 600,
            height: 350
        }

        // Set up x scale
        let minXRange = 0.5
        let maxXRange = 1
        this.xAxisScale = d3.scaleLinear()
            .domain([minXRange, maxXRange])
            .range([0, this.dimensions.width])

        // Set up data
        this.data = data

        let numberOfBins = 20

        let histogram = d3.histogram()
            .value(d => d["GiniImpurity"])
            .domain(this.xAxisScale.domain())
            .thresholds(this.xAxisScale.ticks(numberOfBins))

        this.bins = histogram(this.data)

        // Adds the field selectedName to bins and sets it to false
        this.setSelectedBin("")

        // Do iniital drawing
        this.setUp()
        this.drawHistogram()
        this.drawDensity()
    }

    drawHistogram() {
        // TODO: Get rid of this selected bin proof of concept
        let selectedName = "Donchenko, Anatoly G"
        this.setSelectedBin(selectedName)

        // Set up y axis
        let histYAxisScale = d3.scaleLinear()
            .range([this.dimensions.height, 0])
            .domain([0, d3.max(this.bins, d => d["length"])])

        // Get svg group for gini plot
        let giniPlotHistogram = d3.select("#gini-plot-histogram")

        // Create x-axis
        // The below scale is used only to create an easy to understand axis
        let mixednessScale = d3.scalePoint()
            .domain(["Less Mixed", "More Mixed"])
            .range([0, this.dimensions.width]);

        giniPlotHistogram.append("g")
            .attr("class", "gini-x-axis")
            .attr("transform", "translate(0," + this.dimensions.height + ")")
            .call(d3.axisBottom(mixednessScale))

        // Create y-axis
        giniPlotHistogram.append("g")
            .attr("class", "gini-y-axis")
            .call(d3.axisLeft(histYAxisScale))

        // TODO: Remove style and use only class
        // Draw histogram
        giniPlotHistogram.selectAll("rect")
            .data(this.bins)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("transform", d => "translate(" + this.xAxisScale(d["x0"]) + "," + histYAxisScale(d["length"]) + ")")
            .attr("width", d => this.xAxisScale(d["x1"]) - this.xAxisScale(d["x0"]))
            .attr("height", d => this.dimensions.height - histYAxisScale(d["length"]))
            .attr("class", d => d["selectedBin"] ? "selected-bin" : "")
            .style("fill", d => d["selectedBin"] ? "red" : "gray")
    }

    setSelectedBin(selectedName) {
        let foundName = false

        for (let bin of this.bins) {
            for (let binItem of bin) {
                if (binItem["WhiteName"] === selectedName) {
                    foundName = true
                    break
                }
            }

            if (foundName) {
                bin["selectedBin"] = true
                break
            } else {
                bin["selectedBin"] = false
            }
        }
    }

    drawDensity() {
        // Get density data for line
        let bandwidth = 0.05
        let ticks = 50

        let thresholds = this.xAxisScale.ticks(ticks)
        let giniScores = this.data.map(d => d["GiniImpurity"])
        let density = this.kde(this.epanechnikov(bandwidth), thresholds, giniScores)

        // Get a y-axis for density
        let densityYAxisScale = d3.scaleLinear()
            .domain([0, d3.max(density, d => d[1])])
            .range([this.dimensions.height, 0])

        // Get line
        let line = d3.line()
            .curve(d3.curveBasis)
            .x(d => this.xAxisScale(d[0]))
            .y(d => densityYAxisScale(d[1]))

        // TODO: Use classes
        // Get svg group for gini density plot
        let giniPlotDensity = d3.select("#gini-plot-density")
        giniPlotDensity.append("path")
            .datum(density)
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("d", line);
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
            .attr("id", "gini-plot")
            .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")")

        // Create a group for histogram
        giniPlot.append("g")
            .attr("id", "gini-plot-histogram")

        // Create a group for density
        giniPlot.append("g")
            .attr("id", "gini-plot-density")
    }

    // https://en.wikipedia.org/wiki/Kernel_(statistics)
    // https://observablehq.com/@d3/kernel-density-estimation  
    kde(kernel, thresholds, data) {
        return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
    }

    // https://en.wikipedia.org/wiki/Kernel_(statistics)
    // https://observablehq.com/@d3/kernel-density-estimation  
    epanechnikov(bandwidth) {
        return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
    }
}