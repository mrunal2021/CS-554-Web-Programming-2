import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  makeStyles
} from '@material-ui/core';
import noImage from '../images/no-image.jpeg';
import NotFound from './NotFound';

import '../App.css';

const md5 = require('blueimp-md5');

const publickey = process.env.REACT_APP_PUBLIC_KEY;
const privatekey = process.env.REACT_APP_PRIVATE_KEY;

const useStyles = makeStyles({
  card: {
    maxWidth: 450,
    height: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 5,
    border: '1px solid #1e8678',
    boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
  },
  titleHead: {
    borderBottom: '1px solid #1e8678',
    fontWeight: 'bold'
  },
  grid: {
    flexGrow: 1,
    flexDirection: 'row'
  },
  media: {
    height: '100%',
    width: '100%'
  },
  button: {
    color: '#1e8678',
    fontWeight: 'bold',
    fontSize: 12
  }
});

function urlGenerator(id) {
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters/' + id;
    const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
    console.log(url);
    return url;
}

function SingleCharacter(props) {
    //console.log(url);
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [characterData, setCharacterData] = useState(undefined);
    const [error, setError] = useState(false);

    useEffect(() => {
        console.log('on load useEffect');
        async function fetchData() {
            try {
               
                const { data: character } = await axios.get( urlGenerator(props.match.params.id) );
                //console.log(data);
                setCharacterData(character);
                setLoading(false);
                // console.log(loading)
               
            } catch (e) {
                setError(true);
                console.log(e);

            }
        }
        fetchData();
    }, [props.match.params.id]);

    console.log(characterData);

    function idGenerator(url) {
        let urlArray = url.split('/');
        // console.log("id: "+urlArray[6]);
        return urlArray[6];
    }

    if (error) {
        return (
            <NotFound/>
        );
    } else {
        if (loading) {
            return (
                <div>
                    <h1>Loading</h1>
                </div>
            );
        } else {  
            return (
            <div>
          
                <Card className={classes.card}>
                    <CardHeader className={classes.titleHead} title={characterData.data.results[0].name}/>
                    <CardMedia
                        className={classes.media}
                        component="img"
                        image={
                            characterData.data.results[0].thumbnail ? characterData.data.results[0].thumbnail.path + "." + characterData.data.results[0].thumbnail.extension: noImage
                        }
                        title="character image"
                        />
                    <CardContent>
                      
                                <dl>
                                        <dt className="title"> Description:</dt>
                                        { characterData && characterData.data.results[0].description ? ( <dd>{characterData.data.results[0].description}</dd> ) : (  <dd>N/A</dd> )}                           
                                </dl>

                                <dl>
                                        <dt className="title"> Total Comics:</dt>
                                        { characterData && characterData.data.results[0].comics.available ? ( <dd>{ characterData.data.results[0].comics.available }</dd> ) : (  <dd>N/A</dd> )}                           
                                </dl>

                                <dl>
                                        <dt className="title"> Total Series:</dt>
                                        { characterData && characterData.data.results[0].series.available ? ( <dd>{ characterData.data.results[0].series.available }</dd> ) : (  <dd>N/A</dd> )}                           
                                </dl>

                                <dl>
                                        <dt className="title"> Total Stories:</dt>
                                        { characterData && characterData.data.results[0].stories.available ? ( <dd>{ characterData.data.results[0].series.available }</dd> ) : (  <dd>N/A</dd> )}                           
                                </dl>

                                <dl>
                                    <dt className="title"> Comics:</dt>
                                    {characterData && (characterData.data.results[0].comics.available !==0) ?
                                    (<dd>
                                        
                                                {
                                                    // characterData.data.results[0].comics.items.map(
                                                    //     (comic) => (comic.name))
                                                
                                                    characterData.data.results[0].comics.items.map(
                                                        (comic) => (
                                                        
                                                                 <Link to={`/comics/${idGenerator(comic.resourceURI)}`} key={idGenerator(comic.resourceURI)}>

                                                                                {comic.name}   
                                                                
                                                                            </Link> 
                                                        
                                                            
                                                        ))  
                                            }
                                       
                                    </dd>) : (<dd>N/A</dd>)}
                                </dl>

                                <dl>
                                    <dt className="title"> Series:</dt>
                                    {characterData && (characterData.data.results[0].series.available !== 0) ?
                                    (<dd>
                                        
                                                {characterData.data.results[0].series.items.map(
                                                    (series) => (
                                                        <Link to={`/series/${idGenerator(series.resourceURI)}`} key={idGenerator(series.resourceURI)}>
                                                                
                                                                        {series.name}   
                                                                
                                                        </Link>
                                                    ))
                                                }
                                    
                                    </dd>) : (<dd>N/A</dd>)}
                                </dl>
                     
                    </CardContent>
                </Card>
            </div>
        );
    }
    }
}

export default SingleCharacter;
