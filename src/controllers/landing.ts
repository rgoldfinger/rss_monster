import { Request, Response } from 'express';

import LandingView from '../views/LandingView';

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  // @ts-ignore
  console.log(req.session);
  // [Node] { 'oauth:twitter':
  // [Node]    { oauth_token: 'yOBkjgAAAAAA_LpKAAABbPJ6Xf0',
  // [Node]      oauth_token_secret: 'kTqOLdFevCm9MPaKidiIQlUhkygjVwoX' } }
  // @ts-ignore
  console.log(req.twSession);
  // [Node] { 'oauth:twitter':
  // [Node]    { oauth_token: 'yOBkjgAAAAAA_LpKAAABbPJ6Xf0',
  // [Node]      oauth_token_secret: 'kTqOLdFevCm9MPaKidiIQlUhkygjVwoX' } }

  console.log(req.user);
  // TODO if logged in, redirect to /u/:username
  res.send(LandingView({}));
};
