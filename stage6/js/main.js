(function () {
    var context, _source;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    // Keep track of all loaded buffers.
    var BUFFERS = {};
    // An object to track the buffers to load {name: path}
    var BUFFERS_TO_LOAD = {
      file: 'sounds/file.mp3'
    };
    // Array-ify
    var names = [];
    var paths = [];
    var playingNodes = [];
    for (var name in BUFFERS_TO_LOAD) {
        var path = BUFFERS_TO_LOAD[name];
        names.push(name);
        paths.push(path);
    }

    bufferLoader = new BufferLoader(context, paths, function(bufferList) {
        for (var i = 0; i < bufferList.length; i++) {
          var buffer = bufferList[i];
          var name = names[i];
          BUFFERS[name] = buffer;
        }
        init();
    });

    bufferLoader.load();

function init() {
   document.getElementById('play').addEventListener('click', play)
   document.getElementById('stop').addEventListener('click', stop)
   var inputs = document.getElementsByClassName('filter'), i = 0;

   for (i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', change);
   }

  var radio = document.getElementsByClassName('select-filter'), a;
  for (a = 0; a < radio.length; a++) {
    radio[a].addEventListener('change', changeFilter);
   }
}

function changeFilter (e) {
  source.disconnect(0);
  if (filter) {
    filter.disconnect(0); 
  }

  var el = e.target,
    val = el.value;

  // Check if we want to enable the filter.
  if (val === 'none') {
    //connect directly
    source.connect(context.destination);
    noFilter = true;
  } else {
    var type = val, _filter = filters[val];
    if (!_filter) {
      _filter = context.createBiquadFilter();
      _filter.type = +val; // LOWPASS
      _filter.frequency.value = 5000;
      filters[val] = _filter;
    }

    source.connect(_filter);
    _filter.connect(context.destination);
    filter = _filter;
    noFilter = false;
  }
};


function change(e) {
  if(noFilter) {
    return;
  }
  var el = e.target,
    name = el.name,
    val = e.val;
    switch(name) {
      case 'quality':
        changeQuality(el);
        break;
      case 'frequency':
        changeFrequency(el);
        break;
      default:
        break;
    }
}

function changeFrequency(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  filter.frequency.value = maxValue * multiplier;
};

function changeQuality (element) {
  filter.Q.value = element.value * 30
};



function stop() {
    playingNodes.forEach(function(node) {
        node.stop(0)
    })
    playingNodes = [];
}

var filter, source, filters = [], noFilter = true;
function play() {
  source = context.createBufferSource();
  source.buffer = BUFFERS.file;
  //start play without any filters
  source.start(0);
  source.connect(context.destination);
  playingNodes.push(source);
}

})();