var data = {
  peer: null,
  _peerId: null,
  connectedPeers: {},
  number: Math.random(),
  numbers: [],
  isRootNode: true,
  rootNodeId: null,
  requestedPeer: null,
  _result: null,
  _status: '',
  log: [],
  set peerId (peerId) {
    this._peerId = peerId;
    $('#peerId').text(peerId);
  },
  get peerId () {
    return this._peerId
  },
  set status (status) {
    this._status = status;
    $('#status').text(status);
  },
  get status () {
    return this._status;
  },
  set result (result) {
    this._result = result;
    $('#result').text(result);
  },
  get result () {
    return this._result;
  }
};

function getMin () {
  return Math.min.apply(null, data.numbers)
}

function connect(conn) {
  conn.on('data', (d) => {
    if (d !== 'minNum') {
      data.numbers.push(d);
    } else {
      minNum();
    }
    if (!data.isRootNode &&
      data.numbers.length === Object.keys(data.peer.connections).length) {
      data.peer.connections[data.rootNodeId][0].send(getMin());
    } else if (data.isRootNode) {
      data.result = getMin();
    }
  })
}

function connectTo () {
  data.requestedPeer = $('#requestedPeer').val();
  data.isRootNode = false;
  if (!data.connectedPeers[data.requestedPeer]) {
    data.rootNodeId = data.requestedPeer;
    var conn = data.peer.connect(data.requestedPeer);
    conn.on('open', () => {
      connect(conn);
      data.status = `Conneted to ${conn.peer}`;
    });
    conn.on('error', (err) => { console.warn(err) });
  }
  data.connectedPeers[data.requestedPeer] = true;
}

function minNum () {
  let actives = Object.keys(data.peer.connections);
  let checkedIds = {};
  actives.forEach((itemId) => {
    let peerId = itemId;

    if (!checkedIds[peerId] && data.rootNodeId !== peerId) {
      var conns = data.peer.connections[peerId];
      for (var i = 0, ii = conns.length; i < ii; i += 1) {
        conns[i].send('minNum');
      }
    }
    checkedIds[peerId] = 1;
  });
}

$(document).ready(function () {
  $('#number').text(data.number);
  data.numbers.push(data.number);
  data.peer = new Peer({ key: '9mvpxsw45yst6gvi' });
  data.peer.on('open', (id) => data.peerId = id);
  data.peer.on('connection', connect);
  data.peer.on('error', (err) => { data.warn(err) });

  window.onunload = window.onbeforeunload = function(e) {
    if (!!data.peer && !data.peer.destroyed) {
      data.peer.destroy();
    }
  }
});