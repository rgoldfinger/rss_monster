import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import injectSheet, { JssProvider, SheetsRegistry, WithSheet } from 'react-jss';
import { Link } from '../controllers/save';

// const FontFamily = 'Noto+Sans+JP';
const FontFamily = 'Lato:300';

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
    flex: 1,
    display: 'flex',
    'flex-direction': 'column',
  },
  metadata: {
    paddingRight: 20,
  },
  // myLabel: {
  //   fontStyle: 'italic'
  // }
};
interface Props extends WithSheet<typeof styles> {
  results: Link[];
}
// type Props = { results: Link[] };

function ShowView({ results, classes }: Props) {
  return (
    <div className={classes.page}>
      {results.map(l => (
        <div className={classes.item} key={l.linkHash}>
          <div className={classes.rank}>{l.rank}</div>
          <div className={classes.content}>
            <div>
              <a href={l.link} target="_blank">
                {l.link}
              </a>
            </div>
            <div>
              <span className={classes.metadata}>Tweets: {l.tweets}</span>
              <span className={classes.metadata}>Likes: {l.likes}</span>
              <span className={classes.metadata}>Retweets: {l.rts}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const StyledShowView = injectSheet(styles)(ShowView);

export default function(data: { results: Props['results'] }) {
  const sheets = new SheetsRegistry();
  const app = renderToStaticMarkup(
    <JssProvider registry={sheets}>
      <StyledShowView {...data} />
    </JssProvider>,
  );
  // https://github.com/cssinjs/examples/blob/gh-pages/react-ssr/src/server.js
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
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
