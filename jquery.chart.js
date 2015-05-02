/*
 * cssCharts v0.2.0
 * jquery plugin to create donut and bar charts with css
 * https://github.com/sultantarimo
 *
 * (c)2015 Sultan Tarimo - sultantarimo@me.com
 * Released under the MIT license
 */
(function($){
  $.fn.extend({
    cssCharts: function(opts) {
      var defs = {};
          opts =  $.extend(defs, opts);
      return this.each(function() {
          if(opts.type == "bar"){thychart.bar(this);}
          else if(opts.type == "donut"){thychart.donut(this);}
          else if(opts.type == "line"){thychart.line(this);}
          else{$(this).parent().hide();}
      });
    }
  });

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

        val      = parseFloat(val).toFixed(2)*c;
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
        spinner: function(){
          return $temp.clone().attr(
            "style",

            '-webkit-transform: rotate('+ chart.values.spinner +'deg);' +
            '-moz-transform: rotate('+ chart.values.spinner +'deg);' +
            'transform: rotate('+ chart.values.spinner +'deg);'
            );
        },
        mask: function(){
          return $temp.clone().addClass(chart.values.selector).attr(
            "style",

            '-webkit-transform: rotate('+ chart.values.mask + 'deg);' +
            '-moz-transform: rotate('+ chart.values.mask + 'deg);' +
            'transform: rotate('+ chart.values.mask + 'deg);'
            );
      }
      },
      values: {spinner: val, mask: c, selector: "" }
    };
    var prependNodes = function(data){
      $.each(data, function(i, _node) {$chart.prepend(_node());});
    };

    // IF LESS THAN 50%
    var chart$clone,val1,val2;

    if(val < r){
      val1 = val;

      chart$clone = jQuery.extend({}, chart);
      chart$clone.values.spinner = val1;
      chart$clone.values.selector = "mask";

      prependNodes(chart$clone.nodes);
    }
    // IF GREATER THAN 50%
    else{
      val2 = val - r;
      val1 = val - val2;
      val2 = val2 + r;

      chart$clone = jQuery.extend({}, chart);
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
    var height = $node.height();
    var grid = $node.attr("data-grid");
    var barWidth = $node.attr("data-width");
    var max = $node.attr("data-max");

    if(parseInt(grid,10) === 0) $node.css("background", "none");

    if(!data) return("No data to work with");
    if(!unit) unit = "%";

    // get max data point
    var maxData = function(){
      var arr = JSON.parse("[" + data + "]");
      return Math.max.apply(Math, arr.map(function(i) { return i[0]; }));
    };

    // If "data-max" is not specified or if the heighest data-point is greater than data-max
    if(maxData() > max || !max){ max = maxData(); }

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
          if(!barWidth){
            li.find("span").attr(
              "style",
              "height:" + percent + "%"
              );
          }else{
            li.find("span").attr(
              "style",
              "height:" + percent + "%;" +
              "width:" + barWidth + "px"
              );
          }
          ul.append(li);
        });

        $node.append(ul);
      }
    });

    var $grid = $("<div class='grid'></div>");
        $node.parent().append($grid);

    for(var i = 0; i <= 10; i++) {
      var toPerc = (i*10).toFixed(0);
      var converter = max/100;
      var toUnit = (toPerc * converter).toFixed(0);

      if(i % 2 === 0){
        var line = $("<hr/>").css({bottom: toPerc+"%"}).attr("data-y", toUnit + unit);
        $node.parent().find(".grid").append(line);
      }
    }

    $node.parent().width($node.width());
  },

  line: function(node){
    var setPoint = function(cord, node){
      var $node = $(node).clone();
          $node.find("a").attr("data-x", cord.x).attr("data-y", cord.y);
      return $node;
    };

    var setPosition = function(data, cord){
      $("ul").find(data).css("left",cord.x + "px");
      $("ul").find(data).css("bottom",cord.y + "px");
    };

    var setContainerDimensions = function($chart,data){
      var height = data[1];
          height = Math.max.apply(Math, height) + 20;

      var width = data[0];
          width = Math.max.apply(Math, width) + 20;

      $chart.css({width: width, height: height});
      $chart.parent().css({width: width, height: height});
      $chart.parent().addClass("line");

      return {width:width,height:height};
    };

    var convertToArrayOfObjects = function() {
        var dataClone = data.slice(0),
            keys = dataClone.shift(),
            i = 0,
            k = 0,
            obj = null,
            output = [];

        for (i = 0; i < dataClone.length; i++) {
            obj = {};

            for (k = 0; k < keys.length; k++) {
              obj[k] = {
                x: keys[k],
                y: container.height-dataClone[i][k]
              };
            }
            output.push(obj);
        }
        return output[0];
    };

    var drawSVG = function(type){
      var $svg = ".svg";

      if(type){
        $svg = $('<div class="svg"><svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><path class="path" d=""></path></svg></div>');
        if(type==2){$svg.addClass("fill");}
        $chart.parent().append($svg);
      }

      var points = convertToArrayOfObjects();
      var counter = 0;

      var addPoint = function(x, y, isFirst){
          var new_point;
          var last = Object.keys(points).length-1;

          if(isFirst == "last"){
            new_point = " L" + points[last].x + "," + points[last].x + " L" + 0 + "," + points[last].x +" Z";
          }else{
            new_point = (isFirst? "M" : " ")+x+","+y;
          }

          $chart.parent().find($svg).find("path").attr("d", $chart.parent().find($svg).find("path").attr("d")+""+new_point);
          counter++;

          if(counter < Object.keys(points).length){
              setTimeout(addPoint(points[counter].x, points[counter].y, false),0); // Add a new point after 200 milliseconds
          }

          if(counter == Object.keys(points).length && type ==2){
            setTimeout(addPoint(null, null, "last"),0);
          }
      };
      addPoint(points[0].x, points[0].y, true);
    };

    var $chart = $(node);
    var fill = $chart.attr("data-fill");
    var grid = $("<div class='grid'></div>");
        $chart.parent().append(grid);
    var $pointsCont = $('<g class="points"></g>');
    var area;
    var cssLines = 0;

    var cord = $chart.attr("data-cord");
        cord = JSON.parse("[" + cord + "]");
    var data = cord;
    var container = setContainerDimensions($chart, data);

    var loopCord = function(){
      for (var i = 0; i < data[0].length; i++) {
          cord = {
            x: data[0][i],
            y: data[1][i]
          };
          area = {
            width:  data[0][i+1] - data[0][i],
            height: data[1][i+1] - data[1][i]
          };

          var point = setPoint(cord, $("<li><span></span><a></a></li>"));

              $chart.append(point);
              setPosition(point, cord);

          if(i % 2 === 0){
            var gridSpace = $chart.height() / 10;
            var line = $("<hr/>").css({bottom: i*gridSpace}).attr("data-y", i*gridSpace);
            $chart.parent().find(".grid").append(line);
          }
      }
    }();

    drawSVG(1);
    if(fill){drawSVG(2);}
  }
};
})(jQuery);