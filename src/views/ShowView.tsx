import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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
    width: 36,
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
  metadata: {
    paddingRight: 20,
  },
  link: {},
  [maxWidth]: {
    page: {
      padding: 10,
    },
    rank: {
      width: 20,
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
}

function ShowView({ results, classes }: Props) {
  return (
    <div className={classes.page}>
      {results.map(l => (
        <div className={classes.item} key={l.linkHash}>
          <div className={classes.rank}>{l.rank}</div>
          <div className={classes.content}>
            <a className={classes.link} href={l.link} target="_blank">
              {l.link.replace('http://', '').replace('https://', '')}
            </a>
            <div>
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

const StyledShowView = injectSheet(styles)(ShowView);

export default function(results: Props['results']) {
  const sheets = new SheetsRegistry();
  const app = renderToStaticMarkup(
    <JssProvider registry={sheets}>
      <StyledShowView results={results} />
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
