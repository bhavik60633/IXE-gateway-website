// Form Submit Handler
document.getElementById('enquiryForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const btn = document.querySelector('.submit-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending...';

  // Simulate submission
  setTimeout(function() {
    const email = document.getElementById('email').value;
    const ref = 'IXE-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    document.getElementById('confirmEmail').textContent = email;
    document.getElementById('refId').textContent = ref;
    document.getElementById('successModal').style.display = 'flex';

    btn.disabled = false;
    btn.textContent = originalText;
  }, 1200);
});

// Reset form
function resetForm() {
  document.getElementById('successModal').style.display = 'none';
  document.getElementById('enquiryForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modal when clicking outside
document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});
