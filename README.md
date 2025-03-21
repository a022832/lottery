# School Bus Lottery Program

This is the source code for a school bus seat lottery system, built with Google Apps Script by Integrity6. It fairly assigns limited bus seats using a weighted random selection based on distance, with configurable sibling options. We’re sharing it as an open-source tool to support charter schools—part of our mission to help them succeed.

## Purpose
Created to streamline bus seat assignments for a charter school, this code is public so anyone can verify its fairness or adapt it for their own use. It runs in a Google Sheet, but the spreadsheet setup isn’t included—dig into the code to figure it out.

## How It Works
- Pulls applicant data from a Google Sheet.
- Assigns weights by distance (via a weight table).
- Runs a lottery with two modes:
  - **Mode 1**: Sibling Preference (siblings get priority).
  - **Mode 2**: Siblings Pulled Together (siblings stay together if picked, no priority).
- Outputs awarded seats and a waitlist.

## Setup
Requires a Google Sheet with specific sheets and columns—see `lottery.gs` for details (e.g., `getSheetByName`, `getRange`). No pre-built spreadsheet here; this is the raw script for transparency and reuse.

## License
Licensed under [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/):
- Use and share it with credit to Integrity6 (www.integrity6.com).
- No commercial use or modifications allowed.

## Credits
Built by Peter Mojica, Co-Founder of Integrity6, as a courtesy to charter schools. No support or maintenance provided—use at your own discretion.

## For Challengers
Questioning the process? The logic’s all here—weighted randomization, sibling handling, and more. Check it out.

## Why Open Source?
At Integrity6, we believe in supporting charter schools with practical tools. This is one way we’re giving back—open, transparent, and free for non-commercial use.

## Contact
Reach out via [peter@integrity6.com] if you’re a charter school with questions. Otherwise, dive into the code!
