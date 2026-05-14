// Story Map page JavaScript
(function() {
  'use strict';

  // Show user greeting
  const username = localStorage.getItem('ch_username');
  const greeting = document.getElementById('userGreeting');
  if (greeting && username) {
    greeting.textContent = 'Hi, ' + username + '!';
  }

  function renderStars(container, count) {
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var star = document.createElement('span');
      star.className = i < count ? 'star-filled' : 'star-empty';
      star.textContent = '★';
      container.appendChild(star);
    }
  }

  function applyProgress(progress) {
    var levels = progress && progress.levels ? progress.levels : {};
    document.querySelectorAll('.chapter-node').forEach(function(node) {
      var chapter = node.dataset.chapter;
      var levelId = chapter + '-1';
      var levelProgress = levels[levelId];
      var stars = levelProgress && levelProgress.completed ? levelProgress.stars : 0;
      var available = LevelConfig.has(levelId);

      node.classList.remove('completed', 'current', 'unlocked', 'locked');
      if (!available) {
        node.classList.add('locked');
      } else if (levelProgress && levelProgress.completed) {
        node.classList.add('completed');
      } else if (chapter === '1' || levels[(Number(chapter) - 1) + '-1']) {
        node.classList.add(chapter === '1' ? 'current' : 'unlocked');
      } else {
        node.classList.add('locked');
      }

      renderStars(node.querySelector('.node-stars'), stars);
    });
  }

  ProgressStore.loadRemoteProgress().then(applyProgress);

  document.querySelectorAll('.tab-item[data-target]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      window.location.href = tab.dataset.target;
    });
  });

  // Chapter node click handlers
  document.querySelectorAll('.chapter-node').forEach(node => {
    node.addEventListener('click', () => {
      const chapter = node.dataset.chapter;

      if (node.classList.contains('locked')) {
        showTip('Complete the previous chapter to unlock this one!');
        return;
      }

      if (node.classList.contains('completed') || node.classList.contains('current') || node.classList.contains('unlocked')) {
        var levelId = chapter + '-1';
        if (!LevelConfig.has(levelId)) {
          showTip('This chapter is coming soon.');
          return;
        }
        window.location.href = 'mission-briefing.html?chapter=' + chapter + '&level=' + levelId;
      }
    });
  });

  function showTip(text) {
    const tip = document.querySelector('.map-tip-content');
    tip.textContent = text;
    tip.parentElement.style.opacity = '1';
    setTimeout(() => {
      tip.textContent = 'Click a chapter to start your adventure! Completed chapters glow gold.';
    }, 3000);
  }

  // Animate path gold fill
  setTimeout(() => {
    const goldPath = document.getElementById('mapPathGold');
    if (goldPath) {
      goldPath.style.transition = 'stroke-dashoffset 1.5s ease';
      goldPath.style.strokeDashoffset = '0';
    }
  }, 500);
})();
