const createForm = document.getElementById('createForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const searchInput = document.getElementById('searchInput');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createForm.classList.add('loading');

  const url = document.getElementById('url').value;
  const shortcode = document.getElementById('shortcode').value;

  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        shortcode: shortcode || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to create link');
      createForm.classList.remove('loading');
      return;
    }

    showSuccess('Short link created successfully!');
    createForm.reset();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showError('Network error. Please try again.');
    createForm.classList.remove('loading');
  }
});

async function deleteLink(code) {
  if (!confirm('Are you sure you want to delete this link?')) {
    return;
  }

  try {
    const response = await fetch('/api/links/' + code, {
      method: 'DELETE'
    });

    if (response.ok) {
      showSuccess('Link deleted successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showError('Failed to delete link');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

function copyLink(code) {
  const fullUrl = window.location.origin + '/' + code;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showSuccess('Link copied to clipboard!');
  }).catch(() => {
    showError('Failed to copy link');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#linksTableBody tr');
    
    rows.forEach(row => {
      const code = row.getAttribute('data-code').toLowerCase();
      const url = row.getAttribute('data-url');
      
      if (code.includes(searchTerm) || url.includes(searchTerm)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

