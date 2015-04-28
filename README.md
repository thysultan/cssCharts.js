# cssCharts.js
jquery plugin to create simple donut, bar or line charts with dom nodes. style with css.

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

example line chart

```html
<ul data-cord="[x1,x2,x3,x4],[y1,y2,y3,y4]" class="line-chart"></ul>
$('.line-chart').cssCharts({type:"line"});
```

example bar chart

```html
<ul class="bar-chart" data-bars="[x1,x2],[y1,y2]" data-max="10" data-unit="k" data-grid="1">
$('.bar-chart').cssCharts({type:"bar"});
```
