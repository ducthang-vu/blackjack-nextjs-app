# Card images

The 52 card faces in this folder are **Vectorized Playing Cards 1.0** by
**Chris Aguilar**, licensed under the **GNU Lesser General Public License
v3.0** (LGPL-3.0). The license text is in `LICENSE-LGPL-3.0.txt`, which
builds on the GNU GPL v3.0 in `LICENSE-GPL-3.0.txt`.

- `*.png` (this folder, served to players): the PNG renderings published by
  the [deckofcards](https://github.com/crobertsbmw/deckofcards) project, i.e.
  the same images deckofcardsapi.com serves.
- `assets/cards-svg/*.svg` (not served): the unmodified SVG sources of those
  images, from the same project.

Both were copied from deckofcards `static/img/` at commit
`fa7d8f08e1ba1f2304216374585e65a614e1fb8d`, without changes.

File names follow the card API's card codes: rank then suit, where the rank
is `A`, `2`–`9`, `0` (ten), `J`, `Q` or `K` and the suit is `S`, `H`, `D` or
`C`. For example `KH.png` is the king of hearts and `0S.png` the ten of
spades.

This license applies only to these card images, not to the rest of the
application.
