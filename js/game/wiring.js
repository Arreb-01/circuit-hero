// Wire drawing and connection system
const Wiring = (function() {
  let wires = [];
  let nextId = 1;
  let drawing = false;
  let fromPort = null;
  let tempLine = null;
  let canvas, ctx;

  function init() {
    canvas = document.getElementById('wireCanvas');
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    document.getElementById('componentsLayer').addEventListener('mousedown', onPortClick);
    document.addEventListener('mousemove', onDrawMove);
    document.addEventListener('mouseup', onDrawEnd);
  }

  function resize() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = container.clientHeight * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    ctx.scale(dpr, dpr);
    drawAll();
  }

  function onPortClick(e) {
    const portEl = e.target.closest('.port');
    if (!portEl) return;
    e.preventDefault();
    e.stopPropagation();

    const uid = portEl.dataset.uid;
    const portId = portEl.dataset.portId;

    if (!drawing) {
      fromPort = { uid, portId };
      drawing = true;
      portEl.classList.add('highlight');
    } else {
      if (uid === fromPort.uid && portId === fromPort.portId) {
        cancelDraw();
        return;
      }
      // Complete the wire
      const wire = createWire(fromPort.uid, fromPort.portId, uid, portId);
      if (wire) {
        UndoRedo.push({ type: 'wire', wireId: wire.id });
        document.dispatchEvent(new CustomEvent('circuit:wire-connected', {
          detail: { wire }
        }));
        DragDrop.updateStatus();
      }
      cancelDraw();
    }
  }

  function onDrawMove(e) {
    if (!drawing || !fromPort) return;
    const stageGrid = document.getElementById('stageGrid');
    const rect = stageGrid.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    drawAll();
    const fromPos = getPortPosition(fromPort.uid, fromPort.portId);
    if (fromPos) {
      ctx.beginPath();
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawLPath(ctx, fromPos.x, fromPos.y, localX, localY);
      ctx.stroke();
    }
  }

  function onDrawEnd(e) {
    // If released not on a port, cancel
    if (drawing && !e.target.closest('.port')) {
      cancelDraw();
    }
  }

  function cancelDraw() {
    drawing = false;
    fromPort = null;
    document.querySelectorAll('.port.highlight').forEach(p => p.classList.remove('highlight'));
    drawAll();
  }

  function getPortPosition(uid, portId) {
    const comp = Components.getByUid(uid);
    if (!comp) return null;
    const port = comp.def.ports.find(p => p.id === portId);
    if (!port) return null;

    const pos = Grid.gridToPixel(comp.col, comp.row);
    return {
      x: pos.x - comp.def.pixelWidth / 2 + port.offsetX,
      y: pos.y - comp.def.pixelHeight / 2 + port.offsetY
    };
  }

  function createWire(fromUid, fromPortId, toUid, toPortId) {
    // Prevent duplicate wires
    const exists = wires.find(w =>
      (w.fromUid === fromUid && w.fromPortId === fromPortId && w.toUid === toUid && w.toPortId === toPortId) ||
      (w.fromUid === toUid && w.fromPortId === toPortId && w.toUid === fromUid && w.toPortId === fromPortId)
    );
    if (exists) return null;

    const id = 'wire_' + nextId++;
    const wire = { id, fromUid, fromPortId, toUid, toPortId };
    wires.push(wire);
    drawAll();
    return wire;
  }

  function removeWire(wireId) {
    const idx = wires.findIndex(w => w.id === wireId);
    if (idx >= 0) {
      wires.splice(idx, 1);
      drawAll();
      DragDrop.updateStatus();
    }
  }

  function drawAll() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    wires.forEach(wire => {
      const from = getPortPosition(wire.fromUid, wire.fromPortId);
      const to = getPortPosition(wire.toUid, wire.toPortId);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawLPath(ctx, from.x, from.y, to.x, to.y);
      ctx.stroke();
    });
  }

  function drawLPath(ctx, x1, y1, x2, y2) {
    const midX = (x1 + x2) / 2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(midX, y1);
    ctx.lineTo(midX, y2);
    ctx.lineTo(x2, y2);
  }

  function updateWiresForComponent(uid) {
    drawAll();
  }

  function getAll() { return wires; }

  function clearAll() {
    wires = [];
    drawAll();
  }

  function getPortConnections(uid, portId) {
    return wires.filter(w =>
      (w.fromUid === uid && w.fromPortId === portId) ||
      (w.toUid === uid && w.toPortId === portId)
    );
  }

  return { init, createWire, removeWire, getAll, clearAll, drawAll, updateWiresForComponent, getPortPosition, getPortConnections, cancelDraw };
})();
