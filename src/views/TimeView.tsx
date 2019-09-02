import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import date from 'date-and-time';
import injectSheet, { JssProvider, SheetsRegistry, WithSheet } from 'react-jss';
import { Link } from '../controllers/rank';
import withLayout from './renderLayout';

const FontFamily = 'Lato:300';

const maxWidth = `@media (max-width: 420px)`;

const styles = {
  page: {
    padding: 50,
    'font-family': `'${'Lato'}', sans-serif`,
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
  },
  content: {
    'white-space': 'nowrap',
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
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
  pageDay: Date;
  page: number;
}

function TimeView({ results, classes, pageDay, page }: Props) {
  return (
    <div className={classes.page}>
      <div className={classes.headerContainer}>
        <a className={classes.navLink} href={`/time/${page - 1}`}>
          {date.format(date.addDays(pageDay, -1), 'MMMM D')}
        </a>
        <h4 className={classes.title}>
          {date.format(pageDay, 'MMMM D, YYYY')}
        </h4>
        {page !== 0 ? (
          <a className={classes.navLink} href={`/time/${page + 1}`}>
            {date.format(date.addDays(pageDay, 1), 'MMMM D')}
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
                {date.format(l.postedAt, 'hh:mm A')}
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

const StyledTimeView = injectSheet(styles)(TimeView);
export default withLayout(StyledTimeView);
