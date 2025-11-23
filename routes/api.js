const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { isValidUrl, isValidShortCode, generateShortCode } = require('../utils/validation');

router.post('/links', async (req, res) => {
  try {
    const { url, shortcode, password } = req.body;

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

    const insertData = {
      shortcode: code,
      target_url: url,
      click_count: 0
    };

    if (password && typeof password === 'string' && password.trim() !== '') {
      insertData.password = password.trim();
    }

    const { data, error } = await supabase
      .from('links')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Shortcode already exists' });
      }
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create link: ' + error.message });
    }

    const responseData = {
      ...data,
      has_password: !!(data.password && data.password.trim() !== '')
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/links', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('id, shortcode, target_url, click_count, last_clicked_at, created_at, password')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch links' });
    }

    const linksWithPasswordFlag = data.map(link => ({
      ...link,
      has_password: !!(link.password && link.password.trim() !== ''),
      password: undefined
    }));

    res.json(linksWithPasswordFlag);
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
      .select('id, shortcode, target_url, click_count, last_clicked_at, created_at, password')
      .eq('shortcode', code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const response = {
      ...data,
      has_password: !!(data.password && data.password.trim() !== ''),
      password: undefined
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { password } = req.body;

    const { data: link, error: fetchError } = await supabase
      .from('links')
      .select('password')
      .eq('shortcode', code)
      .single();

    if (fetchError || !link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.password && link.password.trim() !== '') {
      if (!password || password.trim() === '') {
        return res.status(401).json({ error: 'Password is required to delete this link' });
      }

      if (link.password.trim() !== password.trim()) {
        return res.status(403).json({ error: 'Incorrect password' });
      }
    }

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

