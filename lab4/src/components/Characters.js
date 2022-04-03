import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
//   Typography,
  makeStyles
} from '@material-ui/core';

import '../App.css';
// import ReactPaginate from 'react-paginate';
import noImage from '../images/no-image.jpeg';
import NotFound from './NotFound';
import SearchCharacters from './Search';
import NoSearchTerm from './NoSearchTerm';
import BadInput from './BadInput';
//require('dotenv').config();

const publickey = process.env.REACT_APP_PUBLIC_KEY;
const privatekey = process.env.REACT_APP_PRIVATE_KEY;
const md5 = require('blueimp-md5');

const useStyles = makeStyles({
  card: {
    maxWidth: 250,
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

// url generator
function urlGenerator(offset) {
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters?limit=' + limit + '&offset=' + offset;
    const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
    //console.log(url);
    return url;
    //console.log(url);
}

function urlGeneratorForSearch(offset, nameStartsWith) {
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=' + nameStartsWith + '&limit=' + limit+ '&offset=' + offset;
    const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
    //console.log(url);
    return url;
    //console.log(url);
}

const limit = 100;

const Characters = (props) => {
  
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [charactersData, setCharactersData] = useState(undefined);
    const [nextPage, setNextPage] = useState(false);
    const [errorPage, setErrorPage] = useState(false);
    const [searchData, setSearchData] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [noSearchTermPage, setNoSearchTerm] = useState(false);
    const [badInput, setBadInputPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(props.match.params.page);

    let card = null;    

    // let pageNum = Number(props.match.params.page);
    // console.log(pageNum);
    
    useEffect(() => {
        //console.log('on load useEffect');
        async function fetchData() {
            //let url = urlGenerator(currentPage * limit);
            //console.log(url);
            try {
                // const { data } = await axios.get(urlGenerator(currentPage * limit));
                // console.log(data.code);
                const { data: { data: { results } } } = await axios.get(urlGenerator(currentPage * limit));
                       
                if (results.length === 0 || results === undefined) {
                    setErrorPage(true);
                } else {
                    setCharactersData(results);
                }
                setLoading(false);
            } catch (e) {
                console.log(e);
            }
        }

        let pageNumProp = props.match.params.page.trim();
      
        if (pageNumProp.indexOf('.') !== -1) {
             setBadInputPage(true);
        }
           
        let pageNumber = pageNumProp * 1;  //converting into number
        
        if (pageNumber < 0 || isNaN(pageNumber) || typeof pageNumber != 'number') {
            setBadInputPage(true);
            setLoading(false);
        }
        else {
            // console.log(pageNumber);
            // console.log("current page" + currentPage);
            // console.log("badinput"+ badInput);
            setCurrentPage(pageNumber);
            fetchData();
        }

        async function fetchNextPageData() {
           
            try {
                //console.log("fetchNext" +currentPage);

                const { data: { data: { results } } } = await axios.get(urlGenerator((currentPage + 1) * limit));
                //console.log("next page length" + results.length);
                    if (results.length === 0) {
                        setNextPage(true);
                    } else {
                        setNextPage(false);
                    }
                } catch (e) {
                    console.log(e);
                }
        }

        pageNumProp = props.match.params.page.trim();
      
        if (pageNumProp.indexOf('.') !== -1) {
             setBadInputPage(true);
        }
           
        pageNumber = pageNumProp * 1;  //converting into number
        
        if (pageNumber < 0 || isNaN(pageNumber) || typeof pageNumber != 'number') {
            setBadInputPage(true);
            setLoading(false);
        }
        else {
            // console.log(pageNumber);
            // console.log("current page" + currentPage);
            // console.log("badinput"+ badInput);
            setCurrentPage(pageNumber);
            fetchNextPageData();
        }
        //fetchNextPageData();
    }, [currentPage, props.match.params.page]);

    //search
    useEffect(() => {
        // console.log('search useEffect fired');
        async function fetchData() {
            try {
                //console.log(`in fetch searchTerm: ${searchTerm}`);
                const { data: { data: { results } } } = await axios.get(urlGeneratorForSearch((currentPage * limit), searchTerm));
                
                if (results.length === 0) {
                    setNoSearchTerm(true);
                }

                setSearchData(results);
                setLoading(false);
            } catch (e) {
                console.log(e);
            }
        }
        if (searchTerm) {
            //console.log('searchTerm is set');
            fetchData();
        }
    }, [searchTerm,currentPage]);

    const searchValue = async (value) => {
        setSearchTerm(value);
    };

    //search
    console.log(searchData);
    console.log(charactersData);

    function onClickNext() {
        setCurrentPage(currentPage + 1);
    }
    
    function onClickPrev() {
        setCurrentPage(currentPage - 1);
    }

    // function onClickBack() {
    //     setCurrentPage(0);
    //     // card = charactersData && charactersData.map((character) => {
    //     //     return buildCard(character);

    //     // });
    // }

    const buildCard = (character) => {
    return (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={character.id}>
            <Card className={classes.card} variant="outlined">
          
                <Link to={`/characters/${character.id}`}>
                    <CardMedia
                        className = {classes.media}
                        component = "img"
                        image = {
                        character.thumbnail.path && character.thumbnail.extension ? character.thumbnail.path + "." + character.thumbnail.extension : noImage
                        }
                        title="show image"
                    />

                    <CardContent>
                        {/* <Typography
                        className={classes.titleHead}
                        gutterBottom
                        variant="h6"
                        component="h3"
                        > */}
                        {character.name}
                        {/* </Typography> */}
                        
                    </CardContent>
               </Link>
           
            </Card>
        </Grid>
        );
    };

    //let pageCount, currentPageData;
    // if (charactersData) {
    //     //console.log(charactersData.data.results);
    //     //card = charactersData.data.results && charactersData.data.results.map((character) => { return buildCard(character) });
    //     currentPageData = charactersData.data.results.slice(offset, offset + per_page).map((character) => { return buildCard(character) });
    //     pageCount = Math.ceil(charactersData.data.results.length / per_page);

    // }

    // function handlePageClick({selected: selectedPage}) {
    //     setCurrentPage(selectedPage);
    // }

    // card = charactersData && charactersData.map((character) => {
    //     return buildCard(character);
    // });

    

    if (searchTerm) {
        //console.log("building card");
        card = searchData && searchData.map((character) => {
        // let { character } = characters;
        return buildCard(character);
        });
    } else {
        card = charactersData && charactersData.map((character) => {
        return buildCard(character);
        });
    }

    if (loading) {
        return (
            <div>
                <h1>Loading</h1>
            </div>
        );
    } else {

        if (errorPage) {
            return (
                <div>
                    <NotFound></NotFound>
                    <Link className="paginationLink" to={`/`}>Go Back</Link>
                    {/* <Grid container className={classes.grid} spacing={5}> { card }</Grid> */}
                </div>

            )
        } else if (noSearchTermPage) {
            return (
                <div>
                    <NoSearchTerm></NoSearchTerm>
                    <Link className="paginationLink" to={`/`}>Go Back</Link>
                    {/* <Grid container className={classes.grid} spacing={5}> { card }</Grid> */}
                </div>

            )
        } else if (badInput) {
            return (
                <div>
                    <BadInput></BadInput>
                    <Link className="paginationLink" to={`/`}>Go Back</Link>
                    {/* <Grid container className={classes.grid} spacing={5}> { card }</Grid> */}
                </div>
            )
        }else {
            return (
                <div>
                    <br />
                        {
                            (currentPage === 0) ? "": 
                                <Link  className = "paginationLink" to={`/characters/page/${currentPage - 1}`} onClick={onClickPrev}>
                                Previous
                                </Link>
                        }
                    
                        {
                        
                            (nextPage === true) ? "" : 
                                <Link  className = "paginationLink" to={`/characters/page/${currentPage + 1}`} onClick={onClickNext}>
                                Next
                                </Link>
                        }
                    <br />
                    <br />
                    
                    <SearchCharacters searchValue={searchValue} />
                    
                    <br />
                    <br />

                    <Grid container className={classes.grid} spacing={5}> {card}</Grid>
                    
                    <Link  className = "paginationLink" to={`/`}>
                        Go Back to Home Page
                    </Link>
                </div>
            );
        }
        
        // return (  
        //     // <div>
        //     //     <ReactPaginate
        //     //         previousLabel = {"Previous"}
        //     //         nextLabel = {"Next"}
        //     //         // pageCount={pageCount}
        //     //         onPageChange={handlePageClick}
        //     //         // containerClassName={"pagination"}
        //     //         // previousLinkClassName={"pagination__link"}
        //     //         // nextLinkClassName={"pagination__link"}
        //     //         // disabledClassName={"pagination__link--disabled"}
        //     //         // activeClassName={"pagination__link--active"}
        //     //     />
        //     //     {currentPageData}
        //     // </div>
        // )
    }
}

export default Characters;