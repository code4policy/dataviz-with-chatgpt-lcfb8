const margin = { top: 20, right: 30, bottom: 60, left: 220 };
const width = 900 - margin.left - margin.right;
const height = 520 - margin.top - margin.bottom;

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([0, height]).padding(0.2);

const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.format(","));
const yAxis = d3.axisLeft(y);

const grid = d3
  .axisBottom(x)
  .ticks(5)
  .tickSize(-height)
  .tickFormat("");

const format = d3.format(",");

d3.csv("boston_311_2025_by_reason.csv", (d) => ({
  reason: d.reason,
  count: +d.Count,
}))
  .then((data) => {
    const top10 = data
      .sort((a, b) => d3.descending(a.count, b.count))
      .slice(0, 10);

    x.domain([0, d3.max(top10, (d) => d.count) || 0]);
    y.domain(top10.map((d) => d.reason));

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(grid)
      .selectAll(".domain")
      .remove();

    svg
      .append("g")
      .attr("class", "axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "12px");

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .text("count of 311 calls in 2025");

    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("reason for 311 call (categories)");

    svg
      .selectAll(".bar")
      .data(top10)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.reason))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => x(d.count))
      .append("title")
      .text((d) => `${d.reason}: ${format(d.count)}`);
  })
  .catch((error) => {
    console.error("Error loading CSV:", error);
    d3.select("#chart")
      .append("p")
      .style("color", "#b91c1c")
      .text("Could not load data. Check that boston_311_2025_by_reason.csv is in the same folder.");
  });
