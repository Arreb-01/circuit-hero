const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const wires = new Map();
const context = vm.createContext({
  console,
  Components: {
    remove() {},
    create() {
      return null;
    },
    renderToDOM() {},
    updatePosition() {},
    getByUid() {
      return null;
    }
  },
  Wiring: {
    removeWire(id) {
      wires.delete(id);
    },
    createWire(fromUid, fromPortId, toUid, toPortId) {
      const id = `wire_${wires.size + 1}`;
      const wire = { id, fromUid, fromPortId, toUid, toPortId };
      wires.set(id, wire);
      return wire;
    },
    drawAll() {},
    updateWiresForComponent() {}
  },
  DragDrop: {
    setupComponentDrag() {},
    updateStatus() {}
  }
});

const code = fs.readFileSync(path.join(__dirname, '..', 'js/game/undo-redo.js'), 'utf8');
vm.runInContext(code, context, { filename: 'js/game/undo-redo.js' });

const UndoRedo = vm.runInContext('UndoRedo', context);

UndoRedo.push({
  type: 'wire',
  wireId: 'wire_original',
  wire: {
    id: 'wire_original',
    fromUid: 'battery',
    fromPortId: 'pos',
    toUid: 'bulb',
    toPortId: 'left'
  }
});
wires.set('wire_original', {
  id: 'wire_original',
  fromUid: 'battery',
  fromPortId: 'pos',
  toUid: 'bulb',
  toPortId: 'left'
});

UndoRedo.undo();
assert.strictEqual(wires.size, 0, 'undo should remove wire');

UndoRedo.redo();
assert.strictEqual(wires.size, 1, 'redo should restore wire');
assert.deepStrictEqual(Array.from(wires.values())[0], {
  id: 'wire_1',
  fromUid: 'battery',
  fromPortId: 'pos',
  toUid: 'bulb',
  toPortId: 'left'
});

console.log('undo-redo tests passed');
