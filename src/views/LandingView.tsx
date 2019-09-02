import React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import withLayout from './renderLayout';

const maxWidth = `@media (max-width: 420px)`;

const buttonDefault = {
  padding: 12,
  backgroundColor: '#FFF',
  borderColor: '#000',
};

const styles = {
  page: {
    padding: 50,
    'font-family': `'${'Lato'}', sans-serif`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  subtitle: {
    fontStyle: 'italic',
  },
  ctaContainer: {
    marginTop: 50,
  },
  buttonDefault,
};

interface Props extends WithSheet<typeof styles> {}

function LandingView({ classes: c }: Props) {
  return (
    <div className={c.page}>
      <h1>rss-monster</h1>
      <span className={c.subtitle}>
        Get your news from Twitter, without being on Twitter
      </span>
      <div className={c.ctaContainer}>
        <button className={c.buttonDefault}>Sign up</button>
      </div>
    </div>
  );
}

const StyledLandingView = injectSheet(styles)(LandingView);
export default withLayout(StyledLandingView);
