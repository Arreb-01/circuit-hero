// Mission Briefing page JavaScript
(function() {
  'use strict';

  // Typewriter effect for dialogue
  const dialogueEl = document.getElementById('dialogueText');
  const fullText = "My night light stopped working! Can you help me fix it? Mochi is scared of the dark...";
  let charIndex = 0;

  function typeWriter() {
    if (charIndex < fullText.length) {
      dialogueEl.textContent = fullText.substring(0, charIndex + 1);
      dialogueEl.classList.add('typing-cursor');
      charIndex++;
      setTimeout(typeWriter, 40);
    } else {
      dialogueEl.classList.remove('typing-cursor');
    }
  }

  setTimeout(typeWriter, 800);

  // Skip dialogue with spacebar
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (charIndex < fullText.length) {
        charIndex = fullText.length;
        dialogueEl.textContent = fullText;
        dialogueEl.classList.remove('typing-cursor');
      }
    }
  });

  // Start button animation
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Store level start time for timer
    localStorage.setItem('ch_level_start', Date.now().toString());
    window.location.href = 'workbench.html?level=1-1';
  });
})();
