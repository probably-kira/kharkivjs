(function () {
    var context, _source;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    // Keep track of all loaded buffers.
    var BUFFERS = {};
    // An object to track the buffers to load {name: path}
    var BUFFERS_TO_LOAD = {
      drum: 'sounds/drum.wav',
      scratch: 'sounds/elise.mp3'
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
   document.getElementById('volume').addEventListener('change', change); 
}

var ctrl1, ctrl2;
function stop() {
    playingNodes.forEach(function(node) {
        node.stop(0)
    })
    playingNodes = [];
}

//crossfade
function change(e) {
  var el = e.target;
  var x = parseInt(el.value) / parseInt(el.max);
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  ctl1.gainNode.gain.value = gain1;
  ctl2.gainNode.gain.value = gain2;
}

function play() {


  function playSound(buffer, time, name) {
    var source = context.createBufferSource();
    var gainNode = context.createGain();

    source.buffer = buffer;
    //source.playbackRate.value = 2
    if(name == 'scratch') {
        source.playbackRate.value = 1.4
        source.gain.value = 2;
    } else {
        source.playbackRate.value = 1.5
        source.looping = true
        source.gain.value = .3;
    }

    playingNodes.push(source);
    source.connect(gainNode);
    gainNode.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode
    }
  }

  var drum = BUFFERS.drum, scratch = BUFFERS.scratch;

    ctl1 = playSound(drum, 0);
    ctl2 = playSound(scratch, 0, 'scratch');

    ctl1.gainNode.gain.value = 0;

    ctl1.source.start(0)
    ctl2.source.start(0)
  }

})();