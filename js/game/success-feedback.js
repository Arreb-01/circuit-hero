// Success feedback and error handling
const Feedback = (function() {
  let sparkyBubble, sparkyText, sparkyContinue;

  function init() {
    sparkyBubble = document.getElementById('sparkyBubble');
    sparkyText = document.getElementById('sparkyText');
    sparkyContinue = document.getElementById('sparkyContinue');
  }

  function showSparky(text, buttonText, callback) {
    sparkyText.textContent = '';
    sparkyBubble.classList.remove('hidden');
    sparkyContinue.textContent = buttonText || 'I got it!';
    sparkyContinue.onclick = () => {
      if (callback) callback();
    };

    // Typewriter effect
    let i = 0;
    function type() {
      if (i < text.length) {
        sparkyText.textContent += text[i];
        i++;
        setTimeout(type, 30);
      }
    }
    type();
  }

  function hideSparky() {
    sparkyBubble.classList.add('hidden');
  }

  function showSuccess(result, elapsed) {
    hideSparky();
    ParticleSystem.startFlow(result);

    // Light up the bulb
    Components.setBulbLit(result.bulb.uid, true);

    // Calculate stars
    let stars = 1;
    const usedHint = localStorage.getItem('ch_used_hint') === 'true';
    if (!usedHint) stars = 2;
    if (!usedHint && elapsed <= 120) stars = 3;

    // Show success modal after a delay
    setTimeout(() => {
      const modal = document.getElementById('successModal');
      modal.classList.remove('hidden');

      // Render stars
      const starsContainer = document.getElementById('resultStars');
      starsContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'star ' + (i < stars ? 'star-filled' : 'star-empty'));
        svg.setAttribute('viewBox', '0 0 18 18');
        svg.style.width = '32px';
        svg.style.height = '32px';
        svg.innerHTML = '<path d="M9 1l2.2 4.5 4.8.7-3.5 3.4.8 4.9L9 12.2 4.7 14.5l.8-4.9L2 6.2l4.8-.7z" fill="currentColor"/>';
        if (i < stars) {
          svg.style.animationDelay = (i * 0.2) + 's';
        }
        starsContainer.appendChild(svg);
      }

      // Show dialogue
      const dialogue = document.getElementById('successDialogue');
      dialogue.textContent = 'Great job! Mochi isn\'t scared anymore! Luna says thank you!';
    }, 2000);
  }

  function showError(result) {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    statusDot.classList.remove('connected');
    statusDot.style.background = 'var(--color-danger)';

    if (result.status === 'open') {
      statusText.textContent = 'Open circuit! Current stopped midway.';
      showSparky(
        'Current ran halfway and stopped! Like walking to a broken bridge — can\'t cross! Connect all ports to complete the loop.',
        'Let me try again!'
      );
    } else if (result.status === 'short') {
      statusText.textContent = 'Short circuit! Too much current!';
      document.querySelector('.stage').classList.add('shake');
      setTimeout(() => document.querySelector('.stage').classList.remove('shake'), 300);
      showSparky(
        'Danger! Current rushes straight from (+) to (-) without going through the bulb — that\'s a short circuit! It\'s like a road with no traffic light!',
        'I\'ll fix it!'
      );
    }

    hideSparkyAfterDelay();
  }

  function hideSparkyAfterDelay() {
    // Sparky stays until user clicks, but also auto-hide after a while
  }

  return { init, showSparky, hideSparky, showSuccess, showError };
})();
