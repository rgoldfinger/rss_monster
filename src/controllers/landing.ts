import { Request, Response } from 'express';

import LandingView from '../views/LandingView';
import store from '../store';
import date from 'date-and-time';
import { LinkKind } from './save';
import { DateTime } from 'luxon';

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  // TODO if logged in, redirect to /u/:username
  res.send(LandingView({}));
};
