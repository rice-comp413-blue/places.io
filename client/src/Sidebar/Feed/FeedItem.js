import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import locationIcon from '../../Assets/location_marker.png';


const useStyles = makeStyles(() => ({
  card: {
    maxWidth: 1000,
    borderStyle: 'solid',
    borderWidth: '0.5px',
    boxShadow: '3px 3px 5px grey',
    borderColor: 'grey',
    marginBottom: '1em',
    cursor: 'pointer'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  headerTitle: {
    fontSize: '0.65em'
  },
  address: {
    fontSize: '0.6em',
    marginTop: '0.2em',
    marginBottom: '0.2em'

  },
  subHeader: {
    fontSize: '0.85em'
  },
  text: {
    color: 'black'
  },
  id: {
    fontSize: '0.6em',
    right: 0,
    fontStyle: 'italic',
    marginLeft: 'auto',
    marginRight: 0,
    color: 'grey'
  },
  locationIcon: {
    width: '1em',
    height: '1em',
    marginRight: '0.5em'
  }
}));

export default function MediaCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.card} style={props.selected ? { 'borderWidth': '5px' } : undefined} onClick={() => props.onStoryClick(props.story.storyid)}>
      <CardHeader
        title={
          <div>
            <div className={classes.headerTitle}>
              <img
                alt="location"
                className={classes.locationIcon}
                src={locationIcon}>
              </img>
              {`Location: (${props.story.lat.toFixed(4)}, ${props.story.long.toFixed(4)})`}
            </div>
            <div className={classes.address}>
              {props.story.address}
            </div>
          </div>
        }
        subheader={
          <div className={classes.subHeader}>
            {new Date(props.story.timestamp).toLocaleString('en-US')}
          </div>}
      />

      {props.story.image_url ?
        <CardMedia
          className={classes.media}
          image={props.story.image_url}
          title="Story Image"
        /> :
        null
      }
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="div">
          <div className={classes.text}>{props.story.text}</div>
        </Typography>
      </CardContent>

      <CardActions>
        <div className={classes.id}>{`Story ID: ${props.story.storyid}`}</div>
      </CardActions>



    </Card>

  );
}

// const FeedItem = (props) => {
//     return (
//         <div className="feedItem">
//             <p>ID: {props.story.storyid}</p>
//             <p>Text: {props.story.text}</p>
//             <p>Location: ({props.story.lat}, {props.story.long})</p>
//             <p>Timestamp: {props.story.timestamp.toString()}</p>
//         </div>
//     );
// };

// export default FeedItem


