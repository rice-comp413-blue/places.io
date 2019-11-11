import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  card: {
    maxWidth: 1000,
    borderStyle: 'solid',
    borderWidth: '0.5px',
    boxShadow: '3px 3px 5px grey',
    borderColor: 'grey',
    marginBottom: '1em'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  headerTitle: {
    fontSize: '0.65em'
  },
  subHeader: {
    fontSize: '0.85em'
  },
  text: {
    color: 'black'
  },
  id: {
    fontSize: '0.8em',
    right: 0,
    fontStyle: 'italic',
    marginLeft: 'auto',
    marginRight: 0,
    color: 'grey'
  }
}));

export default function MediaCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader
        title={
          <div className={classes.headerTitle}>
            {`Location: (${props.story.lat.toFixed(4)}, ${props.story.long.toFixed(4)})`}
          </div>
        }
        subheader={
          <div className={classes.subHeader}>
            {props.story.timestamp.toLocaleString('en-US')}
          </div>}
      />
      {props.story.imageURL !== '' ?
        <CardMedia
          className={classes.media}
          image={props.story.imageURL}
          title="Story Image"
        /> :
        null
      }
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
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


