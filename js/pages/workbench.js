// Workbench main controller
(function() {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const levelId = params.get('level') || '1-1';
  let timerInterval = null;
  let startTime = Date.now();
  let powered = false;
  let levelComplete = false;

  function init() {
    // Initialize all subsystems
    Grid.init();
    Wiring.init();
    ParticleSystem.init();
    Feedback.init();

    // Delay DragDrop init to ensure components are in DOM
    setTimeout(() => {
      DragDrop.init();
    }, 100);

    // Pre-place battery for level 1-1
    if (levelId === '1-1') {
      const stageGrid = document.getElementById('stageGrid');
      // Place battery at center-left of the grid
      setTimeout(() => {
        const cols = Grid.getCols();
        const rows = Grid.getRows();
        const battery = Components.create('battery', Math.floor(cols * 0.3), Math.floor(rows / 2));
        if (battery) {
          Components.renderToDOM(battery);
          DragDrop.setupComponentDrag(battery);
          // Battery is pre-placed for level 1-1
        }
      }, 200);
    }

    // Start tutorial
    setTimeout(() => {
      Tutorial.init(levelId);
    }, 600);

    // Timer
    startTimer();

    // Power button
    document.getElementById('powerBtn').addEventListener('click', onPowerOn);

    // Keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);

    // Tool buttons
    document.getElementById('undoBtn').addEventListener('click', () => UndoRedo.undo());
    document.getElementById('redoBtn').addEventListener('click', () => UndoRedo.redo());
    document.getElementById('deleteBtn').addEventListener('click', onDelete);
    document.getElementById('clearBtn').addEventListener('click', onClear);

    // Hint button
    document.getElementById('hintBtn').addEventListener('click', onHint);

    // Help close
    document.getElementById('helpClose').addEventListener('click', () => {
      document.getElementById('stageInstruction').style.display = 'none';
    });

    // Window resize
    window.addEventListener('resize', () => {
      Grid.resize();
      Wiring.resize();
      ParticleSystem.resize();
    });
  }

  function startTimer() {
    const stored = localStorage.getItem('ch_level_start');
    if (stored) startTime = parseInt(stored);

    const display = document.getElementById('timerDisplay');
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const sec = String(elapsed % 60).padStart(2, '0');
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
    Tutorial.onPowerClick();

    if (powered) {
      const result = CircuitEngine.evaluate();

      if (result.status === 'closed') {
        levelComplete = true;
        clearInterval(timerInterval);
        Feedback.hideSparky();
        const elapsed = getElapsed();
        Feedback.showSuccess(result, elapsed);
      } else if (result.status === 'open') {
        Feedback.showError(result);
        setTimeout(() => {
          powered = false;
          document.getElementById('powerBtn').classList.remove('powered');
        }, 1500);
      } else if (result.status === 'short') {
        Feedback.showError(result);
        setTimeout(() => {
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
      Components.getByType('bulb').forEach(b => Components.setBulbLit(b.uid, false));
    }
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
    // Delete last placed component or last wire
    const wires = Wiring.getAll();
    if (wires.length > 0) {
      Wiring.removeWire(wires[wires.length - 1].id);
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

    // Re-place battery for 1-1
    if (levelId === '1-1') {
      const cols = Grid.getCols();
      const rows = Grid.getRows();
      const battery = Components.create('battery', Math.floor(cols * 0.3), Math.floor(rows / 2));
      if (battery) {
        Components.renderToDOM(battery);
        DragDrop.setupComponentDrag(battery);
      }
    }

    DragDrop.updateStatus();
  }

  function onHint() {
    localStorage.setItem('ch_used_hint', 'true');
    Feedback.showSparky(
      'Hint: Make sure current flows from the battery (+), through the bulb, and back to (-). Each port needs a wire connected!',
      'Got it!'
    );
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
