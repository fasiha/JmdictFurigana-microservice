"use strict";

const JMDICTFURIGANA_FILE = '../data/JmdictFurigana.txt';
const PORT = 3700;

var db = {};

function last(x) { return x[x.length - 1]; }

/**
 * Convert Doublevil furigana format to an array of Ruby tag-objects or strings
 * @param  {String} kanji    E.g., `食べ物` or `二進も三進も`
 * @param  {String} reading  E.g., `たべもの` or `にっちもさっちも`
 * @param  {String} furigana E.g., `0:た;2:もの` or `0-1:にっち;3-4:さっち`
 * @return {Array} of type (String | {ruby: String, rt: String})
 *
 * Recipe:
 *
 * 1- Split `kanji` into individual characters (`chars`).
 *
 * 2- For each piece of furigana, e.g., '0-1', overwrite chars[0], that is, the
 * first character of this range, with `{ruby, rt}` object, and overwrite the
 * remaining characters of this range with `undefined`.
 *
 * 3- Combine contiguous characters into a single string via `reduce`.
 */
function formatFurigana(kanji, reading, furigana) {
  const fs = furigana.split(';');
  const idxs = fs.map(s => s.split(':')[0]);    // ['0-2', '5']
  const aboves = fs.map(s => s.split(':')[1]);  // ['た', 'もの'];

  let chars = kanji.split('');  // Step 1
  idxs.forEach((range, i) => {  // Step 2
    let [left, right] = range.split('-');
    left = +left;
    right = right ? +right + 1 : left + 1;
    chars[left] = {ruby : kanji.substring(left, right), rt : aboves[i]};
    for (let j = left + 1; j < right; j++) {
      chars[j] = undefined;
    }
  });
  return chars.filter(x => x).reduce((prev, curr) => {  // Step 3
    if (prev.length === 0) {
      return [ curr ];
    } else if (typeof last(prev) === 'string' && typeof curr === 'string') {
      prev[prev.length - 1] += curr;
    } else {
      prev.push(curr);
    }
    return prev;
  }, []);
}
// formatFurigana('z1art23x', 'oneatwentythree', '1:one;5-6:twentythree');

// Run the file IO in a block so it’s garbage-collected.
if (true) {
  var fs = require('fs');

  const arr = fs.readFileSync(JMDICTFURIGANA_FILE, 'utf8')
                  .trim()
                  .split('\n')
                  .map(s => s.trim().split('|'));

  for (let [kanji, reading, furigana] of arr) {
    if (!db[kanji]) {
      let o = {};
      o[reading] = formatFurigana(kanji, reading, furigana);
      db[kanji] = o;
    } else {
      if (!db[kanji][reading]) {
        db[kanji][reading] = formatFurigana(kanji, reading, furigana);
      } else {
        throw new Error('Kanji & reading pair should have single furigana!');
      }
    }
  }

  // fs.writeFileSync('full.json', JSON.stringify(db, null, 1));
}

// Express
var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

// Browsers escape things properly but curl won’t. This is from
// http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
// which I refer to often.
var recode = s => decodeURIComponent(escape(s));

app.get('/:kanji', (req, res, next) => {
  console.log("Request:", req.params);
  const ans = db[req.params.kanji] || db[recode(req.params.kanji)];
  if (ans) {
    res.json(ans);
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/:kanji/:reading', (req, res, next) => {
  console.log("Request:", req.params);
  const ans =
      (db[req.params.kanji] && db[req.params.kanji][req.params.reading]) ||
      (db[recode(req.params.kanji)] &&
       db[recode(req.params.kanji)][recode(req.params.reading)]);
  if (ans) {
    res.json(ans);
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
