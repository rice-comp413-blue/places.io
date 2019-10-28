import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

export default function MediaCard(props) {
    const classes = useStyles();
  
    return (
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={props.story.imageURL}
            title="Story image"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {props.story.text}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
            <p>ID: {props.story.storyid}</p>
            <p>Text: {props.story.text}</p>
            <p>Location: ({props.story.lat}, {props.story.long})</p>
            {console.log(props.story.timestamp)}
            <p>Timestamp: {props.story.timestamp.toLocaleString()}</p>
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {/* <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button> */}
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
