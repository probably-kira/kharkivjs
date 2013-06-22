(function () {
    var context, _source;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    // Keep track of all loaded buffers.
    var BUFFERS = {};
    // An object to track the buffers to load {name: path}
    var BUFFERS_TO_LOAD = {
      drum: 'sounds/drr.wav',
      scratch: 'sounds/scratch.wav'
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
}
var timer;
function stop() {
    playingNodes.forEach(function(node) {
        node.stop(0)
    })
    playingNodes = [];

    if (timer) {
      clearTimeout(timer);
    }
}

function play() {
  fade(BUFFERS.scratch, BUFFERS.drum);

  function playSound(buffer, time) {
    var source = context.createBufferSource();
    var gainNode = context.createGain();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode
    }
  }

  function fade(now, later) {
    var playNow = playSound(now, 0),
        source = playNow.source;

        var gainNode = playNow.gainNode;
        var duration = now.duration;
        var currTime = context.currentTime;

        // Fade the playNow track in.
        gainNode.gain.linearRampToValueAtTime(0, currTime);
        gainNode.gain.linearRampToValueAtTime(1, currTime + 1);

        // Play the playNow track.
        source.start(0);
        playingNodes.push(source);

        // At the end of the track, fade it out.
        gainNode.gain.linearRampToValueAtTime(1, currTime + duration - 1);
        gainNode.gain.linearRampToValueAtTime(0, currTime + duration);

        timer = setTimeout(function() {
          fade(later, now);
        }, (duration - 1) * 1000);
      } 
  }

})();