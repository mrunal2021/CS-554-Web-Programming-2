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
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/series/' + id;
    const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
    //console.log(url);
    return url;
}


function SingleSeries(props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [seriesData, setSeriesData] = useState(undefined);
    const [error, setError] = useState(false);

    const regex = /(<([^>]+)>)/gi;

    useEffect(() => {
        console.log('on load useEffect');
        async function fetchData() {
            try {
               
                const { data: comic } = await axios.get( urlGenerator(props.match.params.id) );
                //console.log(data);
                setSeriesData(comic);
                setLoading(false);
               
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

    console.log(seriesData);
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
                <CardHeader className={classes.titleHead} title={seriesData.data.results[0].title}/>
                <CardMedia
                    className={classes.media}
                    component="img"
                    image={
                        seriesData.data.results[0].thumbnail ? seriesData.data.results[0].thumbnail.path + "." + seriesData.data.results[0].thumbnail.extension: noImage
                    }
                    title="character image"
                    />
                    <CardContent>
                   
                            <dl>
                                    <dt className="title"> Description:</dt>
                                    { seriesData && seriesData.data.results[0].description ? ( <dd>{seriesData.data.results[0].description.replace(regex, '')}</dd> ) : (  <dd>N/A</dd> )}                           
                            </dl>

                            <dl>
                                <dt className="title"> Characters:</dt>
                                {seriesData && (seriesData.data.results[0].characters.available !== 0) ?
                                    (<dd>{seriesData.data.results[0].characters.items.map((character) =>
                                        <Link key={ idGenerator(character.resourceURI) } to={`/characters/${idGenerator(character.resourceURI)}`}>
                                            { character.name}
                                        </Link>)}</dd>) : (<dd>N/A</dd>)
                                }
                                
                            </dl>
                            
                            <dl>
                                <dt className="title"> Comics:</dt>
                                {seriesData && (seriesData.data.results[0].comics.available !== 0) ?
                                    (<dd>{seriesData.data.results[0].comics.items.map((comic) =>
                                        <Link key={ idGenerator(comic.resourceURI) } to={`/comics/${idGenerator(comic.resourceURI)}`}>
                                            { comic.name}
                                        </Link>)}</dd>) : (<dd>N/A</dd>)
                                }
                                
                            </dl>

                            {/* <dl>
                                <dt className="title"> Creators:</dt>
                                {seriesData && seriesData.data.results[0].creators.items ?
                                (<dd><ul>{seriesData.data.results[0].creators.items.map((creator) => (<li key={idGenerator(creator.resourceURI)}> { creator.name }</li>))}</ul></dd>) : (<dd>N/A</dd>)}
                                
                            </dl> */}

                            <dl>
                                <dt className="title"> Stories:</dt>
                                {seriesData && seriesData.data.results[0].stories.items ?
                                    (<dd><ul>{seriesData.data.results[0].stories.items.map((story) => (<li key={ idGenerator(story.resourceURI) }> { story.name }</li>))}</ul></dd>) : (<dd>N/A</dd>)}
                            </dl>
                   
                </CardContent>
            </Card>
            </>
        );
    }
    }
}
export default SingleSeries;

