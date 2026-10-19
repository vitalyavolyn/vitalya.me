---

title: 'a 100% checklist for the legend of zelda: a link between worlds'
pubDate: 'Oct 19 2026'

---

I've had the same A Link Between Worlds save since 2019 and I wanted to finally 100% it, but I had no idea what I'd missed. So I made a checklist that reads the save and ticks off everything you already have: [albw.vitalya.me](https://albw.vitalya.me/) ([source](https://github.com/vitalyavolyn/albw-tracker)).

It's modeled after the [Pokémon Emerald 100% checklist](https://pokemoncompletion.com/completion/Emerald). Back up your save with Checkpoint, drop the folder on the page, and it marks Pieces of Heart, Maiamai, chests, equipment, upgrades, bottles, minigames, weather vanes and fissures.

## where the data comes from

Save format is pieced together from a few places:

- the [ALBW decomp](https://github.com/7akeem0/albw-decomp-ai), for how the save is laid out
- the [Archipelago world for ALBW](https://github.com/randomsalience/albw-archipelago), which already knows the save flag for every check
- the [z17 randomizer](https://github.com/rickfay/z17-randomizer), for the vanilla item at every location and the region it's in
- a decrypted dump of the game, for the game code and its text

## beating the game isn't in your save file

After the credits the game reloads your save from before the final battle, so the save slot itself never records the win. The only place it shows up is `SaveCommon.bin`, a separate file shared by all three slots. Byte 0x08 has one bit per slot that's beaten the game. So if you only back up `Save_0.bin`, there's no way to tell.

## the play record

There's a screen after the credits called the Play Record. It shows your name, "Total Rupees found", "Times defeated" and whether you played Hero Mode. Those are 0x198, 0x194 and 0xD76 in the save. My main file has found 18192 rupees in total and died 23 times.

The full save layout I worked out is in [`docs/save-format.md`](https://github.com/vitalyavolyn/albw-tracker/blob/main/docs/save-format.md).
