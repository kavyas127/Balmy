const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Step 1: Redirect users to Spotify for authorization
app.get('/login', (req, res) => {
    const scopes = 'user-top-read user-read-recently-played';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + CLIENT_ID +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI));
});

// Step 2: Spotify redirects back to your site with the authorization code
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch access token');
        }

        const data = await response.json();
        res.redirect(`http://localhost:3000?access_token=${data.access_token}&refresh_token=${data.refresh_token}`);
    } catch (error) {
        console.error('Error in /callback:', error);
        res.status(500).send('Server error');
    }
});

app.get('/top-artists', async (req, res) => {
    const accessToken = req.query.access_token;
    const timeRange = req.query.time_range || 'long_term';

    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch top artists');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in /top-artists:', error);
        res.status(500).send('Server error');
    }
});

app.get('/top-tracks', async (req, res) => {
    const accessToken = req.query.access_token;
    const timeRange = req.query.time_range || 'long_term';

    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch top tracks');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in /top-tracks:', error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
