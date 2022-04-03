import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
//import { v4 as uuidv4 } from 'uuid';
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
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/comics/' + id;
    const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
    console.log(url);
    return url;
}


function SingleComic(props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [comicData, setComicData] = useState(undefined);
    const [error, setError] = useState(false);

    const regex = /(<([^>]+)>)/gi;
    // if (showData && showData.summary) {
    //     summary = showData && showData.summary.replace(regex, '');
    // } else {
    //     summary = 'No Summary';
    // }

    useEffect(() => {
        console.log('on load useEffect');
        async function fetchData() {
            try {
               
                const { data: comic } = await axios.get( urlGenerator(props.match.params.id) );
                //console.log(data);
                setComicData(comic);
                setLoading(false);
                // console.log(loading)
               
            } catch (e) {
                setError(true);
                console.log(e);

            }
        }
        fetchData();
    }, [props.match.params.id]);

    function idGenerator(url) {
        let urlArray = url.split('/');
        return urlArray[6];
    }

    console.log(comicData);
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
            <>
            {/* <p>I am in single character page</p> */}
            <Card className={classes.card}>
                <CardHeader className={classes.titleHead} title={comicData.data.results[0].title}/>
                <CardMedia
                    className={classes.media}
                    component="img"
                    image={
                        comicData.data.results[0].thumbnail ? comicData.data.results[0].thumbnail.path + "." + comicData.data.results[0].thumbnail.extension: noImage
                    }
                    title="character image"
                    />
                    <CardContent>
                    {/* creators , stories, events featured comic */}
                   
                            <dl>
                                    <dt className="title"> Description:</dt>
                                    { comicData && comicData.data.results[0].description ? ( <dd>{comicData.data.results[0].description.replace(regex, '')}</dd> ) : (  <dd>N/A</dd> )}                           
                            </dl>

                            <dl>
                                <dt className="title"> Characters:</dt>
                                {comicData && (comicData.data.results[0].characters.available !== 0) ?
                                    (<dd>{comicData.data.results[0].characters.items.map((character) =>
                                        <Link key={idGenerator(character.resourceURI) } to={`/characters/${idGenerator(character.resourceURI)}`}>
                                          { character.name}
                                        </Link>)}</dd>) : (<dd>N/A</dd>)
                                }    
                            </dl>


                            {/* <dl>
                                <dt className="title"> Creators:</dt>
                                {comicData && comicData.data.results[0].creators.items ?
                                (<dd>{comicData.data.results[0].creators.items.map((creator) => ( creator.name ))}</dd>) : (<dd>N/A</dd>)}
                                
                            </dl> */}

                            <dl>
                                <dt className="title"> Series:</dt>
                                {comicData && comicData.data.results[0].series.resourceURI ? (<dd> <Link key={idGenerator(comicData.data.results[0].series.resourceURI) }to={`/series/${idGenerator(comicData.data.results[0].series.resourceURI)}`}>{ comicData.data.results[0].series.name } </Link></dd> ) : (  <dd>N/A</dd> )}
                            </dl>

                            {/* <dl>
                                <dt className="title"> Series:</dt>
                                {comicData && (comicData.data.results[0].series.available !== 0) ?
                                    (<dd>{comicData.data.results[0].series.items.map((series) =>
                                        <Link to={`/series/${idGenerator(series.resourceURI)}`}>
                                            <li> { series.name}</li>
                                        </Link>)}</dd>) : (<dd>N/A</dd>)
                                }    
                            </dl> */}

                            <dl>
                                <dt className="title"> Stories:</dt>
                                {comicData && comicData.data.results[0].stories.items ?
                                    (<dd><ul>{comicData.data.results[0].stories.items.map((story) => (<li key={ idGenerator(story.resourceURI) }>  { story.name }</li>))}</ul></dd>) : (<dd>N/A</dd>)}
                                
                            </dl>

                            
                        
                  
                </CardContent>
            </Card>
            </>
        );
    }
    }
}
export default SingleComic;

