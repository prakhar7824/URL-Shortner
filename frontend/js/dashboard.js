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

const passwordInput = document.getElementById('password');
const passwordWarning = document.getElementById('passwordWarning');

if (passwordInput) {
  passwordInput.addEventListener('input', () => {
    if (passwordInput.value.trim() === '') {
      passwordWarning.style.display = 'block';
    } else {
      passwordWarning.style.display = 'none';
    }
  });

  passwordInput.addEventListener('blur', () => {
    if (passwordInput.value.trim() === '') {
      passwordWarning.style.display = 'block';
    }
  });
}

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('password').value.trim();
  
  if (!password || password === '') {
    const confirmNoPassword = confirm('⚠️ WARNING: You are not setting a password. Anyone who can access this dashboard can delete your link. You are responsible if the link is lost or deleted by someone else.\n\nDo you want to continue without a password?');
    if (!confirmNoPassword) {
      return;
    }
  }

  createForm.classList.add('loading');

  const url = document.getElementById('url').value;
  const shortcode = document.getElementById('shortcode').value;

  try {
    const requestBody = {
      url: url,
      shortcode: shortcode || undefined
    };

    if (password && password !== '') {
      requestBody.password = password;
    }

    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
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

  let password = '';
  let passwordPrompted = false;

  try {
    const response = await fetch('/api/links/' + code, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: password || undefined
      })
    });

    if (response.ok) {
      showSuccess('Link deleted successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    const errorData = await response.json();

    if (response.status === 401 && !passwordPrompted) {
      password = prompt('This link is password protected. Enter the password to delete:');
      if (!password) {
        return;
      }
      passwordPrompted = true;

      const retryResponse = await fetch('/api/links/' + code, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password
        })
      });

      if (retryResponse.ok) {
        showSuccess('Link deleted successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const retryErrorData = await retryResponse.json();
        showError(retryErrorData.error || 'Incorrect password. Please try again.');
      }
    } else {
      showError(errorData.error || 'Failed to delete link');
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

