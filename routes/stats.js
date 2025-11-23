const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { renderTemplate } = require('../utils/template');

router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('shortcode', code)
      .single();

    if (error || !data) {
      const html = renderTemplate('error');
      return res.status(404).send(html);
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const html = renderTemplate('stats', {
      code: code,
      shortcode: data.shortcode,
      target_url: data.target_url,
      click_count: data.click_count,
      last_clicked: formatDate(data.last_clicked_at),
      created_at: formatDate(data.created_at)
    });
    res.send(html);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

