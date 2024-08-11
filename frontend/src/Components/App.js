import React, { useEffect, useState } from "react";
import TopArtists from "./TopArtist";
import RestArtists from "./RestArtists";
import { toPng } from "html-to-image";

function App() {
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [timeRange, setTimeRange] = useState("long_term");
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");

        if (accessToken) {
            localStorage.setItem("access_token", accessToken);
            setIsLoggedIn(true);
            window.history.replaceState({}, document.title, "/stats"); // Update URL to /stats
        } else {
            const storedToken = localStorage.getItem("access_token");
            if (storedToken) {
                setIsLoggedIn(true);
                window.history.replaceState({}, document.title, "/stats"); // Update URL to /stats
            } else {
                setIsLoggedIn(false);
            }
        }
    }, []);

    const fetchTopArtists = async (token) => {
        try {
            const response = await fetch(
                `http://localhost:5000/top-artists?access_token=${token}&time_range=${timeRange}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setTopArtists(data.items.slice(0, 3));
        } catch (error) {
            console.error("Error fetching top artists:", error);
            alert("Error fetching top artists. Please try again later.");
        }
    };

    const fetchTopTracks = async (token) => {
        try {
            const response = await fetch(
                `http://localhost:5000/top-tracks?access_token=${token}&time_range=${timeRange}`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setTopTracks(data.items.slice(0, 10));
        } catch (error) {
            console.error("Error fetching top tracks:", error);
            alert("Error fetching top tracks. Please try again later.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token"); // Clear token from local storage
        setIsLoggedIn(false);
        setActiveSection("");

        // Clear URL parameters to avoid showing access token in URL
        const url = new URL(window.location.href);
        url.searchParams.delete("access_token");
        url.searchParams.delete("refresh_token");
        window.history.replaceState({}, document.title, "/"); // Redirect to home page
    };

    const handleFetchTopArtists = () => {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetchTopArtists(token);
            setActiveSection("artists");
        }
    };

    const handleFetchTopTracks = () => {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetchTopTracks(token);
            setActiveSection("tracks");
        }
    };

    const downloadImage = (selector, filename) => {
        const element = document.querySelector(selector);
        if (!element) {
            console.error("Element not found:", selector);
            return;
        }

        // Save the original background color
        const originalBackground = element.style.background;

        // Temporarily set the background to red
        element.style.background = "#ff9130"; // or any color you prefer

        toPng(element)
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = filename;
                link.click();
            })
            .catch((error) => {
                console.error("Error capturing the image:", error);
            })
            .finally(() => {
                // Revert the background color to its original state
                element.style.background = originalBackground;
            });
    };

    const handleDownloadArtists = () => {
        downloadImage(".stats-top-artists", "top-artists.png");
    };

    const handleDownloadTracks = () => {
        downloadImage(".stats-top-tracks", "top-tracks.png");
    };

    return (
        <div className="App">
            <header className="App-header">
                {isLoggedIn ? (
                    <>
                        <div className="stats-whole">
                        <i className="fa-solid fa-meteor fa-second"></i>
                            <button onClick={handleLogout} className="logout-botton">Logout</button>
                            <div className="chooser-wrapper">
                                <div className="chooser">
                                    <label htmlFor="timeRange">Select Time Range: </label>
                                    <select
                                        id="timeRange"
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value)}
                                        className="dropdown1"
                                    >
                                        <option value="long_term">All time</option>
                                        <option value="medium_term">Last 6 Months</option>
                                        <option value="short_term">Last Month</option>
                                    </select>
                                </div>
                                <div className="button-chooser">
                                    <button onClick={handleFetchTopArtists} className="buttons">
                                        Fetch Top Artists
                                    </button>
                                    <button onClick={handleFetchTopTracks} className="buttons">Fetch Top Tracks</button>
                                </div>
                            </div>

                            {activeSection === "artists" && (
                                <>
                                    <div className="stats-top-artists">
                                        <h2 className="artist-name-title">Top Artists</h2>
                                        <div className="artists-main-wrapper">
                                            <ol className="artists-align">
                                                {topArtists.length > 0 ? (
                                                    topArtists.map((artist, index) => (
                                                        <li key={artist.id} className="li-artists">
                                                            <p className="numbering2">{index + 1}</p>
                                                            <div className="wapper">
                                                                <img
                                                                    src={artist.images[0]?.url}
                                                                    alt={artist.name}
                                                                    className="top-art-imgs"
                                                                />
                                                                <p className="top-art-name">{artist.name}</p>
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <p className="no-found">No top artists found</p>
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                    <button className="download-artists" onClick={handleDownloadArtists}>Download</button>
                                </>
                            )}

                            {activeSection === "tracks" && (
                                <>
                                    <div className="stats-top-tracks">
                                        <h2 className="artist-name-title">Top Tracks</h2>
                                        <div className="all-tracks">
                                            <ul style={{ display: "grid", gridTemplateColumns: "repeat(5, 15rem)", gap: "25px" }}>
                                                {topTracks.length > 0 ? (
                                                    topTracks.map((track, index) => {
                                                        // Function to extract the alt text if there's a '-' after a ')'
                                                        const getAltText = (name) => {
                                                            const parts = name.split(' - ');
                                                            if (parts.length > 1 && parts[0].endsWith(')')) {
                                                                return parts[0].trim();
                                                            }
                                                            return name;
                                                        };

                                                        const altText = getAltText(track.name);

                                                        return (
                                                            <li key={track.id} style={{ listStyle: "none", textAlign: "center" }}>
                                                                <p className="numbering-tracks">{index + 1}</p>
                                                                <img
                                                                    className="tracks-img"
                                                                    src={track.album.images[0]?.url}
                                                                    alt={altText} // Use the processed name for the alt text
                                                                    style={{ width: "6rem", height: "6rem" }}
                                                                />
                                                                <p>{altText}</p>
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    <p>No top tracks found</p>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <button className="download-artists" onClick={handleDownloadTracks}>Download</button>
                                </>
                            )}
                        </div>
                    </>

                ) : (
                    <div className="firstPage">
                        <img src="../imgs/bg.png" className="background-img"></img>
                        <img src="../imgs/bg2.png" className="background-img2"></img>
                        <div className="navbar">
                            <i className="fa-solid fa-meteor"></i>
                            <div className="navbarwrapper">
                                <a>
                                    <i className="fa-solid fa-house"></i>
                                </a>
                                <a>
                                    <i className="fa-solid fa-circle-question"></i>
                                </a>
                                <a>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                </a>
                                <a>
                                    <i className="fa-solid fa-envelope"></i>
                                </a>
                            </div>
                        </div>
                        <div className="center-block">
                            <button className="homebutton">
                                <a href="http://localhost:5000/login">Login with Spotify</a>
                                <i className="fa-solid fa-angles-right"></i>
                            </button>
                        </div>
                        <div className="most-listened-artists">
                            <h2 className="div-title-artists">
                                Most Streamed Artists Worldwide
                            </h2>
                            <div className="artist-lineup">
                                <a href="http://localhost:5000/login">
                                    <TopArtists />
                                </a>
                                <a href="http://localhost:5000/login">
                                    <RestArtists num="2" name="Taylor Swift" />
                                </a>
                                <a href="http://localhost:5000/login">
                                    <RestArtists num="3" name="Post Malone" />
                                </a>
                                <a href="http://localhost:5000/login">
                                    <RestArtists num="4" name="Nicki Minaj" />
                                </a>
                                <a href="http://localhost:5000/login">
                                    <RestArtists num="5" name="Billie Eilish" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
