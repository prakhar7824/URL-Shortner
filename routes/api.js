const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isValidUrl, isValidShortCode, generateShortCode } = require('../utils/validation');

router.post('/links', async (req, res) => {
  try {
    const { url, shortcode } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let code = shortcode;

    if (code) {
      if (!isValidShortCode(code)) {
        return res.status(400).json({ 
          error: 'Shortcode must be 6-8 characters and contain only letters and numbers' 
        });
      }

      const { data: existing } = await supabase
        .from('links')
        .select('shortcode')
        .eq('shortcode', code)
        .single();

      if (existing) {
        return res.status(409).json({ error: 'Shortcode already exists' });
      }
    } else {
      let attempts = 0;
      let isUnique = false;

      while (!isUnique && attempts < 10) {
        code = generateShortCode(6);
        const { data: existing } = await supabase
          .from('links')
          .select('shortcode')
          .eq('shortcode', code)
          .single();

        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Failed to generate unique shortcode' });
      }
    }

    const { data, error } = await supabase
      .from('links')
      .insert({
        shortcode: code,
        target_url: url,
        click_count: 0
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Shortcode already exists' });
      }
      return res.status(500).json({ error: 'Failed to create link' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/links', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch links' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/links/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('shortcode', code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/links/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('shortcode', code);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete link' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

