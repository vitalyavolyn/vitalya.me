---

title: 'some pokemon gen 3-4 oversights and curiosities i found'
pubDate: 'Sep 3 2026'

---

For the last n months I've been fiddling with [pret](https://github.com/pret/) pokemon decomps with the help of an ai agent to better understand stuff. Been looking into flags and some logic. Here are some of my findings.

All of these have been tested with the following ROMs on real hardware or melonDS:
<details>
  <summary>hashes</summary>
<pre>
platinum  ce81046eda7d232513069519cb2085349896dec7
emerald   f3ae088181bf583e55daf962a92bb46f4f1d07b7
heart gold 30793e274fb4c7ba070ae226edbdfe355504b1f5
soul silver 27a25c23aa1c0ecabe48a30a004b96c9dbc97730
</pre>
</details>

## infinite fossils in D/P/Pt

Oreburgh Mining Museum can revive a fossil Pokemon while keeping the fossil as a held item.

Repro steps:
- Have at least three distinct fossil types in the bag. The target fossil must be last among your current fossils in this internal order: Old Amber -> Helix -> Dome -> Root -> Claw -> Armor -> Skull. You must have just one target fossil.
- Talk to the museum researcher, open the fossil menu, then press B to cancel.
- Without leaving the museum, open the Bag and Give the target fossil to a party Pokemon.
- Talk to the researcher again and select the visible Cancel row. Do not press B.
- Leave/re-enter to claim the revived Pokemon.

The fossil should still be held by a party Pokemon.

I sent this glitch to Etchy after finding it and he did a lil video on it! Here it is:
<iframe width="1427" height="640" src="https://www.youtube.com/embed/f_5od3l6yuA" title="New Infinite Fossil Glitch Discovered in Gen 4 Pokémon" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

When you open the fossil-revival menu, the game builds a list of every fossil type in your Bag and remembers them in a fixed set of "slots" - `VAR_MAP_LOCAL_0x01` through `0x07`, one per fossil shown. These are map-local variables, so they persist for as long as you stay on the map. They are NOT cleared out when you open the menu again.

You might guess where this goes already.

The "Cancel" row at the bottom of the list is supposed to be its own special case, like in basically every other menu in the game, but here, the check that's supposed to catch it is just broken. Selecting Cancel with A just falls straight through into the normal "treat this as a fossil pick" logic, same as any real row.

Normally that's harmless, because Cancel usually lands on an empty slot with nothing meaningful in it. But if you remove the last fossil from your Bag before reopening the menu, the now-shorter list finishes building *before* it reaches the slot Cancel lands on this time, so that slot still holds last interaction's leftover data: the target fossil's item ID. The game thinks you picked a real fossil, tries to remove it from the Bag, fails, doesn't care, and revives it anyway.

Check out `res/field/scripts/scripts_mining_museum.s` (the `MiningMuseum_FossilResearcher` script and its `MiningMuseum_GetXFossilVar` handlers) for the details.

## catching deoxys the long way (FRLG/Emerald)

Solving the Birth Island puzzle to obtain Deoxys requires stepping on 10 triangles in sequence, and after each one the game checks whether you took the shortest possible path to reach it. This requirement is basically the entire difficulty of the puzzle.

But the byte tracking your steps-since-last-triangle wraps back to 0 the instant it would hit 100:

```
// pokeemerald/src/field_specials.c:3382 (IncrementBirthIslandRockStepCount)
if (++stepCount > 99)
  VarSet(VAR_DEOXYS_ROCK_STEP_COUNT, 0);
else
  VarSet(VAR_DEOXYS_ROCK_STEP_COUNT, stepCount);
```

Here i'm taking 104 steps instead of 4 on the first triangle move:

<iframe width="1254" height="640" src="https://www.youtube.com/embed/qFRbT7aAztw" title="taking 104 steps instead of 4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Event proceeds as usual.

## an insane way to reset Pal Park timer (Pl)

Pal Park is supposed to let you migrate 6 Pokémon from a given GBA cartridge, then forces a real 24-hour wait before that same cartridge can migrate again, specifically to stop you from just winding the system clock forward, which the game separately detects and blocks.

It tracks this with a 20-slot table of (trainer ID, timestamp) pairs, basically an LRU (least recently used) cache.

After transferring your 6 Pokémon from your main cartridge, grab any spare GBA cartridge, transfer from it, reset it (new game), and repeat that 19 times with 19 fresh trainer IDs. That fills all 20 slots, with your main cartridge now sitting as the oldest entry. One more throwaway transfer evicts it, the table just kicks out whichever slot has the oldest timestamp, no matter how recent that "oldest" actually is or whether it's still inside its own 24-hour window. Pop your main cartridge back in and the game can't find it in the table anymore, so as far as it's concerned you've never migrated from it. Timer's reset, no clock touched.

This is very time consuming, but maybe you really don't want to tamper with your DS's clock and want to transfer from gen 3 as fast as possible lol.

The table is `GetTransferSlotByTrainerID` in `pokeplatinum/src/pal_park_transfers.c:38-66`. `GetCanMigrateStatus` (`pokeplatinum/src/main_menu/gba_migrator.c:1693-1743`) only consults this table.

## infinite battle with Magnet Rise, Fly and Gravity (HG/SS)

Get a Pokémon airborne two different ways at once and Gravity only knows how to undo one of them, the other sticks forever. The Pokémon stays invisible mid-Fly, locked into repeating that same move every turn, for the rest of the battle.

Setup: have it use Magnet Rise, then Fly the following turn (so it's mid-vanish), then have the opponent use Gravity while both are still active. Gravity should end Magnet Rise and cancel the Fly/Bounce vanish, bringing the user back down and freeing up its move choice. Instead, it handles Magnet Rise first, then exits before the Fly cleanup runs. The Pokémon remains invisible and locked into repeating Fly for the rest of the battle.

<iframe width="1427" height="640" src="https://www.youtube.com/embed/PfGydh3TmZ0" title="magner rise + fly + gravity" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Probably not reachable in a legit game, I can't find a Pokémon that learns both Magnet Rise and Fly/Bounce outside of Mew and Smeargle (or a way to pass Magnet Rise's effect via Baton Pass onto a flier).<sup>\[citation needed]</sup>

It's in `files/battledata/script/subscript/subscript_0156_GravityStart.s`. The per-battler loop checks for Magnet Rise first (line 16) and, if found, jumps straight to the cleanup-and-exit block. That skips the next check (line 17), which is the only path that un-vanishes a Fly/Bounce user and unlocks its move (lines 30–31). In effect, the script treats the two effects as mutually exclusive when it should clean them up independently.
