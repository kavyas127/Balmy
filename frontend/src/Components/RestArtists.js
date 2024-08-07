import React from "react";

function RestArtists(props){
    return(
    <div className="rest-artists">
        <h1 className="num2">#{props.num}</h1>
        <h1 className="artist-name2">{props.name}</h1>
        <i class="fa-regular fa-circle-play"></i>
    </div>
    );
}

export default RestArtists;