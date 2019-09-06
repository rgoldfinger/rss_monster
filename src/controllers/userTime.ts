import { Request, Response } from 'express';

import UserTimeView from '../views/UserTimeView';
import store, { LinkKind, Link, User, UserKind } from '../store';
import { DateTime } from 'luxon';

export const show = async (
  req: Request & {
    params: { username: string; id?: string };
  },
  res: Response,
) => {
  const actingUser = req.session.user;
  // const uQuery = store
  //   .createQuery(UserKind)
  //   .filter('username', req.params.username);
  // const r1 = await store.runQuery(uQuery);
  // const user = r1[0][0] as User;
  // TODO verify that this user exists in the DB
  if (actingUser && actingUser.username === req.params.username) {
  try {
    const page = req.params.id ? parseInt(req.params.id, 10) : 0;
    const nowPacifc = DateTime.fromObject({ zone: 'America/Los_Angeles' });

    const pageDate = nowPacifc.plus({ days: page });
    try {
      const query = store
        .createQuery(LinkKind)
        .filter('accountId', '=', actingUser.twId)
        .filter('postedAt', '>', pageDate.startOf('day').toJSDate())
        .filter('postedAt', '<', pageDate.endOf('day').toJSDate());

      const entities = await store.runQuery(query);
      const results = entities[0] as Link[];
      const sorted = results.sort((a, b) => {
        if (a.postedAt > b.postedAt) return -1;
        if (a.postedAt < b.postedAt) return 1;
        return 0;
      });

      res.send(
        UserTimeView({
          results: sorted,
          pageDay: pageDate,
          page,
          username: req.params.username,
        }),
      );
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  } catch (e) {
    res.status(400).send(e);
  }
  // } else {
  //   // TODO allow other users to see their timeline if they enable that setting.
  //   res.redirect('/landing');
  // }
};
