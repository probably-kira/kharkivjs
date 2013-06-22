(function () {
    var context, _source;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    var request = new XMLHttpRequest();
    request.open('GET', '/stage1/sounds/file.mp3', true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            var source = context.createBufferSource();
            source.buffer = buffer;
            source.connect(context.destination);
            _source = source;
        });
    }

request.send();
document.getElementById('play').addEventListener('click', function() {_source.start(0);})
document.getElementById('stop').addEventListener('click', function() {_source.stop(0);})

})();