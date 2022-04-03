import React from 'react';
import { Link } from 'react-router-dom';
import marvel from '../images/gif-marvel-53.gif';

const Home = () => {
    return (
        <div className= "homeContent">
            <h1> Welcome to the React.js Marvel API Example</h1>
            <img  className= "marvelGif" src={marvel}  alt ="marvel"/>
            <hr/>
            <div>
                <Link to="/characters/page/0">Characters</Link>
            </div>
            <div>
                <Link to="/comics/page/0">Comics</Link>
            </div>
             <div>
                <Link to="/series/page/0">Series</Link>
            </div>
        </div>    
    )
}

export default Home