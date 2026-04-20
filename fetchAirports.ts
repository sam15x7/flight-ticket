import fs from 'fs';
import https from 'https';

const url = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    const data = JSON.parse(body);
    const simplified = Object.values(data)
      .filter((a: any) => a.iata && a.iata !== '\\N')
      .map((a: any) => ({
        iata: a.iata,
        city: a.city,
        country: a.country,
        name: a.name
      }));
    fs.writeFileSync('src/airports.json', JSON.stringify(simplified));
    console.log(`Saved ${simplified.length} airports.`);
  });
}).on('error', (e) => {
  console.error(e);
});
