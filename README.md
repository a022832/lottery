# School Bus Lottery Program
This is the source code for a school bus seat lottery system, built with Google Apps Script by Integrity6. It fairly assigns limited bus seats using a weighted random selection based on distance, with configurable sibling options. We’re sharing it as an open-source tool to support charter schools—part of our mission to help them succeed.

## Purpose
Created to streamline bus seat assignments for a charter school, this code is public so anyone can verify its fairness or adapt it for their own use. It runs in a Google Sheet, but the spreadsheet setup isn’t included—dig into the code to figure it out.

## How It Works
- Pulls applicant data from a Google Sheet.
- Assigns weights by distance (via a weight table).
- Runs a lottery with two modes:
  - Mode 1: Sibling Preference (siblings get priority).
  - Mode 2: Siblings Pulled Together (siblings stay together if picked, no priority).
- Outputs awarded seats and a waitlist.

## Setup
Requires a Google Sheet with specific sheets and columns—see `lottery.gs` for details (e.g., `getSheetByName`, `getRange`). No pre-built spreadsheet here; this is the raw script for transparency and reuse.

## License
Licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 (CC BY-NC-ND 4.0):
- Use and share it with credit to Integrity6 (www.integrity6.com).
- No commercial use or modifications allowed.

## Credits
Built by Peter Mojica, Co-Founder of Integrity6, as a courtesy to charter schools. No support or maintenance provided—use at your own discretion.

## For Challengers
Questioning the process? The logic’s all here—weighted randomization, sibling handling, and more. Check it out.

## Performance Notes
We tested this script with a dataset of 6,330 rows (demand: 20,902 seats), averaging 10.84 miles from school, an average of 3.3 seats requested per application, and 240 sibling-preference cases. Setup: 60 seats awarded, partial awards allowed ("No" setting), and sibling preference at 2 (siblings pulled together, no priority). Weights by distance: 1-5 miles (1), 5.1-10 (2), 10.1-20 (3), 20.1-30 (4), 30.1-35 (5), 35.1-40 (6), 40.1-45 (25), 45.1-1000 (45). Ran on a modest Windows laptop, it processed without issues—no timeouts. Google Apps Script caps total execution at 6 minutes, and this test set should exceed most charter school needs. If you’re pushing larger datasets and hitting timeouts, optimizations are possible:
- Quick fix: Remove progress updates in cells F2/F3 of the Lottery Results sheet to cut sheet writes (saves ~5-15 seconds on 6,000+ rows).
- Advanced: Streamline weighted selection—e.g., use reservoir sampling to pick winners in one pass instead of shuffling and iterating—which could trim seconds off large runs, though the current method is efficient for typical sizes.
If you’re at that point, this script might not be your best bet—consider a beefier system. Need help? We’re open to paid engagements at [info@integrity6.com](mailto:info@integrity6.com).

## Why Open Source?
At Integrity6, we believe in supporting charter schools with practical tools. This is one way we’re giving back—open, transparent, and free for non-commercial use.

## Contact
Reach out via [peter@integrity6.com](mailto:peter@integrity6.com) if you’re a charter school with questions. Otherwise, dive into the code!
