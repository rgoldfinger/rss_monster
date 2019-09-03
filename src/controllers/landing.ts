import { Request, Response } from 'express';

import LandingView from '../views/LandingView';
import { User } from '../store';

export const show = async (
  req: Request & { params: { id: string }; session: { user?: User } },
  res: Response,
) => {
  if (req.session.user) {
    res.redirect(`/u/${req.session.user.username}`);
    return;
  }
  res.send(LandingView({}));
};
