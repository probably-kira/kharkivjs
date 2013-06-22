$(function () {
    // Future-proofing...
    var context;
    if (typeof AudioContext !== "undefined") {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        context = new webkitAudioContext();
    } else {
        return;
    }

    // Overkill - if we've got Web Audio API, surely we've got requestAnimationFrame. Surely?...
    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                    || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };

    // Create the analyser
    var analyser = context.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = .99;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    var circle = $("#circle");

    // Get the frequency data and update the visualisation
    function update() {
        requestAnimationFrame(update);
        analyser.getByteFrequencyData(frequencyData);
        var average = Math.round(getAverageVolume(frequencyData) * 20);

        circle.css({
            'border-radius': average + 'px',
            'border-width': average + 'px',
            left: -average + 'px',
            top: -average + 'px'
        })

        $('#circle-outer').css({
            'border-radius': average + 30 + 'px',
            'border-width': average + 30 + 'px',
            'margin-top': -(average + 30)/2 + 'px',
            'margin-left': -(average + 30)/2 + 'px',
        })

        $('#circle-inner').css({
            'border-radius': average - 50 + 'px',
            'border-width': average - 50 + 'px',
            left: -(average - 50) + 'px',
            top: -(average - 50) + 'px'
        })

        $('#inner').css({
            width: (average)+ 'px',
            height: (average) + 'px',
            left: -(average)  / 2+ 'px',
            top: -(average)  / 2 + 'px'
        })

        $('#fr').text(average);
    };


    function getAverageVolume(array) {
      var vals = 0;
      var length = array.length;  
 
      for (var i=0; i < length; i++) {
        vals += array[i];
      }
 
      return (vals / length); 
    }


    // Hook up the audio routing...
    // player -> analyser -> speakers
	// (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
	$("#player")
        .bind('canplay', function() {
    		var source = context.createMediaElementSource(this);
    		source.connect(analyser);
    		analyser.connect(context.destination);
    	})
        .bind('pause', function() {
          $('#circle-outer').hide();
          $('#fr').hide().next().show()  
        })

    // Kick it off...
    update();
});