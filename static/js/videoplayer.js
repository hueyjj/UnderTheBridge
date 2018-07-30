var videoActive = false;
var client = null;
var torrentId = null;
var peers = [];
var torrent = null;

document.querySelector("#start").addEventListener("click", function (event) {
    if (videoActive) return;
    videoActive = start;

    client = new WebTorrent();

    //torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
    let torrentInputContainer = document.querySelector("#torrent-input-box");
    torrentId = torrentInputContainer.value;
    console.log(torrentId);

    client.add(torrentId, function (torrent) {
        torrent.on("wire", function (wire, addr) {
            peers.push(addr);
        });
        var file = torrent.files.find(function (file) {
            console.log("Found file for: ");
            console.log(file.name);
            return file.name;
        })
        file.appendTo('.video-container', function () {
            document.querySelector("video").volume = 0.5;
        });
    })

    //torrent = client.get(torrentId);

    $(function () {
        setInterval(function () {
            torrent = client.get(torrentId);
            var dlspeed = 0, upspeed = 0, 
                progress = "---", timeRemaining = "n/a",
                numSeeders = 0, numPeers = 0;
            if (torrent) {
                dlspeed = bytesToSize(torrent.downloadSpeed);
                upspeed = bytesToSize(torrent.uploadSpeed);
                timeRemaining = formatMs(torrent.timeRemaining);
                progress = Math.trunc(torrent.progress * 100);
            } else {
                console.log("Client is null. Cannot update torrent info.");
            }

            $("#downloading").text("Downloading: " + dlspeed + "/s");
            $("#seeding").text("Seeding: " + upspeed + "/s");
            $("#progress").text("Progress: " + progress + "%");
            $("#time-remaining").text("ETA: " + timeRemaining);
            $("#connections").text("Connections: " + torrent.numPeers);
        }, 500);
    });
});

// Not currently possible?
// document.querySelector("#pause").addEventListener("click", function (event) {
//     if (client && torrentId) {
//         console.log("paused");
//         var torrent = client.get(torrentId);
//         torrent.pause();
//         peers.forEach((addr) => { torrent.removePeer(addr); });
//         console.log("Number of peers " + torrent.numPeers);
//     }
// });

document.querySelector("#stop").addEventListener("click", function (event) {
    if (torrentId) {
        client.remove(torrentId);
        console.log("Torrent removed: " + torrentId);
        torrentId = null;
    }
    $("#connections").text("Connections: " + 0);
    // Destory entire client
    // if (client) {
    //     client.destroy(() => { console.log("client destroyed") });
    //     client = null;
    // }
});

//https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function formatMs(timeInMs) {
    if (timeInMs < 0) return "--h --m --s";

    var timeInSeconds = timeInMs / 1000;
    
    var hr, min, sec;
    hr = Math.floor(timeInSeconds / 60 / 60);
    timeInSeconds -= hr * 60 * 60;
    min = Math.floor(timeInSeconds / 60);
    timeInSeconds -= min * 60;
    sec = Math.floor(timeInSeconds);

    return hr + "hr " + min + "m " + sec + "s";
}
