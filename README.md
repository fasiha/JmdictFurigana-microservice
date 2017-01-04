# A web microservice for JmdictFurigana

[**JmdictFurigana**](https://github.com/Doublevil/JmdictFurigana/) is @Doublevil’s awesome annotation of JMDICT.

[**JMDICT**](http://hep.itp.tuwien.ac.at/cgi-bin/dwww/usr/share/doc/edict/edict_doc.html) is Jim Breen and the Monash University’s Electronic Dictionary Research and Development Group’s popular and ponderous Japanese dictionary. (Sidenote: the [official](http://www.edrdg.org/jmdict/edict_doc.html) EDRDG/JMDICT server has been [down](https://groups.yahoo.com/neo/groups/edict-jmdict/conversations/messages/5561)  since December 29, 2016 but may be available when you read this. The previous link points to an Austrian mirror.)

## Usage

Asking for a JMDICT headword returns all readings that JmdictFurigana has for it.

**Examples** hitting a headword’s endpoint:
```
$ curl http://localhost:3700/食べ物
{"たべもの":[{"ruby":"食","rt":"た"},"べ",{"ruby":"物","rt":"もの"}]}
```
Or
```
$ curl http://localhost:3700/瞬く
{"またたく":[{"ruby":"瞬","rt":"またた"},"く"],"しばたたく":[{"ruby":"瞬","rt":"しばたた"},"く"],"しばたく":[{"ruby":"瞬","rt":"しばた"},"く"],"まばたく":[{"ruby":"瞬","rt":"まばた"},"く"],"めたたく":[{"ruby":"瞬","rt":"めたた"},"く"],"めばたく":[{"ruby":"瞬","rt":"めばた"},"く"]}%
```
A JSON-encoded object is returned, with keys as readings and values as furigana arrays.

**Examples** hitting a headword *and* reading’s endpoint:
```
$ curl http://localhost:3700/食べ物/たべもの
[{"ruby":"食","rt":"た"},"べ",{"ruby":"物","rt":"もの"}]
```
Or
```
$ curl http://localhost:3700/瞬く/またたく
[{"ruby":"瞬","rt":"またた"},"く"]
```
When both headword and reading are specified, a JSON-encoded array containing either strings (usually containing kana-only) or objects with `ruby` and `rt` keys is returned. With these `ruby` and `rt` strings, one can readily build HTML5 [Ruby](http://html5doctor.com/ruby-rt-rp-element/) tags, e.g.,

- <ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>
- <ruby>瞬<rt>またた</rt></ruby>く

## Set up
Clone this repo.

Edit `index.js` to adjust the path to `JmdictFurigana.txt` and port.

Run `$ npm install` to fetch dependencies.

Run `$ node index.js` to run the server.
