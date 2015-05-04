/*
 * cssCharts v0.3.0
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
          else if(opts.type == "line"){thychart.line(this);}
          else if(opts.type == "donut"){thychart.donut(this);}
          else if(opts.type == "pie"){thychart.pie(this);}
          else{$(this).parent().hide();}
      });
    }
  });

var thychart = {
  pie: function(node){
    var makeSVG = function(tag, attrs, val, title, i) {
      var el = $(document.createElementNS('http://www.w3.org/2000/svg', tag));
      var g = $(document.createElementNS('http://www.w3.org/2000/svg', "g"));
      // var text = $(document.createElementNS('http://www.w3.org/2000/svg', "text")).html(title); todo: add labels

      for (var k in attrs){
          el.attr(k,attrs[k]).attr("data-val", val).attr("data-title",title).attr("id","path"+i).attr("class","path");
          g.append(el).attr("id","pathCont"+i).attr("class","pathCont");
          // g.prepend(text);
      }
      return g[0];
    };

    var drawArcs = function($svg, pieData){
      var titles = [];
      var values = [];

      $.each(pieData, function(index, value) {
          values.push(value[1]);
          titles.push(value[0]);
      });

          pieData = values;

      var total = pieData.reduce(function (accu, that) { return that + accu; }, 0);
      var sectorAngleArr = pieData.map(function (v) { return 360 * v / total; });

      var startAngle = -90; // from the top instead of side
      var endAngle = -90;
      for (var i=0; i<sectorAngleArr.length; i++){
          startAngle = endAngle;
          endAngle = startAngle + sectorAngleArr[i];

          var x1,x2,y1,y2 ;

          x1 = parseInt(Math.round(200 + 195*Math.cos(Math.PI*startAngle/180)));
          y1 = parseInt(Math.round(200 + 195*Math.sin(Math.PI*startAngle/180)));

          x2 = parseInt(Math.round(200 + 195*Math.cos(Math.PI*endAngle/180)));
          y2 = parseInt(Math.round(200 + 195*Math.sin(Math.PI*endAngle/180)));

          var d = "M200,200  L" + x1 + "," + y1 + "  A195,195 0 " +
                  ((endAngle-startAngle > 180) ? 1 : 0) + ",1 " + x2 + "," + y2 + " z";

          var rand = function(min, max) {
              return parseInt(Math.random() * (max-min+1), 10) + min;
          }

          var get_random_color = function () {
              var color;

              if(colorSet) {
                color = (colorSet[i]);
              }
              else{
                var h = rand(10, 60); // color hue between 0° and 360°
                var s = rand(20, 100); // saturation 0-100%
                var l = rand(30, 60); // lightness 0-100%
                color = 'hsl(' + h + ',' + s + '%,' + l + '%)';
            }

            return color;
          }

          var c = parseInt(i / sectorAngleArr.length * 360);
          var randomFill = get_random_color();
          var arc = makeSVG("path", {d: d, fill: randomFill}, pieData[i], titles[i], i);
          $svg.prepend(arc);

          $chart.append($svg);
      }
    };


    var $chart   = $(node);
    var dataSet  = $(node).attr("data-set");
    var colorSet  = $(node).attr("data-colors");
        if(colorSet){ colorSet = colorSet.split(","); }

    var val = JSON.parse(dataSet);

    var $svg = $('<svg viewBox="0 0 400 400" class="svg"></svg>');

        $chart.parent().addClass("pie");
        drawArcs($svg, val);

    var mPos = {x: -1,y: -1};

    var getMousePos = function(){
      var $tooltip = $('<div class="charts-tip"></div>');

      $chart.mousemove(function(e) {
          mPos.x = e.pageX;
          mPos.y = e.pageY;
          var $target = $(e.target).clone();
          var $parent = $(e.target).parent().clone();

          var $last = $chart.find(".pathCont:last-child .path:last-child");
          var val = $target.attr("data-val");
          var title = $target.attr("data-title");
          var _id = $target.attr("id");
          var color = $target.attr("fill");

          if(val){
            $tooltip.css({
              left: mPos.x,
              top: mPos.y
            });

            var setTooltip = function(){
              $("body").find("."+$tooltip.attr("class")).remove();
              $tooltip.html(title+": " + val);
              $("body").append($tooltip);
            }();

            if(color){ $(e.target).attr("stroke", color); }

            var setOrder = function(){
              var $lastId = $last.attr("id");
              var $targetId = $target.attr("id");

              if($lastId !== $targetId){
                console.log($lastId,$targetId);
                $chart.find("#"+$target.attr("id")).parent().remove();
                $chart.find(".svg").append($parent);
              }
            }();
          }
      });

      $chart.mouseleave(function(e) {
        //  remove tooltip
        $("body").find("."+$tooltip.attr("class")).remove();
      });

    }();


  },
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

    var setContainerDimensions = function($chart,val){
      var height = [];
      var width = [];

      $.each(val, function(index, value) {
        $.each(val[index][1], function(index, value) {height.push(value);});
        $.each(val[index][0], function(index, value) {width.push(value);});
      });

      height = Math.max.apply(Math, height) + 20;
      width = Math.max.apply(Math, width) + 20;

      $chart.css({width: width, height: height});
      $chart.parent().css({width: width, height: height});
      $chart.parent().addClass("line");

      return {width:width,height:height};
    };

    var convertToArrayOfObjects = function(val, height) {
        var dataClone = val.slice(0),
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
                y: height-dataClone[i][k]
              };
            }
            output.push(obj);
        }
        return output[0];
    };

    var drawSVG = function(type, val, height, index){
      var $svg = ".svg";

      if(type){
        $svg = $('<div class="svg"><svg><path class="path" d=""></path></svg></div>');

        $svg.addClass(".p"+index);
        if(type==2){$svg.addClass("fill");}
        $chart.parent().append($svg);
      }

      var points = convertToArrayOfObjects(val, height);
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
    var container;

    var oneDim = "[" + $chart.attr("data-cord") + "]";
    var cord = $chart.attr("data-cord");
        cord = JSON.parse("[" + cord + "]");

    if(cord[0].length !== 2){
      cord = JSON.parse("[" + oneDim + "]");
    }

    var height = setContainerDimensions($chart, cord).height;

    var loopCord = function(index, val, height){
      for (var i = 0; i < val[index].length; i++) {
          cord = {
            x: val[0][i],
            y: val[1][i]
          };

          var point = setPoint(cord, $("<li><span></span><a></a></li>"));

              $chart.append(point);
              setPosition(point, cord);

          if(i % 2 === 0){
            var gridSpace = height / 10;
            var line = $("<hr/>").css({bottom: i*gridSpace}).attr("data-y", i*gridSpace);
            $chart.parent().find(".grid").append(line);
          }
      }

        drawSVG(1, val, height, index);
      if(fill){
        drawSVG(2, val, height, index);
      }
    };

    $.each(cord, function(i, val) {
       loopCord(i, val, height);
    });

  }
};
})(jQuery);