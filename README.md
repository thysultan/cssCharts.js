# cssCharts.js
jquery plugin to create donut and bar charts with css,

[preview here](http://thysultan.com/projects/cssCharts/)

include:

```html
<link rel="stylesheet" href="chart.css">
<script src="jquery.chart.js"></script>
```

run:

```javascript

$('.bar-chart').cssCharts({type:"bar"});
$('.donut-chart').cssCharts({type:"donut"});
$('.line-chart').cssCharts({type:"line"}); 

```

optional: to trigger countUp counter for the donut chart as seen on the preview page.

```javascript
$('.donut-chart').cssCharts({type:"donut"}).trigger('show-donut-chart');
```

that's it, style to your hearts content. For the rest see index.html for an example implementation.
