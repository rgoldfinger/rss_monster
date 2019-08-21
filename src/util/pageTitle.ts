var fetch = require('node-fetch');
var cheerio = require('cheerio');

function getTitleFromPage(page: string): string | undefined {
  var $ = cheerio.load(page);

  var title = $('head > title')
    .text()
    .trim();

  return title;
}

export default async function fetchTitle(
  url: string,
): Promise<string | undefined> {
  let title;
  try {
    const r: Response = await fetch(url);
    const page = await r.text();
    title = getTitleFromPage(page);

    if (!title && r.url !== url) {
      const r2 = await fetch(r.url);
      const page2 = await r2.text();
      title = getTitleFromPage(page2);
    }
  } catch (e) {
    console.log(e);
    return undefined;
  }

  return title;
}
