// js/level.js
let selectedLevel = null;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('.back-btn').addEventListener('click', function () {
    window.history.back();
  });

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      selectedLevel = this.getAttribute('data-level');

      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  document.getElementById('start-btn').addEventListener('click', function () {
    if (!selectedLevel) {
      alert('Please select a level to start the game.');
      return;
    }
    localStorage.setItem('selectedLevel', selectedLevel);
    window.location.href = 'Game.html';
  });
});
