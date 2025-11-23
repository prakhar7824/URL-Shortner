const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isValidShortCode } = require('../utils/validation');
const { renderTemplate } = require('../utils/template');

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!isValidShortCode(code)) {
      const html = renderTemplate('error');
      return res.status(404).send(html);
    }

    const { data, error } = await supabase
      .from('links')
      .select('target_url')
      .eq('shortcode', code)
      .single();

    if (error || !data) {
      const html = renderTemplate('error');
      return res.status(404).send(html);
    }

    const { data: currentLink } = await supabase
      .from('links')
      .select('click_count')
      .eq('shortcode', code)
      .single();

    if (currentLink) {
      await supabase
        .from('links')
        .update({
          click_count: currentLink.click_count + 1,
          last_clicked_at: new Date().toISOString()
        })
        .eq('shortcode', code);
    }

    res.redirect(302, data.target_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

