// Circuit simulation engine
const CircuitEngine = (function() {

  function evaluate(levelConfig) {
    const components = Components.getAll();
    const wires = Wiring.getAll();
    const goal = levelConfig && levelConfig.circuitGoal ? levelConfig.circuitGoal : { type: 'closed', requiredBulbs: 1 };

    if (components.length < 2) return { status: 'incomplete', message: 'Place all components first.' };
    if (wires.length < 2) return { status: 'incomplete', message: 'Connect wires between ports.' };

    // Find battery and bulb
    const batteries = components.filter(c => c.type === 'battery');
    const bulbs = components.filter(c => c.type === 'bulb');

    if (batteries.length === 0) return { status: 'incomplete', message: 'Need a battery.' };
    if (bulbs.length === 0) return { status: 'incomplete', message: 'Need a bulb.' };

    const battery = batteries[0];
    const requiredBulbs = goal.requiredBulbs || 1;
    if (bulbs.length < requiredBulbs) {
      return { status: 'incomplete', message: 'Place all required bulbs first.' };
    }

    // Check for short circuit: battery pos directly connected to battery neg
    const posPort = battery.def.ports.find(p => p.id === 'pos');
    const negPort = battery.def.ports.find(p => p.id === 'neg');

    const posWires = Wiring.getPortConnections(battery.uid, 'pos');
    const negWires = Wiring.getPortConnections(battery.uid, 'neg');

    // Check if battery pos connects to battery neg directly (no load)
    for (const pw of posWires) {
      for (const nw of negWires) {
        const pwOtherUid = pw.fromUid === battery.uid ? pw.toUid : pw.fromUid;
        const nwOtherUid = nw.fromUid === battery.uid ? nw.toUid : nw.fromUid;
        const pwOtherPort = pw.fromUid === battery.uid ? pw.toPortId : pw.fromPortId;
        const nwOtherPort = nw.fromUid === battery.uid ? nw.toPortId : nw.fromPortId;

        // If both connect to same component and same port, it's a short
        if (pwOtherUid === nwOtherUid && pwOtherPort === nwOtherPort && pwOtherUid === battery.uid) {
          return { status: 'short', message: 'Short circuit! Current bypasses the load!' };
        }
      }
    }

    if (goal.type === 'parallel') {
      var parallelResult = evaluateParallelGoal(battery, bulbs, requiredBulbs);
      if (parallelResult.status === 'closed') return parallelResult;
      return parallelResult;
    }

    // Build adjacency for path finding
    // Each port is a node, wires are edges
    const visited = new Set();
    const path = [];

    // BFS from battery positive
    const startKey = battery.uid + '.pos';
    const targetKey = battery.uid + '.neg';
    const queue = [{ key: startKey, path: [startKey] }];
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.key === targetKey) {
        // Found a path! Now check if it goes through a load (bulb)
        const bulbsInPath = bulbs.filter(function(bulb) {
          return current.path.some(function(k) { return k.startsWith(bulb.uid + '.'); });
        });
        if (bulbsInPath.length >= requiredBulbs) {
          return {
            status: 'closed',
            message: 'Circuit complete!',
            path: current.path,
            battery: battery,
            bulb: bulbsInPath[0],
            bulbs: bulbsInPath
          };
        } else {
          return { status: 'short', message: 'Short circuit! Current goes directly back without powering every required bulb.' };
        }
      }

      const [uid, portId] = current.key.split('.');

      // Get internal connections (within same component)
      // Skip for battery — it's the source, not a pass-through
      const comp = Components.getByUid(uid);
      if (comp && comp.type !== 'battery') {
        // Open switch blocks current flow
        if (comp.type === 'switch' && !comp.switchClosed) {
          // Switch is open — no internal connection
        } else {
          comp.def.ports.forEach(p => {
            const pKey = uid + '.' + p.id;
            if (!visited.has(pKey)) {
              visited.add(pKey);
              queue.push({ key: pKey, path: [...current.path, pKey] });
            }
          });
        }
      }

      // Get wire connections
      const portWires = Wiring.getPortConnections(uid, portId);
      portWires.forEach(w => {
        const otherUid = w.fromUid === uid && w.fromPortId === portId ? w.toUid : w.fromUid;
        const otherPort = w.fromUid === uid && w.fromPortId === portId ? w.toPortId : w.fromPortId;
        const otherKey = otherUid + '.' + otherPort;
        if (!visited.has(otherKey)) {
          visited.add(otherKey);
          queue.push({ key: otherKey, path: [...current.path, otherKey] });
        }
      });
    }

    // No path found — open circuit
    // Check if an open switch is the cause
    const openSwitches = components.filter(function(c) { return c.type === 'switch' && !c.switchClosed; });
    if (openSwitches.length > 0) {
      return { status: 'open', message: 'Open circuit! The switch is open — click it to close, then try again.' };
    }
    return { status: 'open', message: 'Open circuit! Current has no complete path from (+) to (-).' };
  }

  function getGraph(options) {
    var skipBulbInternal = options && options.skipBulbInternal;
    var components = Components.getAll();
    var wires = Wiring.getAll();
    var graph = {};

    function addNode(key) {
      if (!graph[key]) graph[key] = [];
    }

    function addEdge(a, b) {
      addNode(a);
      addNode(b);
      graph[a].push(b);
      graph[b].push(a);
    }

    components.forEach(function(comp) {
      comp.def.ports.forEach(function(port) {
        addNode(comp.uid + '.' + port.id);
      });

      if (comp.type !== 'battery' && !(skipBulbInternal && comp.type === 'bulb')) {
        if (comp.type !== 'switch' || comp.switchClosed) {
          for (var i = 0; i < comp.def.ports.length - 1; i++) {
            addEdge(comp.uid + '.' + comp.def.ports[i].id, comp.uid + '.' + comp.def.ports[i + 1].id);
          }
        }
      }
    });

    wires.forEach(function(wire) {
      addEdge(wire.fromUid + '.' + wire.fromPortId, wire.toUid + '.' + wire.toPortId);
    });

    return graph;
  }

  function canReach(graph, start, target) {
    var queue = [start];
    var visited = new Set([start]);
    while (queue.length > 0) {
      var current = queue.shift();
      if (current === target) return true;
      (graph[current] || []).forEach(function(next) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
    }
    return false;
  }

  function evaluateParallelGoal(battery, bulbs, requiredBulbs) {
    var graph = getGraph({ skipBulbInternal: true });
    var posKey = battery.uid + '.pos';
    var negKey = battery.uid + '.neg';
    var validBulbs = bulbs.filter(function(bulb) {
      var left = bulb.uid + '.left';
      var right = bulb.uid + '.right';
      return (canReach(graph, posKey, left) && canReach(graph, negKey, right)) ||
        (canReach(graph, posKey, right) && canReach(graph, negKey, left));
    });

    if (validBulbs.length >= requiredBulbs) {
      return {
        status: 'closed',
        message: 'Parallel circuit complete!',
        path: [posKey, validBulbs[0].uid + '.left', validBulbs[0].uid + '.right', negKey],
        battery: battery,
        bulb: validBulbs[0],
        bulbs: validBulbs
      };
    }

    return { status: 'open', message: 'Parallel circuit incomplete! Each bulb needs its own branch between (+) and (-).' };
  }

  return { evaluate };
})();
