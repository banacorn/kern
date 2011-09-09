(function() {
  var nav;
  $(function() {
    return nav.init();
  });
  nav = (function() {
    var bindScroll, detectScroll, unbindScroll, _changeTag;
    detectScroll = function() {
      var arr, curr, header, headers, i;
      headers = (function() {
        var _i, _len, _ref, _results;
        _ref = $('h2');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          header = _ref[_i];
          _results.push($(header).position().top);
        }
        return _results;
      })();
      arr = (function() {
        var _len, _results;
        _results = [];
        for (i = 0, _len = headers.length; i < _len; i++) {
          header = headers[i];
          if ($(window).scrollTop() >= header) {
            _results.push(i);
          }
        }
        return _results;
      })();
      curr = arr.length === 0 ? 0 : arr.length - 1;
      _changeTag(curr);
      return console.log(curr);
    };
    bindScroll = function() {
      return $(window).scroll(detectScroll);
    };
    unbindScroll = function() {
      return $(window).unbind('scroll');
    };
    _changeTag = function(index) {
      $('nav li.selected').removeClass('selected');
      return $('nav li').eq(index).addClass('selected');
    };
    return {
      init: function() {
        var that;
        that = this;
        $('nav li a').click(function() {
          var index;
          index = $(this).index('nav li a');
          that.changeTag(index);
          return that.jump(index);
        });
        return $(window).scroll(detectScroll);
      },
      changeTag: function(index) {
        return _changeTag(index);
      },
      jump: function(index) {
        var nextOffset;
        unbindScroll();
        nextOffset = $('h2').eq(index).position().top;
        return $('body').animate({
          scrollTop: nextOffset
        }, 300, bindScroll);
      }
    };
  })();
}).call(this);
