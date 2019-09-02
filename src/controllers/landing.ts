import { Request, Response } from 'express';

import LandingView from '../views/LandingView';

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  // TODO if logged in, redirect to /u/:username
  res.send(LandingView({}));
};
