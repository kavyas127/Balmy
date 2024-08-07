import React, { useEffect, useState } from 'react';
import TopArtists from './TopArtist';
import RestArtists from './RestArtists';

function App() {
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [timeRange, setTimeRange] = useState('long_term');
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');

        if (accessToken) {
            localStorage.setItem('access_token', accessToken);
            setIsLoggedIn(true);
            window.history.replaceState({}, document.title, '/stats'); // Update URL to /stats
        } else {
            const storedToken = localStorage.getItem('access_token');
            if (storedToken) {
                setIsLoggedIn(true);
                window.history.replaceState({}, document.title, '/stats'); // Update URL to /stats
            } else {
                setIsLoggedIn(false);
            }
        }
    }, []);

    const fetchTopArtists = async (token) => {
        try {
            const response = await fetch(`http://localhost:5000/top-artists?access_token=${token}&time_range=${timeRange}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTopArtists(data.items.slice(0, 3));
        } catch (error) {
            console.error('Error fetching top artists:', error);
            alert('Error fetching top artists. Please try again later.');
        }
    };

    const fetchTopTracks = async (token) => {
        try {
            const response = await fetch(`http://localhost:5000/top-tracks?access_token=${token}&time_range=${timeRange}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTopTracks(data.items.slice(0, 10));
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            alert('Error fetching top tracks. Please try again later.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token'); // Clear token from local storage
        setIsLoggedIn(false);
        setActiveSection('');

        // Clear URL parameters to avoid showing access token in URL
        const url = new URL(window.location.href);
        url.searchParams.delete('access_token');
        url.searchParams.delete('refresh_token');
        window.history.replaceState({}, document.title, '/'); // Redirect to home page
    };

    const handleFetchTopArtists = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchTopArtists(token);
            setActiveSection('artists');
        }
    };

    const handleFetchTopTracks = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchTopTracks(token);
            setActiveSection('tracks');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                {isLoggedIn ? (
                    <>
                        <button onClick={handleLogout}>Logout</button>
                        <div>
                            <label htmlFor="timeRange">Select Time Range: </label>
                            <select id="timeRange" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                                <option value="long_term">All time</option>
                                <option value="medium_term">Last 6 Months</option>
                                <option value="short_term">Last Month</option>
                            </select>
                        </div>
                        <div>
                            <button onClick={handleFetchTopArtists}>Fetch Top Artists</button>
                            <button onClick={handleFetchTopTracks}>Fetch Top Tracks</button>
                        </div>
                        {activeSection === 'artists' && (
                            <>
                                <h2>Top Artists</h2>
                                <ul>
                                    {topArtists.length > 0 ? (
                                        topArtists.map(artist => (
                                            <li key={artist.id}>
                                                <img src={artist.images[0]?.url} alt={artist.name} style={{ width: '100px', height: '100px' }} />
                                                <p>{artist.name}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No top artists found</p>
                                    )}
                                </ul>
                            </>
                        )}
                        {activeSection === 'tracks' && (
                            <>
                                <h2>Top Tracks</h2>
                                <ul>
                                    {topTracks.length > 0 ? (
                                        topTracks.map(track => (
                                            <li key={track.id}>
                                                <img src={track.album.images[0]?.url} alt={track.name} style={{ width: '100px', height: '100px' }} />
                                                <p>{track.name}</p>
                                                <p>Album: {track.album.name}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No top tracks found</p>
                                    )}
                                </ul>
                            </>
                        )}
                    </>
                ) : (
                    <div className='firstPage'>
                        <img src="../imgs/bg.png" className='background-img'></img>
                        <img src="../imgs/bg2.png" className='background-img2'></img>
                        <div className='navbar'>
                            <i className="fa-solid fa-meteor"></i>
                            <div className='navbarwrapper'>
                                <a><i className="fa-solid fa-house"></i></a>
                                <a><i className="fa-solid fa-circle-question"></i></a>
                                <a><i className="fa-solid fa-wand-magic-sparkles"></i></a>
                                <a><i className="fa-solid fa-envelope"></i></a>
                            </div>
                        </div>
                        <div className='center-block'>
                            <button className='homebutton'><a href="http://localhost:5000/login">Login with Spotify</a><i className="fa-solid fa-angles-right"></i></button>
                        </div>
                        <div className='most-listened-artists'>
                            <h2 className='div-title-artists'>Most Streamed Artists Worldwide</h2>
                            <div className='artist-lineup'>
                                <a href="http://localhost:5000/login"><TopArtists /></a>
                                <a href="http://localhost:5000/login"><RestArtists num="2" name="Taylor Swift" /></a>
                                <a href="http://localhost:5000/login"><RestArtists num="3" name="Post Malone" /></a>
                                <a href="http://localhost:5000/login"><RestArtists num="4" name="Nicki Minaj" /></a>
                                <a href="http://localhost:5000/login"><RestArtists num="5" name="Billie Eilish" /></a>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
