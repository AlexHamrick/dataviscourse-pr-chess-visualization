class GiniImpurity {
    constructor(data) {
        // Set up dimensions and margins
        this.margins = {
            top: 20,
            right: 10,
            bottom: 30,
            left: 40
        }

        this.dimensions = {
            width: 600,
            height: 350
        }

        // Set up x scale
        let minXRange = d3.min(data, d => d["GiniImpurity"])
        let maxXRange = 1
        this.xAxisScale = d3.scaleLinear()
            .domain([minXRange, maxXRange])
            .range([0 + this.margins.left, this.dimensions.width - this.margins.right])

        // Set up data
        this.data = data

        let numberOfBins = 30

        let histogram = d3.histogram()
            .value(d => d["GiniImpurity"])
            .domain(this.xAxisScale.domain())
            .thresholds(this.xAxisScale.ticks(numberOfBins))

        this.bins = histogram(this.data)

        // Set up y scale
        this.histYAxisScale = d3.scaleLinear()
            .range([this.dimensions.height, 0])
            .domain([0, d3.max(this.bins, d => d["length"])])

        // Do iniital drawing
        this.setup()        
        this.drawHistogram("")
        this.drawDensity()        
    }

    drawHistogram(selectedName) {
        let selectedIdx = this.getSelectedBinIdx(selectedName)

        for(let idx = 0; idx < this.bins.length; ++idx) {
            if(idx == selectedIdx) {
                this.bins[idx]['selectedName'] = true
            } else {
                this.bins[idx]['selectedName'] = false
            }
        }

        // Get svg group for gini plot
        let giniPlotHistogram = d3.select("#gini-plot-histogram")

        // Draw histogram
        let histBars = giniPlotHistogram.selectAll("rect")
            .data(this.bins)

        histBars.join("rect")
            .attr("x", 0)
            .attr("transform", d => "translate(" + this.xAxisScale(d["x0"]) + "," + this.histYAxisScale(d["length"]) + ")")
            .attr("width", d => this.xAxisScale(d["x1"]) - this.xAxisScale(d["x0"]))
            .attr("height", d => this.dimensions.height - this.histYAxisScale(d["length"]))
            .attr("class", (d, i) => i == selectedIdx ? "selected-bin" : "")
    }

    getSelectedBinIdx(selectedName) {
        let foundName = false
        let idx = 0

        for (let bin of this.bins) {
            for (let binItem of bin) {
                if (binItem["WhiteName"] === selectedName) {
                    foundName = true
                    break
                }
            }

            if(foundName) {
                break
            }

            ++idx
        }

        return foundName ? idx : -1
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

        // Get svg group for gini density plot
        let giniPlotDensity = d3.select("#gini-plot-density")
        giniPlotDensity.append("path")
            .datum(density)
            .attr("class", "density-line")
            .attr("d", line);
    }

    setup() {
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

        this.setupAxes()
    }

    setupAxes() {
        // Get svg group for gini plot
        let giniPlotHistogram = d3.select("#gini-plot-histogram")

        // Create x-axis
        // The below scale is used only to create an easy to understand axis
        let mixedOptions = ["Less Mixed", "More Mixed"]
        let mixednessScale = d3.scalePoint()
            .domain(mixedOptions)
            .range([0 + this.margins.left, this.dimensions.width - this.margins.right])

        let xAxis = giniPlotHistogram.append("g")
            .attr("id", "gini-x-axis")
            .attr("transform", "translate(0," + this.dimensions.height + ")")
        xAxis.call(d3.axisBottom(mixednessScale))

        xAxis
            .data(mixedOptions)
            .selectAll("text")
            .attr("class", d => "axisLabel axis" + (d == mixedOptions[0] ? "Start" : "End"))

        // Create y-axis
        giniPlotHistogram.append("g")
            .attr("id", "gini-y-axis")
            .attr("transform", "translate(" + this.margins.left + ", 0)")
            .call(d3.axisLeft(this.histYAxisScale))

        giniPlotHistogram.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -10)
            .attr("x", -(this.dimensions.height / 2))
            .text("Player Tally")
            .attr('class', 'axisLabel axisMiddle')
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