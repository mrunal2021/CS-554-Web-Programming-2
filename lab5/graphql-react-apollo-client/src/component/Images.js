import React, {useState} from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import queries from '../graphql/queries';

import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  CardHeader,
  makeStyles
} from '@material-ui/core';

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

function Images() {
    const classes = useStyles();
    const [pageNum, setPageNum] = useState(0);
    const { data,error,loading } = useQuery(
        queries.LOAD_IMAGES,
        {
            variables: {
                pageNum
            }
        },
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    const [updateImage] = useMutation(queries.ADD_TO_BIN);
    //console.log("data" + JSON.stringify(data));
    
    if (data) {
        const { unsplashImages: Images } = data;

        let ImageList =(Images.map(image=>(
                <li className="imageList" key={image.id}>
                <Card className={classes.card}>
                    <CardHeader
                        className={classes.titleHead}
                        title={
                            "Image Posted by: "+image.posterName
                        }
                    />
            
                    <CardMedia
                        className={classes.media}
                        component="img"
                        image={image.url}
                        title="image"
                    />

                    <CardContent>
                         <Typography>
                            {"Image Description: "+image.description} 
                        </Typography>
                    </CardContent>
                    
                    {(image.binned === true) ? <button className="button" onClick={(e) => {
                            e.preventDefault();
                            alert("Removed");
                            window.location.reload();
                            updateImage({
                                variables: { id: image.id, url: image.url, posterName: image.posterName, description: image.description, userPosted: image.userPosted, binned: false }
                            })
                        }}> Remove from Bin </button> :
                        <button className="button" onClick={(e) => {
                            e.preventDefault();
                            alert("Added");
                            window.location.reload();
                            updateImage({
                                variables: { id: image.id, url: image.url, posterName: image.posterName, description: image.description, userPosted: image.userPosted, binned: true }
                            })
                        }}> Add to Bin </button>}
                </Card>
                </li>
            )));
        return <div>
            <button className="button" onClick={() => setPageNum(pageNum + 1)}>Get More</button>
            <div>{ ImageList }</div>
        </div>
    } else if (loading) {
        return <div>Loading...</div>;
    } else if (error) {
        return <div>{ error.message }</div>;
    }   
}

export default Images