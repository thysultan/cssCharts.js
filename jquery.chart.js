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

          if(options.type == "bar"){sultanChart.bar(this);}
          else if(options.type == "donut"){sultanChart.donut(this);}
          else{$(this).parent().hide();};
      });
    }
  });
})(jQuery);