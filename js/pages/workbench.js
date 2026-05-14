// Workbench main controller
(function() {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var levelId = params.get('level') || '1-1';
  var config = LevelConfig.get(levelId);
  var isSandbox = config && config.mode === 'sandbox';
  var timerInterval = null;
  var startTime = Date.now();
  var powered = false;
  var levelComplete = false;

  function init() {
    // Initialize all subsystems
    Grid.init();
    Wiring.init();
    ParticleSystem.init();
    Feedback.init();

    // Set header level info from config
    if (config) {
      var badge = document.getElementById('levelIdBadge');
      if (badge) badge.textContent = config.id;
      var nameEl = document.getElementById('levelNameText');
      if (nameEl) nameEl.textContent = config.title;

      // Setup parts panel based on config
      setupPartsPanel();

      // Set back button link
      var backBtn = document.getElementById('backBtn');
      if (backBtn) {
        backBtn.href = isSandbox ? 'story-map.html' : 'mission-briefing.html?chapter=' + config.chapter + '&level=' + config.id;
      }
    }

    if (isSandbox) setupSandboxUI();

    // Delay DragDrop init to ensure components are in DOM
    setTimeout(function() {
      DragDrop.init();
    }, 100);

    // Pre-place components from config
    if (config && config.workbench.prePlace) {
      var stageGrid = document.getElementById('stageGrid');
      setTimeout(function() {
        var cols = Grid.getCols();
        var rows = Grid.getRows();
        config.workbench.prePlace.forEach(function(item) {
          var comp = Components.create(item.type, Math.floor(cols * item.colRatio), Math.floor(rows * item.rowRatio));
          if (comp) {
            Components.renderToDOM(comp);
            DragDrop.setupComponentDrag(comp);
          }
        });
      }, 200);
    }

    // Start tutorial
    setTimeout(function() {
      if (!isSandbox) Tutorial.init(levelId);
    }, 600);

    // Timer
    if (isSandbox) {
      var display = document.getElementById('timerDisplay');
      if (display) display.textContent = 'LAB';
    } else {
      startTimer();
    }

    // Power button
    document.getElementById('powerBtn').addEventListener('click', onPowerOn);

    // Keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);

    // Tool buttons
    document.getElementById('undoBtn').addEventListener('click', function() { UndoRedo.undo(); });
    document.getElementById('redoBtn').addEventListener('click', function() { UndoRedo.redo(); });
    document.getElementById('deleteBtn').addEventListener('click', onDelete);
    document.getElementById('clearBtn').addEventListener('click', onClear);

    // Hint button
    document.getElementById('hintBtn').addEventListener('click', onHint);

    // Help close
    document.getElementById('helpClose').addEventListener('click', function() {
      document.getElementById('stageInstruction').style.display = 'none';
    });

    // Window resize
    window.addEventListener('resize', function() {
      Grid.resize();
      Wiring.resize();
      ParticleSystem.resize();
    });
  }

  function setupPartsPanel() {
    if (!config || !config.workbench.partsPanel) return;
    var parts = config.workbench.partsPanel;
    Object.keys(parts).forEach(function(type) {
      var item = document.querySelector('.component-item[data-type="' + type + '"]');
      if (!item) return;
      var partConfig = parts[type];
      if (partConfig.locked) {
        item.classList.add('locked');
        item.setAttribute('draggable', 'false');
      } else {
        item.classList.remove('locked');
        item.setAttribute('draggable', 'true');
        var countEl = item.querySelector('.comp-count');
        if (countEl) {
          countEl.textContent = partConfig.count === Infinity ? '∞' : 'x' + partConfig.count;
        }
        var lockEl = item.querySelector('.comp-lock');
        if (lockEl) lockEl.remove();
        if (type === 'switch') {
          unlockSwitchItem(item);
          if (levelId === '2-1') {
            var nameEl = item.querySelector('.comp-name');
            if (nameEl) {
              nameEl.innerHTML = 'Switch <span style="color:#27AE60;font-size:10px;font-weight:700;">NEW!</span>';
            }
          }
        }
      }
    });
  }

  function unlockSwitchItem(item) {
    var nameEl = item.querySelector('.comp-name');
    if (nameEl) nameEl.style.opacity = '1';
    var iconSvg = item.querySelectorAll('svg [opacity]');
    iconSvg.forEach(function(el) { el.setAttribute('opacity', '1'); });
  }

  function setupSandboxUI() {
    var badge = document.getElementById('levelIdBadge');
    if (badge) badge.textContent = 'LAB';
    var hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.style.display = 'none';
    var starDisplay = document.getElementById('starDisplay');
    if (starDisplay) starDisplay.style.display = 'none';
    var statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = 'Sandbox mode — build freely and power any complete circuit.';
    var bottomRight = document.querySelector('.bottom-right .hint-text');
    if (bottomRight) bottomRight.textContent = 'No stars, no timer — just experiment.';
  }

  function startTimer() {
    var stored = ProgressStore.getLevelStart(levelId);
    if (stored) {
      startTime = stored;
    } else {
      ProgressStore.startLevelAttempt(levelId, startTime);
    }

    var display = document.getElementById('timerDisplay');
    timerInterval = setInterval(function() {
      var elapsed = Math.floor((Date.now() - startTime) / 1000);
      var min = String(Math.floor(elapsed / 60)).padStart(2, '0');
      var sec = String(elapsed % 60).padStart(2, '0');
      display.textContent = min + ':' + sec;
    }, 1000);
  }

  function getElapsed() {
    return Math.floor((Date.now() - startTime) / 1000);
  }

  function onPowerOn() {
    if (levelComplete) return;
    powered = !powered;

    // Notify tutorial system (advances step 5 if active)
    if (!isSandbox) Tutorial.onPowerClick();

    if (powered) {
      var result = CircuitEngine.evaluate(config);

      if (result.status === 'closed') {
        if (isSandbox) {
          onSandboxPowered(result);
          return;
        }
        levelComplete = true;
        clearInterval(timerInterval);
        Feedback.hideSparky();
        var elapsed = getElapsed();
        Feedback.showSuccess(result, elapsed);
      } else if (result.status === 'open') {
        Feedback.showError(result);
        setTimeout(function() {
          powered = false;
          document.getElementById('powerBtn').classList.remove('powered');
        }, 1500);
      } else if (result.status === 'short') {
        Feedback.showError(result);
        setTimeout(function() {
          powered = false;
          document.getElementById('powerBtn').classList.remove('powered');
        }, 1500);
      } else {
        Feedback.showSparky(result.message, 'OK');
        powered = false;
      }

      if (powered || levelComplete) {
        document.getElementById('powerBtn').classList.add('powered');
      }
    } else {
      document.getElementById('powerBtn').classList.remove('powered');
      ParticleSystem.stop();
      Components.getByType('bulb').forEach(function(b) { Components.setBulbLit(b.uid, false); });
    }
  }

  function onSandboxPowered(result) {
    ParticleSystem.startFlow(result);
    var litBulbs = result.bulbs || [result.bulb];
    litBulbs.forEach(function(bulb) {
      if (bulb) Components.setBulbLit(bulb.uid, true);
    });
    document.getElementById('powerBtn').classList.add('powered');
    var statusDot = document.getElementById('statusDot');
    var statusText = document.getElementById('statusText');
    if (statusDot) statusDot.classList.add('connected');
    if (statusText) statusText.textContent = 'Sandbox circuit powered. Change the wiring or press Power On again to stop.';
  }

  function onKeyDown(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      onPowerOn();
    } else if (e.ctrlKey && e.code === 'KeyZ') {
      e.preventDefault();
      UndoRedo.undo();
    } else if (e.ctrlKey && e.code === 'KeyY') {
      e.preventDefault();
      UndoRedo.redo();
    } else if (e.code === 'Delete' || e.code === 'Backspace') {
      onDelete();
    } else if (e.code === 'Escape') {
      Wiring.cancelDraw();
    }
  }

  function onDelete() {
    // If a wire is selected, delete it
    var allWires = Wiring.getAll();
    var selectedId = Wiring.getSelectedWireId ? Wiring.getSelectedWireId() : null;
    if (selectedId) {
      Wiring.removeWire(selectedId);
      return;
    }
    // Otherwise delete last wire
    if (allWires.length > 0) {
      Wiring.removeWire(allWires[allWires.length - 1].id);
    }
  }

  function onClear() {
    if (!confirm('Clear all components and wires?')) return;
    Components.clearAll();
    Wiring.clearAll();
    ParticleSystem.stop();
    UndoRedo.clear();
    Feedback.hideSparky();
    powered = false;
    document.getElementById('powerBtn').classList.remove('powered');

    // Re-place components from config
    if (config && config.workbench.prePlace) {
      var cols = Grid.getCols();
      var rows = Grid.getRows();
      config.workbench.prePlace.forEach(function(item) {
        var comp = Components.create(item.type, Math.floor(cols * item.colRatio), Math.floor(rows * item.rowRatio));
        if (comp) {
          Components.renderToDOM(comp);
          DragDrop.setupComponentDrag(comp);
        }
      });
    }

    DragDrop.updateStatus();
  }

  function onHint() {
    if (isSandbox) return;
    ProgressStore.markHintUsed(levelId);
    var hintText;
    if (levelId === '2-1') {
      var switches = Components.getByType('switch');
      if (switches.length === 0) {
        hintText = 'Drag the Switch from the parts panel onto the board, then wire it into the circuit in series!';
      } else {
        var sw = switches[0];
        if (!sw.switchClosed) {
          hintText = 'The switch is open! Click it on the board to close it, then power on.';
        } else {
          hintText = 'Make sure wires connect: Battery(+) → Switch → Bulb → Battery(-). Every port needs a wire!';
        }
      }
    } else {
      hintText = 'Make sure current flows from the battery (+), through the bulb, and back to (-). Each port needs a wire connected!';
    }
    Feedback.showSparky(hintText, 'Got it!');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
