const margin = { top: 20, right: 30, bottom: 60, left: 220 };
const width = 900 - margin.left - margin.right;
const baseHeight = 520 - margin.top - margin.bottom;
const rowHeight = 26;

const chart = d3.select("#chart");
const toggleButton = d3.select("#toggle-chart");

const tooltip = chart
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const svgRoot = chart.append("svg");
const svg = svgRoot.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().padding(0.2);

const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format(","));
const yAxis = d3.axisLeft(y);

const format = d3.format(",");

const gridGroup = svg.append("g").attr("class", "grid");
const yAxisGroup = svg.append("g").attr("class", "axis");
const xAxisGroup = svg.append("g").attr("class", "axis");
const xLabel = svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle");
const yLabel = svg
  .append("text")
  .attr("class", "axis-label")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)");

d3.csv("boston_311_2025_by_reason.csv", (d) => ({
  reason: d.reason,
  count: +d.Count,
}))
  .then((data) => {
    const allData = data.sort((a, b) => d3.descending(a.count, b.count));
    const top10 = allData.slice(0, 10);
    let showAll = false;

    const render = (rows) => {
      const height = Math.max(baseHeight, rows.length * rowHeight);
      const grid = d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(-height)
        .tickFormat("");

      svgRoot.attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
      );

      x.domain([0, d3.max(rows, (d) => d.count) || 0]);
      y.range([0, height]).domain(rows.map((d) => d.reason));

      gridGroup
        .attr("transform", `translate(0,${height})`)
        .call(grid)
        .selectAll(".domain")
        .remove();

      yAxisGroup.call(yAxis).selectAll("text").style("font-size", "12px");

      xAxisGroup.attr("transform", `translate(0,${height})`).call(xAxis);

      xLabel.attr("x", width / 2).attr("y", height + 45).text("Count of 311 calls in 2025");

      yLabel
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Reason for 311 call (categories)");

      const bars = svg.selectAll(".bar").data(rows, (d) => d.reason);

      bars
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("class", "bar")
              .attr("x", 0)
              .attr("y", (d) => y(d.reason))
              .attr("height", y.bandwidth())
              .attr("width", (d) => x(d.count)),
          (update) =>
            update
              .attr("y", (d) => y(d.reason))
              .attr("height", y.bandwidth())
              .attr("width", (d) => x(d.count)),
          (exit) => exit.remove()
        )
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1).text(`${d.reason}: ${format(d.count)}`);
        })
        .on("mousemove", (event) => {
          const [xPos, yPos] = d3.pointer(event, chart.node());
          tooltip.style("left", `${xPos + 12}px`).style("top", `${yPos - 12}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    };

    render(top10);

    toggleButton.on("click", () => {
      showAll = !showAll;
      render(showAll ? allData : top10);
      toggleButton.text(showAll ? "Show top 10 reasons" : "Show all reasons");
    });
  })
  .catch((error) => {
    console.error("Error loading CSV:", error);
    d3.select("#chart")
      .append("p")
      .style("color", "#b91c1c")
      .text("Could not load data. Check that boston_311_2025_by_reason.csv is in the same folder.");
  });
