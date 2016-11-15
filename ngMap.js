  systemComponents.directive('ngMapInput', [function(){
    return {
      restrict: 'E',
      template: '<div class="form-control-wrapper">\n  <i class="map_icon"></i>\n  <input type="text" class="form-control dropdown-toggle pointer" data-toggle="dropdown" readonly="readonly" placeholder="请选择坐标">\n  <div class="dropdown-menu" style="height:300px;width:100%"></div>\n </div>',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl){
        var marker = null;
        var $input = element.find('input');
        var map = new BMap.Map(element.find('.dropdown-menu')[0]);
        window.map = map;
        var geolocation = new BMap.Geolocation();
        map.centerAndZoom('中国');
        map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
        map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

        //創建marker
        function createMarker(point){
          if(marker)marker.hide();
          marker = new BMap.Marker(point);
          map.addOverlay(marker);
          map.panTo(point);
        }

        //清除marker
        function remove_overlay(){
          map.clearOverlays();
        }

        //添加清除marker按鈕
        function ZoomControl(){
          // 默认停靠位置和偏移量
          this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
          this.defaultOffset = new BMap.Size(10, 10);
        }

        // 通过JavaScript的prototype属性继承于BMap.Control
        ZoomControl.prototype = new BMap.Control();
        // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
        // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        if(attrs.required !== undefined){
          ctrl.$validators.required = function(modelValue, viewValue){
            return !!(viewValue && viewValue.lat);
          };
        }else{
          ZoomControl.prototype.initialize = function(map){
            //创建一个DOM元素
            var btn = document.createElement("button");
            // 添加文字说明
            btn.appendChild(document.createTextNode("清除marker"));
            // 设置样式
            btn.className = 'btn btn-danger btn-sm';
            btn.type = 'button';
            // 绑定事件,点击清除marker
            btn.onclick = function(){
              remove_overlay();
              ctrl.$viewValue = null;
              ctrl.$render();
            };
            // 添加DOM元素到地图中
            map.getContainer().appendChild(btn);
            // 将DOM元素返回
            return btn;
          };
          // 创建控件
          var myZoomCtrl = new ZoomControl();
          // 添加到地图当中
          map.addControl(myZoomCtrl);
        }

        $('.dropdown-toggle').on('click', function(){
          setTimeout(function(){
            if(!ctrl.$viewValue){
              geolocation.getCurrentPosition(function(r){
                if(this.getStatus() == BMAP_STATUS_SUCCESS){
                  map.centerAndZoom(r.point,11);
                }
                else {
                  map.centerAndZoom('中国');
                }
              },{enableHighAccuracy: true});
            }else{
              var point = new BMap.Point(ctrl.$viewValue.lng, ctrl.$viewValue.lat);
              createMarker(point);
            }
          }, 100);
        });

        $('.dropdown-menu').on('click', function(e){
          map.enableAutoResize();
          e.stopPropagation();
        });

        function showInfo(e){
          var point = { lat: e.point.lat, lng: e.point.lng };
          var mPoint = new BMap.Point(point.lng, point.lat);
          createMarker(mPoint);
          scope.$apply(function(){
            ctrl.$setViewValue(point);
          });
        }

        map.addEventListener("click", showInfo);

        ctrl.$render = function(){
          $input.val(!ctrl.$viewValue ? '' : ctrl.$viewValue.lng + ',' + ctrl.$viewValue.lat);
        };

        ctrl.$viewChangeListeners.push(function(){
          ctrl.$render();
        });
      }
    }
  }]);