import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import date from 'date-and-time';
import injectSheet, { JssProvider, SheetsRegistry, WithSheet } from 'react-jss';
import { Link } from '../controllers/save';

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
  rank: {
    width: 30,
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
  link: {},
  metadata: {
    paddingRight: 20,
  },
  metadataContainer: {
    marginTop: 6,
  },
  title: {
    textAlign: 'center',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    'justify-content': 'space-between',
  },
  [maxWidth]: {
    page: {
      padding: '10px 0',
    },
    rank: {
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

function ShowView({ results, classes, pageDay, page }: Props) {
  return (
    <div className={classes.page}>
      <div className={classes.headerContainer}>
        <a href={`/page/${page - 1}`}>
          {date.format(date.addDays(pageDay, -1), 'MMMM D')}
        </a>
        <h4 className={classes.title}>
          {date.format(pageDay, 'MMMM D, YYYY')}
        </h4>
        {page !== 0 ? (
          <a href={page === 1 ? '/' : `/page/${page + 1}`}>
            {date.format(date.addDays(pageDay, 1), 'MMMM D')}
          </a>
        ) : (
          <div />
        )}
      </div>
      {results.map(l => (
        <div className={classes.item} key={l.linkHash}>
          <div className={classes.rank}>{l.rank}</div>
          <div className={classes.content}>
            <a className={classes.link} href={l.link} target="_blank">
              {l.link.replace('http://', '').replace('https://', '')}
            </a>
            <div className={classes.metadataContainer}>
              <span className={classes.metadata}>Tweets: {l.tweets}</span>
              <span className={classes.metadata}>Retweets: {l.rts}</span>
              <span className={classes.metadata}>Likes: {l.likes}</span>
              <span className={classes.metadata}>Score: {l.score}</span>
            </div>
            <div className={classes.metadataContainer}>
              <span className={classes.metadata}>
                Posted at {l.postedAt.toDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const StyledShowView = injectSheet(styles)(ShowView);

export default function(
  results: Props['results'],
  pageDay: Date,
  page: number,
) {
  const sheets = new SheetsRegistry();
  const app = renderToStaticMarkup(
    <JssProvider registry={sheets}>
      <StyledShowView results={results} pageDay={pageDay} page={page} />
    </JssProvider>,
  );
  // https://github.com/cssinjs/examples/blob/gh-pages/react-ssr/src/server.js
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css?family=${FontFamily}&display=swap" rel="stylesheet">
    <title>rss monster</title>
    <style type="text/css" id="server-side-styles">
      ${sheets.toString()}
    </style>
  </head>
  <body>
    <div id="app">${app}</div>
  </body>
</html>`;
}
