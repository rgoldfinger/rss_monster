import { Request, Response } from 'express';

import TimeView from '../views/TimeView';
import store, { LinkKind, Link } from '../store';
import date from 'date-and-time';
import { DateTime } from 'luxon';

export const show = async (
  req: Request & { params: { id: string } },
  res: Response,
) => {
  try {
    const page = req.params.id ? parseInt(req.params.id, 10) : 0;
    const nowPacifc = DateTime.fromObject({ zone: 'America/Los_Angeles' });

    const today = new Date(nowPacifc.year, nowPacifc.month - 1, nowPacifc.day);
    const queryStartDate = date.addDays(today, page);
    const queryEndDate = date.addDays(queryStartDate, 1);
    try {
      const query = store
        .createQuery(LinkKind)
        .filter('postedAt', '>', queryStartDate)
        .filter('postedAt', '<', queryEndDate);

      console.log('fetching query');
      const entities = await store.runQuery(query);
      const results = entities[0] as Link[];

      const sorted = results.sort((a, b) => {
        if (a.postedAt > b.postedAt) return -1;
        if (a.postedAt < b.postedAt) return 1;
        return 0;
      });

      console.log('rendering results');
      res.send(TimeView({ results: sorted, pageDay: queryStartDate, page }));
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  } catch (e) {
    res.status(400).send(e);
  }
};
