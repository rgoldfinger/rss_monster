import { Request, Response } from 'express';

import UserTimeView from '../views/UserTimeView';
import store, { LinkKind, Link, User } from '../store';
import date from 'date-and-time';
import { DateTime } from 'luxon';

export const show = async (
  req: Request & {
    params: { username: string; id?: string };
  },
  res: Response,
) => {
  const actingUser = req.session.user;
  // TODO verify that this user exists in the DB
  if (actingUser && actingUser.username === req.params.username) {
    try {
      const page = req.params.id ? parseInt(req.params.id, 10) : 0;
      const nowPacifc = DateTime.fromObject({ zone: 'America/Los_Angeles' });

      const today = new Date(
        nowPacifc.year,
        nowPacifc.month - 1,
        nowPacifc.day,
      );
      const queryStartDate = date.addDays(today, page);
      const queryEndDate = date.addDays(queryStartDate, 1);
      try {
        const query = store
          .createQuery(LinkKind)
          .filter('accountId', '=', actingUser.twId)
          .filter('postedAt', '>', queryStartDate)
          .filter('postedAt', '<', queryEndDate);

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
            pageDay: queryStartDate,
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
  } else {
    // TODO allow other users to see their timeline if they enable that setting.
    res.redirect('/landing');
  }
};
