import React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import { Link } from '../store';
import withLayout from './renderLayout';
import { DateTime } from 'luxon';

const maxWidth = `@media (max-width: 420px)`;

const styles = {
  page: {
    padding: 50,
    'font-family': `'Lato', sans-serif`,
    'font-weight': 300,
  },
  item: {
    paddingTop: 20,
    display: 'flex',
    'align-items': 'center',
  },
  score: {
    width: 50,
    marginRight: 20,
    textAlign: 'end',
    'font-weight': 400,
  },
  content: {
    flex: 1,
  },
  linkContainer: {
    display: 'flex',
    'min-width': 20,
  },
  link: {
    color: '#111',
    '&:visited': {
      color: '#AAA',
    },
    'font-weight': 400,
    'text-decoration': 'none',
    'font-size': '14px',
  },
  metadata: {
    paddingRight: 20,
  },
  metadataContainer: {
    marginTop: 2,
    fontSize: 10,
  },
  title: {
    textAlign: 'center',
    'font-weight': 300,
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    'justify-content': 'space-between',
    padding: '0 10px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: 12,
    color: '#333',
    '&:visited': {
      color: '#333',
    },
  },
  placeholder: {
    width: 80,
  },
  displayUrl: {
    marginTop: 6,
    fontSize: 12,
  },
  [maxWidth]: {
    page: {
      padding: '10px 0',
    },
    score: {
      marginRight: 10,
    },
    item: {
      paddingTop: 10,
    },
    link: {
      fontSize: 12,
    },
  },
};

interface Props extends WithSheet<typeof styles> {
  results: Link[];
  pageDay: DateTime;
  page: number;
  username: string;
}

function UserTimeView({ results, classes, pageDay, page, username }: Props) {
  return (
    <div className={classes.page}>
      <div className={classes.headerContainer}>
        <a className={classes.navLink} href={`/u/${username}/${page - 1}`}>
          {pageDay.minus({ days: 1 }).toFormat('MMMM d')}
        </a>
        <h4 className={classes.title}>{pageDay.toFormat('MMMM d, yyyy')}</h4>
        {page !== 0 ? (
          <a className={classes.navLink} href={`/u/${username}/${page + 1}`}>
            {pageDay.plus({ days: 1 }).toFormat('MMMM d')}
          </a>
        ) : (
          <div className={classes.placeholder} />
        )}
      </div>
      {results.map((l, i) => (
        <div className={classes.item} key={l.linkHash}>
          <div className={classes.score}>{l.score.toLocaleString()}</div>
          <div className={classes.content}>
            <a className={classes.link} href={l.link} target="_blank">
              {l.pageTitle || l.link}
            </a>

            <div className={classes.displayUrl}>
              <span>
                {DateTime.fromJSDate(l.postedAt)
                  .setZone('America/Los_Angeles')
                  .toFormat('hh:mm a')}
                {'  '}
              </span>
              {l.pageTitle && <span>{l.twDisplayLink}</span>}
            </div>
            <div className={classes.metadataContainer}>
              <span className={classes.metadata}>Tweets: {l.tweets}</span>
              <span className={classes.metadata}>Retweets: {l.rts}</span>
              <span className={classes.metadata}>Likes: {l.likes}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const StyledUserTimeView = injectSheet(styles)(UserTimeView);
export default withLayout(StyledUserTimeView);
