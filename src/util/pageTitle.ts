var fetch = require('node-fetch');
var cheerio = require('cheerio');

export default async function fetchTitle(
  url: string,
): Promise<string | undefined> {
  let page;
  try {
    const r: Response = await fetch(url);
    console.log(r.url !== url);
    console.log('url', url);
    console.log('r.url', r.url);
    if (r.url !== url) {
      const r2 = await fetch(r.url);
      page = r2.text();
    } else {
      page = r.text();
    }
  } catch (e) {
    console.log(e);
    return undefined;
  }

  var $ = cheerio.load(page);

  var title = $('head > title')
    .text()
    .trim();

  return title;
}
