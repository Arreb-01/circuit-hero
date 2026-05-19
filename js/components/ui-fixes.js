// UI interaction fixes for workbench page
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // Sparky bubble close button
    var sparkyBubble = document.getElementById('sparkyBubble');
    var sparkyContinueBtn = document.getElementById('sparkyContinue');

    function closeSparkyBubble() {
      if (sparkyBubble) {
        sparkyBubble.classList.add('hidden');
        window.dispatchEvent(new CustomEvent('sparky-closed'));
      }
    }

    if (sparkyContinueBtn) {
      var newBtn = sparkyContinueBtn.cloneNode(true);
      sparkyContinueBtn.parentNode.replaceChild(newBtn, sparkyContinueBtn);
      newBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        closeSparkyBubble();
      });
    }

    // Stage help close button
    var helpCloseBtn = document.getElementById('helpClose');
    var stageInstructionDiv = document.getElementById('stageInstruction');
    if (helpCloseBtn) {
      var newHelpClose = helpCloseBtn.cloneNode(true);
      helpCloseBtn.parentNode.replaceChild(newHelpClose, helpCloseBtn);
      newHelpClose.addEventListener('click', function(e) {
        e.preventDefault();
        if (stageInstructionDiv) {
          stageInstructionDiv.style.display = 'none';
        }
      });
    }

    // Dynamic modal close buttons (auto-close error popups after 3s)
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (!node.classList) return;

          if (node.classList.contains('error-popup') || node.classList.contains('toast-error') || node.id === 'errorHintModal') {
            var closeBtn = node.querySelector('.close-btn, .ok-btn, .confirm-btn');
            if (closeBtn) {
              closeBtn.addEventListener('click', function() { node.remove(); });
            } else {
              setTimeout(function() { if (node && node.remove) node.remove(); }, 3000);
            }
          }

          if (node.classList.contains('sparky-bubble') && node.id === 'sparkyBubble') {
            var continueBtnDynamic = node.querySelector('#sparkyContinue');
            if (continueBtnDynamic && !continueBtnDynamic.hasListenerAttached) {
              continueBtnDynamic.addEventListener('click', function(e) {
                e.stopPropagation();
                node.classList.add('hidden');
              });
              continueBtnDynamic.hasListenerAttached = true;
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Delegated click handler for sparky-continue and modal close buttons
    document.body.addEventListener('click', function(e) {
      var target = e.target;

      if ((target.classList && target.classList.contains('sparky-continue')) ||
          (target.innerText && target.innerText.trim() === 'I got it!')) {
        e.preventDefault();
        e.stopPropagation();
        var bubble = target.closest('.sparky-bubble');
        if (bubble) {
          bubble.classList.add('hidden');
          window.dispatchEvent(new CustomEvent('sparky-closed'));
        } else {
          var bubbleById = document.getElementById('sparkyBubble');
          if (bubbleById) bubbleById.classList.add('hidden');
        }
      }

      if ((target.classList && target.classList.contains('modal-close-btn')) ||
          target.closest('.error-modal-close') ||
          target.innerText === 'OK' || target.innerText === 'Got it') {
        var possibleModal = target.closest('.modal-overlay, .error-toast-container, .custom-alert');
        if (possibleModal && possibleModal.classList) {
          possibleModal.classList.add('hidden');
        }
      }
    });

    // Auto-add close button to dynamically created error hints
    window.addEventListener('circuit-error-shown', function() {
      setTimeout(function() {
        var errorDiv = document.querySelector('.circuit-error-message, .error-hint');
        if (errorDiv && !errorDiv.querySelector('.close-btn')) {
          var closeSpan = document.createElement('button');
          closeSpan.className = 'close-btn';
          closeSpan.textContent = '✕';
          closeSpan.addEventListener('click', function() { errorDiv.remove(); });
          errorDiv.style.position = 'relative';
          errorDiv.appendChild(closeSpan);
        }
      }, 100);
    });

  });
})();
