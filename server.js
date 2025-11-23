require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');
const redirectRoutes = require('./routes/redirect');
const statsRoutes = require('./routes/stats');
const healthzRoutes = require('./routes/healthz');
const { renderTemplate } = require('./utils/template');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, 'frontend/css')));
app.use('/js', express.static(path.join(__dirname, 'frontend/js')));

app.use('/api', apiRoutes);
app.use('/healthz', healthzRoutes);
app.use('/code', statsRoutes);

app.get('/', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data: links, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching links:', error);
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const truncateUrl = (url, maxLength = 50) => {
      if (url.length <= maxLength) return url;
      return url.substring(0, maxLength) + '...';
    };

    let linksTable = '';
    if (links && links.length > 0) {
      linksTable = `
                  <table>
                    <thead>
                      <tr>
                        <th>Short Code</th>
                        <th>Target URL</th>
                        <th>Clicks</th>
                        <th>Last Clicked</th>
                        <th>Protection</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
          <tbody id="linksTableBody">
            ${links.map(link => `
              <tr data-code="${link.shortcode}" data-url="${link.target_url.toLowerCase()}" data-has-password="${link.has_password || false}">
                <td class="shortcode">${link.shortcode}</td>
                <td class="url-cell" title="${link.target_url}">${truncateUrl(link.target_url)}</td>
                <td>${link.click_count}</td>
                <td>${formatDate(link.last_clicked_at)}</td>
                <td>
                  ${link.has_password ? '<span class="password-protected">🔒 Protected</span>' : '<span class="no-password">⚠️ No Password</span>'}
                </td>
                <td class="actions-cell">
                  <a href="/code/${link.shortcode}" class="btn btn-secondary" style="padding: 8px 16px; font-size: 14px;">Stats</a>
                  <button onclick="deleteLink('${link.shortcode}')" class="btn btn-danger" style="padding: 8px 16px; font-size: 14px;">Delete</button>
                  <button onclick="copyLink('${link.shortcode}')" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px;">Copy</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      linksTable = `
        <div class="empty-state">
          <h3>No links yet</h3>
          <p>Create your first short link above!</p>
        </div>
      `;
    }

    const html = renderTemplate('dashboard', { linksTable });
    res.send(html);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send('Internal server error');
  }
});

app.use('/', redirectRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Healthcheck: http://localhost:${PORT}/healthz`);
});

