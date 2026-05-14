// Level configuration data
const LevelConfig = (function() {
  var LEVELS = {
    '1-1': {
      id: '1-1',
      chapter: 1,
      title: 'First Light',
      briefing: {
        cutsceneBadge: 'CH.01 . SCENE 01 . NIGHT',
        sceneImage: 'assets/images/night-scene.png',
        dialogueSpeaker: 'LUNA . NIGHT LIGHT OWNER',
        dialogueText: "My night light stopped working! Can you help me fix it? Mochi is scared of the dark...",
        goalText: 'Build a complete circuit to light up the bulb.',
        availableParts: ['Battery x1', 'Bulb x1', 'Wire (unlimited)'],
        tipText: 'Sparky will guide you through the first level step by step. Press SPACE to skip dialogue.',
        threeStarTime: 120
      },
      workbench: {
        prePlace: [
          { type: 'battery', colRatio: 0.3, rowRatio: 0.5 }
        ],
        partsPanel: {
          battery: { count: 1, locked: false },
          bulb: { count: 1, locked: false },
          wire: { count: Infinity, locked: false },
          switch: { count: 0, locked: true }
        }
      },
      circuitGoal: { type: 'closed', requiredBulbs: 1 },
      tutorialMode: 'full',
      success: {
        dialogue: "Great job! Mochi isn't scared anymore! Luna says thank you!",
        knowledgeTitle: 'Knowledge: Closed Circuit',
        knowledgeItems: [
          'Current flows from battery (+) terminal',
          'Passes through a load (like a bulb)',
          'Returns to battery (-) terminal',
          'This complete path is a "closed circuit"',
          'The circuit must be closed for current to flow'
        ],
        knowledgeMotto: 'Remember: electricity needs a complete loop!'
      }
    },
    '2-1': {
      id: '2-1',
      chapter: 2,
      title: 'Light Switch',
      briefing: {
        cutsceneBadge: 'CH.02 . SCENE 01 . HALLWAY',
        sceneImage: 'assets/images/luna-mochi-scene.png',
        dialogueSpeaker: 'LUNA . HALLWAY LIGHT',
        dialogueText: "I can't turn the hallway light off! It stays on all day. Can you add a switch so I can control it?",
        goalText: 'Add a switch to the circuit. Close the switch, then power on to light the bulb.',
        availableParts: ['Battery x1', 'Bulb x1', 'Switch x1 (NEW!)', 'Wire (unlimited)'],
        tipText: 'Drag the Switch onto the board. Click a placed switch to toggle it open/closed!',
        threeStarTime: 120
      },
      workbench: {
        prePlace: [
          { type: 'battery', colRatio: 0.2, rowRatio: 0.5 },
          { type: 'bulb', colRatio: 0.65, rowRatio: 0.5 }
        ],
        partsPanel: {
          battery: { count: 1, locked: false },
          bulb: { count: 1, locked: false },
          wire: { count: Infinity, locked: false },
          switch: { count: 1, locked: false }
        }
      },
      circuitGoal: { type: 'closed', requiredBulbs: 1 },
      tutorialMode: 'hints',
      success: {
        dialogue: "Now you can control the light! Flip the switch on and off. Luna loves it!",
        knowledgeTitle: 'Knowledge: Switches',
        knowledgeItems: [
          'A switch acts like a "gate" in the circuit',
          'Switch open = circuit broken, current stops',
          'Switch closed = circuit complete, current flows',
          'Switches must be in series with the load',
          'Most real circuits have switches for safety and control'
        ],
        knowledgeMotto: 'Think of a switch like a faucet for electricity!'
      }
    },
    '3-1': {
      id: '3-1',
      chapter: 3,
      title: 'Two Lights, One Path',
      briefing: {
        cutsceneBadge: 'CH.03 . SCENE 01 . WORKSHOP',
        sceneImage: 'assets/images/workshop-scene.png',
        dialogueSpeaker: 'SPARKY . REPAIR ASSISTANT',
        dialogueText: 'The workshop sign has two dim bulbs. Can you wire both bulbs in one complete path?',
        goalText: 'Build a series circuit so current flows through two bulbs in one loop.',
        availableParts: ['Battery x1', 'Bulb x2', 'Wire (unlimited)'],
        tipText: 'In a series circuit, current has only one path and must pass through both bulbs.',
        threeStarTime: 150
      },
      workbench: {
        prePlace: [
          { type: 'battery', colRatio: 0.2, rowRatio: 0.5 }
        ],
        partsPanel: {
          battery: { count: 1, locked: false },
          bulb: { count: 2, locked: false },
          wire: { count: Infinity, locked: false },
          switch: { count: 0, locked: true }
        }
      },
      circuitGoal: { type: 'series', requiredBulbs: 2 },
      tutorialMode: 'hints',
      success: {
        dialogue: 'Both workshop lights glow from one path. That is a true series circuit!',
        knowledgeTitle: 'Knowledge: Series Circuit',
        knowledgeItems: [
          'A series circuit has one single current path',
          'Current passes through each load one after another',
          'If one part is disconnected, the whole loop opens',
          'Adding more bulbs in series can make each bulb dimmer',
          'Series circuits are useful when one control should affect every load'
        ],
        knowledgeMotto: 'Series means one path, one after another.'
      }
    },
    '4-1': {
      id: '4-1',
      chapter: 4,
      title: 'Branching Lights',
      briefing: {
        cutsceneBadge: 'CH.04 . SCENE 01 . TOWN SQUARE',
        sceneImage: 'assets/images/town-square-scene.png',
        dialogueSpeaker: 'LUNA . FESTIVAL HELPER',
        dialogueText: 'The festival lanterns need separate branches. Can both lights connect across the battery?',
        goalText: 'Build a parallel circuit with two bulbs on separate branches.',
        availableParts: ['Battery x1', 'Bulb x2', 'Wire (unlimited)'],
        tipText: 'In a parallel circuit, each bulb has its own path between the battery terminals.',
        threeStarTime: 180
      },
      workbench: {
        prePlace: [
          { type: 'battery', colRatio: 0.18, rowRatio: 0.5 },
          { type: 'bulb', colRatio: 0.62, rowRatio: 0.35 },
          { type: 'bulb', colRatio: 0.62, rowRatio: 0.65 }
        ],
        partsPanel: {
          battery: { count: 1, locked: false },
          bulb: { count: 2, locked: false },
          wire: { count: Infinity, locked: false },
          switch: { count: 0, locked: true }
        }
      },
      circuitGoal: { type: 'parallel', requiredBulbs: 2 },
      tutorialMode: 'hints',
      success: {
        dialogue: 'The lanterns each have their own branch. The town square is bright again!',
        knowledgeTitle: 'Knowledge: Parallel Circuit',
        knowledgeItems: [
          'A parallel circuit has more than one current path',
          'Each load connects across the battery terminals',
          'One branch can still work when another branch opens',
          'Parallel circuits are common in home lighting',
          'Branches let devices work independently'
        ],
        knowledgeMotto: 'Parallel means separate branches sharing the same source.'
      }
    },
    'sandbox': {
      id: 'sandbox',
      mode: 'sandbox',
      scoring: false,
      chapter: 0,
      title: 'Sandbox Lab',
      workbench: {
        prePlace: [
          { type: 'battery', colRatio: 0.2, rowRatio: 0.5 }
        ],
        partsPanel: {
          battery: { count: 1, locked: false },
          bulb: { count: 3, locked: false },
          wire: { count: Infinity, locked: false },
          switch: { count: 2, locked: false }
        }
      },
      circuitGoal: { type: 'closed', requiredBulbs: 1 },
      tutorialMode: 'none'
    }
  };

  function get(levelId) {
    return LEVELS[levelId] || null;
  }

  function has(levelId) {
    return !!get(levelId);
  }

  function all() {
    return Object.keys(LEVELS).map(function(levelId) {
      return LEVELS[levelId];
    });
  }

  return { get: get, has: has, all: all };
})();
