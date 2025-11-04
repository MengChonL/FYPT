# September Summary
### Mission:
Game Design & Technical Planning 
- Finalize game rules, mechanics, items, challenge types, and difficulty distribution
- Design database schema
- Define tech stack 
- Create key flowcharts: scoring system, item usage, leaderboard, player data collection
---
### Game Design & Rules:
Game names: Web3 Phishing Terminator <br>
Game rules:<br> 	
This is a simulation game to try out your Web3 security skills. Your mission is to act as a crypto user and defend your assets in a virtual environment of online perils.
Protect Your Assets: You are endowed with a starting balance. With every question, you receive a scenario, and you must correctly verdict it as "Address Poisoning," "Approval Phishing," or a "Safe Transaction." A correct answer earns you assets, while mistakes will be extremely expensive.
Beware of "Panic Mode": This is the game's most significant mechanic. You automatically enter "Panic Mode" if you answer 2 questions incorrectly in a row. While in this mode, all correct response rewards are reduced by half and wrong response fines are doubled, and your balance falls rapidly. You must answer a question correctly to disable this mode and return to normal. But the purpose is to give the players who don't have investment experience a better game experience. This mechanic will only appear on players who have investment experience.
Adjust to Randomness; You Can't Memorize: The order of questions within a level is randomly shuffled for each attempt. Even when you repeat a level, you'll face a different order of problems. This is testing your actual identification skills, not your memory.
Make the Most of Your One-Time Item: At the end of every level, you will have a special "Item" which can be used once in order to help you make the right response on a difficult question. Since you only receive one per level, use it at the most critical moment.
Your last goal is to be able to finish all 5 levels by having a balance of over a constant balance at the conclusion of each. This game not only tests your knowledge, but also your ability to make clean decisions under pressure.
If the player completes some achievements or challenges within the game, they will be awarded image-based simulated NFTs to commemorate their in-game accomplishments.

Challenge distributes:<br>
Level Question Pool Structure (question content is fixed; order is randomized):
- 2 questions: Address Poisoning
- 2 questions: Approval Phishing
- Some safety questions will mix in

---
### Tech Stack
We built "Web3 Phishing Terminator" using React.js, HTML, JavaScript, CSS, Node.js, and PostgreSQL (Supabase) to create a responsive, interactive, and educationally effective simulation that mirrors real-world Web3 threats. Based on our lecture and our intern experience, we chose React.js for its component-driven architecture—ideally adapted to managing dynamic game states like "panic mode," item utilization, and real-time balance updates. Node.js powers the lean backend, making it easy to integrate with a PostgreSQL database to persist and randomly shuffle static question pools by level while keeping deployment easy. The HTML/CSS/JavaScript trio ensures broad accessibility across devices without requiring excessive infrastructure..

---
# All of above will be redesigned