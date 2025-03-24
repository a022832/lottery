# School Bus Lottery Program
This is the source code for a school bus seat lottery system, built with Google Apps Script by Integrity6. It fairly assigns limited bus seats using a weighted random selection based on distance, with configurable sibling options. We’re sharing it as an open-source tool to support charter schools—part of our mission to help them succeed.

## Purpose
This project began when a customer—a charter school—asked for help with their bus lottery. They were drawing names from a paper bag on a Zoom call, an inefficient process that led to parent complaints about fairness. While this wasn’t part of our core SaaS platform—and frankly, not significant enough to build into it—we love supporting our customers, so we stepped up to find a solution. At first, we considered Excel, but its proprietary nature and lack of cloud-native transparency made it a poor fit for a public lottery. A native Windows .NET app was another option, but custom software raised questions about what’s running behind the scenes—especially after the “names in a hat” method already sparked fairness doubts. Instead, we chose Google Apps Script: it’s widely accessible, JavaScript-based for openness, natively cloud-based, and pairs with Google Sheets, a tool already common in K-12 education. This eliminated the opacity of a custom GUI and delivered a simple, transparent system anyone can verify or adapt. Built to streamline seat assignments and restore trust, it aligns with our mission to help charter schools succeed.

## How It Works
- Pulls applicant data from a Google Sheet.
- Assigns weights by distance (via a weight table).
- Runs a lottery with two modes:
  - Mode 1: Sibling Preference (siblings get priority).
  - Mode 2: Siblings Pulled Together (siblings stay together if picked, no priority).
- Uses the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) for randomization—a proven algorithm that shuffles applicants fairly.
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
Questioning the process? The logic’s all here—weighted randomization with Fisher-Yates, sibling handling, and more. Check it out.

## Performance Notes
We tested this script with a dataset of 6,330 rows (demand: 20,902 seats), averaging 10.84 miles from school, an average of 3.3 seats requested per application, and 240 sibling-preference cases. Setup: 60 seats awarded, partial awards allowed ("No" setting), and sibling preference at 2 (siblings pulled together, no priority). Weights by distance: 1-5 miles (1), 5.1-10 (2), 10.1-20 (3), 20
