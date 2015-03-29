/*
 * cssCharts v0.1.0
 * jquery plugin to create donut and bar charts with css
 * https://github.com/sultantarimo
 *
 * (c)2015 Sultan Tarimo - sultantarimo@me.com
 * Released under the MIT license
 */

(function($){
  $.fn.extend({
    cssCharts: function(options) {
      var defaults = {}
      var options =  $.extend(defaults, options);
      return this.each(function() {
          sultanChart = {};
          sultanChart.donut = function(node){
            var $chart   = $(node);
            var val      = $(node).attr("data-percent");
            var title    = $(node).attr("data-title");

                $chart.parent().addClass("donut");

            if(!title) title = "%";
            if(val > 1 || val < 0) return("between 0 - 1 please");

            var r        = 180;
            var c        = 360;

            var val      = parseFloat(val).toFixed(2)*c;
            var $temp    = $('<div></div>').addClass("pie spinner");

            var $title   = $("<h2><p></p><span></span></h2>");
                $title.find("p").text(val/360*100);
                $title.find("span").text(title);

                $chart.on('show-donut-chart', function(){
                  $title.find("p").text(0);
                  $({countNum: $title.find("p").text()}).animate({countNum: val/360*100}, {
                    duration: 500,
                    easing:'linear',
                    step: function() {
                      $title.find("p").text(Math.floor(this.countNum));
                    },
                    complete: function() {
                      $title.find("p").text(this.countNum);
                    }
                  });
                  $chart.on('hide-donut-chart', function(){
                    $title.find("p").text(0);
                  });
                });

            $chart.append($title);

            var chart = {
              nodes: {
                spinner: function(){ return $temp.clone().attr("style", 'transform: rotate('+ chart.values.spinner +'deg);'); },
                mask: function(){ return $temp.clone().addClass(chart.values.selector).attr("style", 'transform: rotate('+ chart.values.mask +'deg);'); }
              },
              values: {spinner: val, mask: c, selector: "" }
            };
            var prependNodes = function(data){ $.each(data, function(i, _node) {$chart.prepend(_node());}); };

            // IF LESS THAN 50%
            if(val < r){
              var val1 = val;

              var chart$clone = jQuery.extend({}, chart);
                  chart$clone.values.spinner = val1;
                  chart$clone.values.selector = "mask";

              prependNodes(chart$clone.nodes);
            }
            // IF GREATER THAN 50%
            else{
              var val2 = val - r;
              var val1 = val - val2;
              var val2 = val2 + r;

              var chart$clone = jQuery.extend({}, chart);
                  chart$clone.values.spinner = val1;
                  chart$clone.values.mask = val2;

              prependNodes(chart$clone.nodes);
            }
          }
          sultanChart.bar = function(node){
            var $node = $(node);

                $node.parent().addClass("bar");

            var data = $node.attr("data-bars");
            var unit = $node.attr("data-unit");
            var max = $node.attr("data-max");
            var height = $node.height();
            var grid = $node.attr("data-grid");

            if(parseInt(grid) == 0) $node.css("background", "none");

            if(!data) return("No data to work with");
            if(!unit) unit = "%";
            if(!max) max = "100";

            var data = JSON.parse("[" + data + "]");
            var barsNo = data[0].length;


            $.each(data, function(i, v) {
              // first dimension
              var uls = $("<ul></ul>");
              var lis = $("<li><span></span></li>").height(height);

              for (var i = 0; i < data[0].length; i++){
                var ul = uls.clone();

                $.each(v[i], function(index, val) {

                  // second dimension
                  var li = lis.clone();

                  var value = (data[0][i][index]);
                  var title = value + unit;
                  var percent = (value/max) * 100;

                  li.find("span").attr("title", title);
                  li.find("span").attr("style", "height:" + percent + "%");

                  ul.append(li);
                });

                $node.append(ul);
              }
            });

            $node.parent().width($node.width());
          };

          sultanChart.line = function(node){
            var setAngle = function(width, height, node){
              var hypotenuse =  Math.round( Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) );
              var angSin = height / hypotenuse;
              var ang = Math.round(Math.asin(angSin) * 180/Math.PI);
                  ang = -ang;

              var $node = $(node).clone()
                            .attr("style", 'transform: rotate('+ ang +'deg);'+'width:'+ hypotenuse +'px;')
                            .attr("data-height", height)
                            .attr("data-width", width)
                            .attr("data-hypotenuse", hypotenuse)
                            .attr("data-angle", ang);

              return({
                angle: ang,
                hypo: hypotenuse,
                width: width,
                height: height,
                node: $node
              });
            };

            var setPosition = function(data){
              var prevNode = $("ul").find(data).prev();
              var totalWidth = parseInt($("ul").find(data).attr("data-width").replace("-", ""));
              var totalHeight = parseInt($("ul").find(data).attr("data-height").replace("-", ""));

              if(prevNode.length === 0){
                $("ul").find(data).attr("data-total-width",totalWidth);
                $("ul").find(data).css("left",0 + "px");

                $("ul").find(data).attr("data-total-height",totalHeight);
                $("ul").find(data).css("bottom",totalHeight*2 + "px");
              }else{
                var currentWidth = parseInt(prevNode.attr("data-total-width").replace("-", ""));
                var totalWidth = parseInt(prevNode.attr("data-total-width").replace("-", "")) + parseInt(data.attr("data-width").replace("-", ""));

                $("ul").find(data).attr("data-total-width",totalWidth);
                $("ul").find(data).css("left",currentWidth + "px");

                var currentHeight = parseInt(prevNode.attr("data-total-height").replace("-", ""));
                var totalHeight = parseInt(prevNode.attr("data-total-height")) + parseInt(data.attr("data-height"));

                $("ul").find(data).attr("data-total-height",totalHeight);
                $("ul").find(data).css("bottom",currentHeight + "px");
              }
            };

            var setContWidth = function($chart){
              var width = $chart.find("li:last-child").attr("data-total-width");
              var height = $chart.find("li:last-child").attr("data-total-height");

              $chart.css({width: width, height: height});
              $chart.parent().addClass("line");
            };

            var $chart = $(node);
            var cord = $chart.attr("data-cord");
                cord = JSON.parse("[" + cord + "]");

            var data = cord;

            for (var i = 0; i < data[0].length; i++) {
              if(i % 2 == 0){
                var cord = {
                  x: data[0][i],
                  y: data[1][i]
                }
                var area = {
                  width:  data[0][i+1] - data[0][i],
                  height: data[1][i+1] - data[1][i]
                }
                var triangle = setAngle(area.width, area.height, $("<li></li>"));

                $chart.append(triangle.node);
                setPosition(triangle.node);
                setContWidth($chart);
              }
            }
          };

          if(options.type == "bar"){sultanChart.bar(this);}
          else if(options.type == "donut"){sultanChart.donut(this);}
          else if(options.type == "line"){sultanChart.line(this);}
          else{$(this).parent().hide();};
      });
    }
  });
})(jQuery);