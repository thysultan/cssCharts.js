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
          var thychart = {
            donut: function(node){
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
                    val2 = val2 + r;

                var chart$clone = jQuery.extend({}, chart);
                    chart$clone.values.spinner = val1;
                    chart$clone.values.mask = val2;

                prependNodes(chart$clone.nodes);
              }
            },

            bar: function(node){
              var $node = $(node);

                  $node.parent().addClass("bar");

              var data = $node.attr("data-bars");
              var unit = $node.attr("data-unit");
              var max = $node.attr("data-max");
              var height = $node.height();
              var grid = $node.attr("data-grid");

              if(parseInt(grid) === 0) $node.css("background", "none");

              if(!data) return("No data to work with");
              if(!unit) unit = "%";
              if(!max) max = "100";

              data = JSON.parse("[[" + data + "]]");
              var barsNo = data[0].length;


              $.each(data, function(i, v) {
                // first dimension
                var uls = $("<ul></ul>");
                var lis = $("<li><span></span></li>").height(height);

                for (i = 0; i < data[0].length; i++){
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
            },

            line: function(node){
              var setAngle = function(cord, area, node){
                var hypotenuse =  Math.round( Math.sqrt(Math.pow(area.width, 2) + Math.pow(area.height, 2)) );
                var angSin = area.height / hypotenuse;
                var ang = Math.round(Math.asin(angSin) * 180/Math.PI);
                    ang = -ang;

                var $node = $(node).clone()
                              .attr("style", 'width:'+ hypotenuse +'px;')
                              .attr("data-height", area.height)
                              .attr("data-width", area.width)
                              .attr("data-hypotenuse", hypotenuse)
                              .attr("data-angle", ang)
                              .attr("data-x", cord.x)
                              .attr("data-y", cord.y);

                    $node.find("span")
                      .attr("style", 'transform: rotate('+ ang +'deg);'+'width:'+ hypotenuse +'px;')
                      .attr("data-height", area.height)
                      .attr("data-width", area.width)
                      .attr("data-hypotenuse", hypotenuse)
                      .attr("data-angle", ang);

                    $node.find("a")
                      .attr("style", 'height:'+ 40 +'px;'+'width:'+ 40 +'px;')
                      .attr("data-x", cord.x)
                      .attr("data-y", cord.y);

                return({
                  angle: ang,
                  hypo: hypotenuse,
                  width: area.width,
                  height: area.height,
                  node: $node
                });
              };

              var setPosition = function(data){
                var prevNode = $("ul").find(data).prev();
                var totalWidth = parseInt($("ul").find(data).attr("data-width").replace("-", ""));
                var totalHeight = parseInt($("ul").find(data).attr("data-height").replace("-", ""));
                var totalY = parseInt($("ul").find(data).attr("data-y").replace("-", ""));

                if(prevNode.length === 0){
                  $("ul").find(data).attr("data-total-width",totalWidth);
                  $("ul").find(data).css("left",0 + "px");

                  $("ul").find(data).attr("data-total-height", totalY - totalHeight );
                  $("ul").find(data).css("bottom",totalY + "px");

                  $("ul").find(data).attr("data-y",totalY);
                  $("ul").find(data).attr("data-x",0);
                }else{
                  var currentWidth = parseInt(prevNode.attr("data-total-width").replace("-", ""));
                      totalWidth = parseInt(prevNode.attr("data-total-width").replace("-", "")) + parseInt(data.attr("data-width").replace("-", ""));

                  $("ul").find(data).attr("data-total-width",totalWidth);
                  $("ul").find(data).css("left",currentWidth + "px");

                  var currentHeight = parseInt(prevNode.attr("data-total-height").replace("-", ""));
                      totalHeight = parseInt(prevNode.attr("data-total-height")) + parseInt(data.attr("data-height"));

                  $("ul").find(data).attr("data-total-height",totalHeight);
                  $("ul").find(data).css("bottom",currentHeight + "px");

                  $("ul").find(data).attr("data-y",currentHeight);
                  $("ul").find(data).attr("data-x",currentWidth);
                }
              };

              var setContWidth = function($chart,data){
                var width = Math.floor($chart.find("li:last-child").attr("data-x")) + 20;

                var height = data[1];
                    height = Math.max.apply(Math, height) + 20;

                $chart.css({width: width, height: height});
                $chart.parent().addClass("line");
              };

              var $chart = $(node);
              var cord = $chart.attr("data-cord");
                  cord = JSON.parse("[" + cord + "]");

              var data = cord;

              for (var i = 0; i < data[0].length; i++) {
                  cord = {
                    x: data[0][i],
                    y: data[1][i]
                  };

                  var area = {
                    width:  data[0][i+1] - data[0][i],
                    height: data[1][i+1] - data[1][i]
                  };

                  var triangle = setAngle(cord, area, $("<li><span></span><a></a></li>"));

                  $chart.append(triangle.node);
                  setPosition(triangle.node);
              }

              setContWidth($chart, data);
            }

          };

          if(options.type == "bar"){thychart.bar(this);}
          else if(options.type == "donut"){thychart.donut(this);}
          else if(options.type == "line"){thychart.line(this);}
          else{$(this).parent().hide();}

      });
    }
  });
})(jQuery);