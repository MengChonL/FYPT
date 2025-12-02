# Game Design Principles 
## 1. Puzzle-Based Challenge 
The majority of the game's challenges are presented in the form of puzzles, such as the initial "Download Wallet" task in Part 1 and the "Spot the Difference" challenge in Part 3. The concept of "puzzle-based learning" from The is Not a Game paper does not refer to isolated brain teasers but rather the transformation of complex security concepts into "easy-to-approach and engaging exercises" (Flushman, Gondree, & Zachary, 2015).

Example: Converting the abstract concept of "domain phishing" into a concrete "spot-the-error" puzzle (e.g., in Level 3.1, finding the "0" in rev0ke.cash).

---
## 2. Scaffolding Learning 
This game adopts the principle of scaffolding learning. Before starting the game, we will first collect data to determine if the player has relevant computer science or financial experience:

If no experience: They will first undergo some simple introductory training.

If they have experience: They can start the game directly.

This allows us to compare data and observe whether inexperienced players perform better after the training than those who already have experience. The game first requires players to master the basic knowledge of Web3 investment (such as downloading a wallet, identifying URLs), and then the difficulty of the challenges gradually increases. Later levels require players to independently identify phishing traps.

Zone of Proximal Development (ZPD): Refers to tasks that are "slightly beyond" the learner's current capability but are possible with "some support" (Taber, 2018).

a. Beyond Current Capability: The task must be within the ZPD, meaning the learner cannot complete it without support.

b. Provide a Framework for Success: A supportive framework must be provided, allowing the learner to successfully complete the task while relying on this framework.

c. Eventually Lead to Independence: The scaffolding must ultimately enable the learner to complete tasks they previously could not "without support."

---
## 3. Training Adversarial Thinking 
In some levels, players are required to tag phishing traps, with the aim of training their adversarial thinking. This means we hope players can not only identify a phishing trap but also know "why" it is a trap, encouraging them to think like a hacker to understand where hackers might set up traps.

We hope players possess the following three types of adversarial thinking (Hamman, 2016):

Analytical - Technical Capability: This refers to the hacker's "technical capability." This is not just knowing how to use tools, but a deep understanding of the underlying technology, including "computer network protocols, low-level programming languages, and operating systems."

Example: We require players to mark the authorization functions approve and setApprovalForAll, requiring them to understand the functionality of these functions.

Creative - Unconventional Perspective: This is the core of the "hacker mindset." It refers to the ability to "discard conventional wisdom" and "manipulate and extend technology in unexpected ways." Hackers are obsessed with exploring the system's possibilities, finding vulnerabilities that the system designers never considered.

Example: Players are required to find errors in domain names, such as rev0ke, which precisely demands this kind of thinking to recognize these types of hacker phishing attacks.

Practical - Strategic Reasoning: This refers to the hacker's capability for "strategic reasoning." This is not merely technical operation but includes "planning and executing attacks, evading detection, and overcoming obstacles." A classic example in this area is social engineering.

Example: In some levels, we incorporate social engineering tactics like the use of phrases such as "urgent update."

---
# Approval Phishing challenge design
## Level 1: Identifying Phishing Domains 
Challenge: The player receives a Google search result page for "DeFi platforms." This result page contains a mixture of legitimate and fake DeFi platforms. A trash can icon is provided on the screen.

Task: The player must determine which domains are legitimate and which are suspicious (phishing). The player needs to drag the search results with strange or suspicious-looking domains into the trash can.

Scoring: Points are awarded for successfully identifying and discarding the phishing domains.

---

## Level 2: Airdrop Authorization Scam 
Context: The player enters the DeFi world and hears that airdrops are the fastest way to make money. They see a trending post on Platform X about a new DeFi platform distributing an airdrop.

Flow:

The player clicks on the post, which leads to an airdrop claim page.

Upon clicking to claim the airdrop, a wallet pop-up appears.

The pop-up shows a signature request for an approve transaction, authorizing unlimited USDC.

Task: The player must try to identify all the problems with this airdrop and mark the suspicious elements with a red marker pen (the mouse is transformed into a marker).

Four Correct Answers to Mark:

The Airdrop Post (the trending post on Platform X).

The DeFi Platform Link/URL.

The approve function in the wallet pop-up.

The Unlimited Authorization Amount (unlimited allowance).

**In this challenge, the player can cancel the airdrop if they found some suspicious things**

---

## Level 3: Fake DEX Swap Website 
Context: The user is attempting to perform a token swap on a fake Uniswap website, aiming to exchange 1000 USDT for 1000 USDC.

Scenario 1 Flow:

The player enters the fake Uniswap website, selects the tokens for the swap (USDT to USDC), and clicks "Swap."

A wallet transaction authorization pop-up appears. The spender address in this transaction is malicious.

Context (Continued): After successfully exchanging 1000 USDC, the user still needs to exchange 50 USDC for 50 DAI on this platform.

Scenario 2 Flow:

The player remains on the fake Uniswap website, selects the tokens for the next swap (USDC to DAI), and clicks "Swap."

A wallet transaction authorization pop-up appears. The spender address in this second transaction is also malicious.

Task: After performing the transaction in both scenarios, the player must use the red marker pen to mark the similarities between the two signature requests and the website's domain name.

Two Correct Answers to Mark:

The Transaction Spender Address (which should be the same malicious address in both pop-ups).

The Website Domain Name (the URL of the fake Uniswap site).
### The grading system will be removed since the platform are designed to web3 newbie and just for education!
---
# References
[1] K. Taber, “Scaffolding learning: Principles for Effective Teaching and the Design of Classroom Resources,” ResearchGate, 2018. https://www.researchgate.net/publication/327833000_Scaffolding_learning_Principles_for_effective_teaching_and_the_design_of_classroom_resources

[2] S. Hamman, “Teaching Adversarial Thinking for Cybersecurity,” CedarCommons, 2016. https://digitalcommons.cedarville.edu/engineering_and_computer_science_presentations/190/

[3] T. Flushman, M. Gondree, and Zachary, “This is Not a Game: Early Observations on Using Alternate Reality Games for Teaching Security Concepts to {First-Year} Undergraduates,” Usenix.org, 2015. https://www.usenix.org/conference/cset15/workshop-program/presentation/flushman (accessed Nov. 15, 2025).
