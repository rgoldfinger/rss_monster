import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JssProvider, SheetsRegistry } from 'react-jss';

export const FontFamily = 'Lato:300,400';

export default function(Component: any) {
  return function(props: any) {
    const sheets = new SheetsRegistry();
    const app = renderToStaticMarkup(
      <JssProvider registry={sheets}>
        <Component {...props} />
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
  };
}
