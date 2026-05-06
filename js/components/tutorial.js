// Sparky tutorial engine for Level 1-1
const Tutorial = (function() {
  let currentStep = -1;
  let active = false;
  let steps = [];
  let waitingForEvent = false;

  function init(levelId) {
    if (levelId !== '1-1') return;
    active = true;

    steps = [
      {
        text: 'Hi! I\'m Sparky, your helper! To fix the night light, we need current to flow from the battery, through the bulb, and back — that\'s a closed circuit!',
        trigger: 'click',
        highlight: null
      },
      {
        text: 'First, drag the Bulb from the parts panel onto the workbench!',
        trigger: 'component-placed',
        filter: (d) => d.type === 'bulb',
        highlight: 'bulbPanelItem'
      },
      {
        text: 'Great! Now click the battery\'s red (+) port, then click one of the bulb\'s ports to connect them with a wire.',
        trigger: 'wire-connected',
        highlight: null,
        afterHighlight: 'pos'
      },
      {
        text: 'Nice! Now connect the bulb\'s other port back to the battery\'s black (-) port to complete the loop.',
        trigger: 'wire-connected',
        highlight: null,
        afterHighlight: 'neg'
      },
      {
        text: 'The circuit looks complete! Click the Power On button to test it!',
        trigger: 'click-power',
        highlight: 'powerBtn'
      }
    ];

    // Listen to circuit events
    document.addEventListener('circuit:component-placed', onEvent);
    document.addEventListener('circuit:wire-connected', onEvent);

    // Start first step after a delay to let everything render
    setTimeout(() => advance(), 800);
  }

  function advance() {
    if (!active) return;
    currentStep++;

    if (currentStep >= steps.length) {
      Feedback.hideSparky();
      return;
    }

    const step = steps[currentStep];
    waitingForEvent = (step.trigger !== 'click' && step.trigger !== 'click-power');

    // Apply highlights
    clearHighlights();
    if (step.highlight) {
      const el = document.getElementById(step.highlight);
      if (el) el.classList.add('highlight');
    }

    // Highlight ports for wire steps
    if (step.afterHighlight === 'pos') {
      highlightBatteryPort('pos');
    } else if (step.afterHighlight === 'neg') {
      highlightBatteryPort('neg');
    }
    if (step.highlight === 'powerBtn') {
      const btn = document.getElementById('powerBtn');
      if (btn) btn.classList.add('highlight');
    }

    // Show the right button text
    const btnText = step.trigger === 'click' ? 'I got it!' : 'OK';
    const callback = () => {
      if (step.trigger === 'click') {
        advance();
      }
      // For 'click-power', the Sparky bubble just shows info — user clicks Power On separately
    };

    Feedback.showSparky(step.text, btnText, callback);
  }

  function onEvent(e) {
    if (!active || currentStep < 0 || currentStep >= steps.length) return;
    const step = steps[currentStep];
    if (e.type === 'circuit:' + step.trigger) {
      if (step.filter && !step.filter(e.detail)) return;
      clearHighlights();
      advance();
    }
  }

  function highlightBatteryPort(portId) {
    const batteries = Components.getByType('battery');
    if (batteries.length === 0) return;
    const battery = batteries[0];
    if (!battery.element) return;
    const ports = battery.element.querySelectorAll('.port');
    ports.forEach(p => {
      if (p.dataset.portId === portId) {
        p.classList.add('highlight');
      }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  }

  function onPowerClick() {
    if (!active || currentStep < 0 || currentStep >= steps.length) return;
    const step = steps[currentStep];
    if (step.trigger === 'click-power') {
      clearHighlights();
      advance();
    }
  }

  function isActive() { return active; }

  return { init, advance, isActive, onPowerClick };
})();
