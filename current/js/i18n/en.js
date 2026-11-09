export const en = {
    agenciaAria: 'Agency', equipeCampoAria: 'Team in the field', incertezaAria: 'uncertainty',
        // Menu
        newGame: "New Game",
        continue: "Continue",
        missions: "Missions",
        modoProfessor: "Single missions (teacher)",
        howToPlay: "How to Play",
        settings: "Settings",
        back: "Back",
        selectMission: "Select Mission",
        tabMissoes: "Missions",
        tabInvestigacoes: "Investigations",
        
        // Story
        continueStory: "Continue →",
        
        // Game HUD
        score: "Score",
        
        // Modals
        identifySource: "Identify the Source",
        selectIsotope: "Select the isotope based on your readings:",
        ok: "OK",
        cancel: "Cancel",
        paused: "PAUSED",
        resume: "Resume",
        restart: "Restart Mission",
        quitMission: "Quit to Menu",
        missionComplete: "MISSION COMPLETE!",
        timeElapsed: "Time",
        accuracy: "Accuracy",
        scoreLabel: "Score",
        nextMission: "Next Mission",
        backToBase: "Back to Base",
        sourcesCollected: "Sources collected",
        replay: "Replay",
        backToMenu: "Menu",
        
        // How to Play
        howToPlayTitle: "How to Play",
        movement: "Movement",
        movementDesc: "Use arrow keys or WASD to move. Hold SHIFT to run (uses stamina).",
        geiger: "Geiger Counter",
        geigerDesc: "Press G to toggle the Geiger counter. It detects ionizing radiation through gas ionization - each 'click' represents particle detection!",
        shields: "Shields",
        shieldsDesc: "Press 1-4 to change shields (1 = none, 4 = lead); on a team mission, 7, 8, 9 and 0 switch the scientist in the field. Different radiation types are blocked by different materials:",
        alphaDesc: "α (Alpha): Heavy helium nuclei. Stopped by a few centimeters of air, a sheet of paper, or the outer layer of skin. Dangerous if inhaled or ingested!",
        betaDesc: "β (Beta): Fast electrons. Reduced by aluminum and acrylic; only low-energy betas are fully stopped by a few mm.",
        gammaDesc: "γ (Gamma): High-energy photons. Requires dense materials like lead for significant attenuation.",
        identify: "Identification",
        identifyDesc: "Get close and press Q to identify. Compare readings WITH and WITHOUT shields to determine radiation type!",
        
        // Educational tips
        eduTipTitle: "📚 Did you know?",
        
        // Settings
        settingsTitle: "Settings",
        musicOn: "Music on",
        soundOn: "Sound effects on",
        soundVolume: "Sound Volume",
        musicVolume: "Music Volume",
        showHints: "Show educational hints",
        screenShake: "Screen shake effects",
        
        // Notifications
        tooFar: "Too far from source! Get closer.",
        lowSignal: "Signal too low. Move closer and check your readings.",
        wrongIsotope: "Wrong isotope! Check your shield readings again.",
        correctIsotope: "Correct! Source identified!",
        allFound: "All sources found!",
        
        // Educational hints by type
        alphaHint: "α particles are HELIUM NUCLEI (2 protons + 2 neutrons). Very ionizing, but they can't get through even a sheet of paper!",
        betaHint: "β particles are HIGH-SPEED ELECTRONS. They get through skin, but low-energy ones are stopped by a few mm of aluminum; high-energy ones (Sr-90/Y-90) are only reduced.",
        gammaHint: "γ rays are HIGH-ENERGY PHOTONS. They require dense materials like lead - even then, only attenuated, never fully stopped!",
        betaGammaHint: "This source emits {0}. Measure without a shield and then with an aluminum or acrylic plate: what disappears is the beta. Then measure with lead: what is still left is the gamma. If, with lead, the reading falls to the background (about 5 cps), there is no gamma: it was only beta (very energetic beta, such as the Y-90 beta of Sr-90, goes through part of the thin plates). Among sources with beta and gamma, the one with the more energetic gamma loses less in lead. Compare the readings.",
        emissionsLabel: "Emissions",
        radiumHint: "💡 Radium paint was luminous (the radium excites a phosphor, zinc sulfide). Look for contaminated paint pots and brushes. Get VERY close: in the game alpha is measured only within 50 cm (in real life it is a few centimeters).",
        pularAcademia: "I already know the basics: skip the Academy",
        inventory: "Inventory",
        corAzul: "blue",
        corVermelha: "red",
        chavePegou: "🔑 You picked up the {cor} key!",
        portaTrancada: "🔒 Locked door: look for the {cor} key.",
        portaAberta: "🔓 Door opened with the {cor} key!",
        assistAlfa: "🔧 Detector more sensitive: alpha reach increased to 75 cm. Keep sweeping the furniture!",
        assistAlfaFim: "Detector assist (alpha) was on",
        
        // NEW: Real accident-based missions
        tutorialTitle: "First steps",
        tutorialDesc: "Three sources, three quick lessons: Geiger, shielding and protection. About 5 minutes.",
        tutorialStory: "Welcome to the Chronos Agency. You already hold the Geiger counter and three sources are hidden in this room. Switch the Geiger on (G), walk slowly and follow the clicks. Each source you identify brings a lesson of a few seconds.",
        mission1Title: "Hunter Academy",
        mission1Desc: "8-room laboratory with 5 hidden sources (rooms 4 to 8). Learn the basics of detection at your own pace (it can be skipped).",
        mission2Title: "Goiânia Junkyard",
        mission2Desc: "1987, Brazil. Find Cs-137 fragments scattered in the scrapyard.",
        mission3Title: "Radium Girls",
        mission3Desc: "1920s watch factory. Ra-226 was used to paint luminous dials.",
        mission4Title: "Chernobyl Exclusion",
        mission4Desc: "1986, USSR. The worst nuclear disaster. Sources near reactor only.",
        mission5Title: "Lia Case",
        mission5Desc: "Georgia, 2001. Orphan sources found in remote forest by woodcutters.",
        
        // Additional UI
        findSources: "Find {0} sources",
        mission: "Mission",
        
        // NEW: Educational stories based on real accidents
        story1: `HUNTER ACADEMY - UNIVERSITY LAB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to Radiation Hunter training. Before going into the field, you practice in a university radioisotope lab where nothing is secret and everything gets measured.

📚 LESSON: how a Geiger counter works

The Geiger-Müller tube holds a gas that ionizes when a particle passes through. Each ionization becomes a click: more radiation means more clicks per second (cps).

KEY CONCEPTS
• Background radiation always exists (cosmic rays, rocks, the air itself). In the game it is about 5 cps; in a real detector it depends on the probe.
• Inverse square: double the distance from a small source and the rate drops to a quarter.
• Clicks are random (a Poisson process). That is why the panel shows the average of the last 3 s and the uncertainty (±): a weak source takes patience.
• Alpha is measured only with the probe almost touching the source. Beta reaches a few meters. Gamma goes through almost everything.
• The probe sees best in front of you: point it at what you want to measure.

Your mission: walk through the lab's 8 rooms and read a short lesson in each. The 5 radioactive sources are in rooms 4 to 8. Rooms 4 and 8 are locked and hidden: look for the colored keys. Compare the reading WITH and WITHOUT shielding to work out the radiation type.

Source: the game's physical parameters (NIST XCOM; LNHB tables).`,

        story2: `GOIÂNIA, BRAZIL - SEPTEMBER 1987
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A TRUE STORY that changed radiation safety worldwide.

On 13 September 1987, two people entered the abandoned clinic of the former Instituto Goiano de Radioterapia and removed the cesium-137 source assembly from the radiotherapy unit, believing it had scrap value. It was sold to a junkyard. On 18 September the capsule window was punctured and the cesium chloride powder spread: 93 g with an activity of 50.9 TBq.

📚 LESSON: how the contamination spread
• The powder passed from hand to hand and reached several homes.
• A six-year-old girl ate with hands contaminated by the powder. She died: estimated dose 6 Gy.
• Four people died in about a month.

📊 THE ACCIDENT IN NUMBERS (IAEA report, 1988)
• ~112,000 people monitored; 249 contaminated inside or outside
• 85 houses significantly contaminated; 200 people evacuated from 41 of them; 7 houses demolished
• 3,500 m³ of waste, kept at a temporary storage site 20 km from the city

🎮 IN THE GAME: 5 cesium-137 fragments are scattered in the junkyard. They emit beta and GAMMA: beta drops with a few mm of aluminum, but only a dense material, such as lead, attenuates gamma well.

Source: IAEA, "The Radiological Accident in Goiânia" (1988).`,

        story3: `DIAL FACTORY - UNITED STATES, 1910s-1920s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The "RADIUM GIRLS": young women who painted watch dials with radium-based luminous paint.

At the U.S. Radium factory in Orange, New Jersey, the painters shaped their brush tips with their lips. Grace Fryer, who started in 1917, estimated she did it about six times per dial. In 1927 she and four other women sued the company; the settlement, in June 1928, paid each of them $10,000 plus a $600 annual annuity for as long as they lived.

📚 LESSON: radium-226 (Ra-226)
• Half-life: 1,600 years
• Emits 4.78 MeV alpha particles
• Mimics calcium: deposits in BONE, where the alpha radiation stays inside the tissue
• The real paint also contained mesothorium (Ra-228, 5.8-year half-life); the game simplifies to Ra-226
• By 1925 the medical literature was already speaking of "radium (mesothorium) necrosis"

⚠️ THE ALPHA CHALLENGE
• In air, alpha travels only a few centimeters: you must touch the probe to the source
• In the game the range was stretched to about 50 cm, so it stays playable
• Any barrier, even a sheet of paper, stops alpha

🎮 IN THE GAME: every source is radium-226 in contaminated paint. Check benches, pots and brushes.

Source: environmentalhistory.org (case summary); USTUR/Washington State University, "The Saga of the Radium Dial Painters" (Ra-226/Ra-228).`,

        story4: `CHERNOBYL, USSR - APRIL 26, 1986
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reactor 4 of the Chernobyl plant exploded during an experiment with the plant's independent power supply, and the fire burned for days. Major releases continued for ten days. According to INSAG-7 (IAEA, 1992), the main cause was the reactor's unstable physical behavior, made worse by unapproved changes to the test procedure and a deficient safety culture; the report admits it is not known for certain what started the power excursion.

About 50,000 residents of Pripyat left within 40 hours. In all, 116,000 people were evacuated from the most affected area in spring and summer 1986.

📚 LESSON: the reactor isotopes
• Iodine-131: 8-day half-life, builds up in the thyroid; more than 4,000 thyroid cancer cases among people who were children or adolescents at the time (diagnosed by 2002)
• Cesium-137: 30-year half-life, contaminates soil for decades
• Strontium-90: 28.8-year half-life, mimics calcium; matters most close to the reactor
• Among emergency workers, 134 had acute radiation syndrome and 28 died in 1986

🎮 IN THE GAME: sources are concentrated near the damaged reactor. Cobalt-60 was removed from this mission: it is not one of the accident's main radionuclides.

Source: IAEA, INSAG-7 (1992); Chernobyl Forum (IAEA/WHO/UNDP), 2005.`,

        story5: `LIA, GEORGIA - DECEMBER 2001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On 2 December 2001, three men from the village of Lia went to collect firewood in a mountain forest below the Enguri dam. They found two metal cylinders and took them to camp: they served as heaters overnight, about 10 cm from their backs.

They were radioisotope thermoelectric generator cores (RTG, Beta-M model, made in 1983), powered by strontium-90, with about 1,300 TBq each (1,480 TBq by design). At 1 m the dose rate reached about 1 Sv/h. Built in the Soviet Union, they were left without supervision or control.

📚 LESSON: orphan sources
• Sr-90: beta emitter; the heat comes from its own decay
• All three were hospitalized in Zugdidi on 22 December with acute radiation syndrome and transferred to Tbilisi the next day
• Recovery took place on 2-3 February 2002 in an IAEA-led operation, using a lead-shielded container (about 25 cm thick; the report also cites 27 cm)
• One of the three died on 13 May 2004

🎮 IN THE GAME: the area has other, fictional orphan sources (Cs-137, Co-60 and Am-241), so you can practice every radiation type.

Source: IAEA, "The Radiological Accident in Lia, Georgia" (2014).`,

        story6: `ZARAGOZA, SPAIN - DECEMBER 1990
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What actually happened: at the Hospital Clínico Universitario in Zaragoza, an electron linear accelerator (Sagittaire model) broke down on 5 December. The maintenance technician left it in manual mode, with the electrons always at 36 MeV, whatever energy was selected. Treatments resumed on 10 December and were suspended on 20 December. 27 patients were treated in that period; according to the IAEA, 15 died as a result of the overexposure and, in 2 more, radiation was a major contributing factor.

📚 LESSON: an accelerator is not a radioactive source
• The accelerator emits radiation only while it is on: no isotope was involved
• The cause was a maintenance error followed by procedures not followed, according to Spain's Nuclear Safety Council (CSN)
• No worker or member of the public was affected

🎮 IN THE GAME (fiction): a rumour says the hospital lost a radioactive source, as in Goiânia. You survey with the Geiger and find NUCLEAR MEDICINE sources (exam radiopharmaceuticals such as Tc-99m and I-131), not radiotherapy ones. They are not the cause of the accident. Afterwards, an investigation with the hospital staff solves the mystery.

Source: CSN (Spain), monograph on the accident (2022); IAEA, Radiation Protection of Patients (equipment and patient numbers).`,

        story7: `MAYAPURI, NEW DELHI, INDIA - APRIL 2010
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A gamma irradiator from the Chemistry Department of Delhi University, acquired from Canada in the late 1960s and out of use since 1985, was sold as scrap. In a Mayapuri scrapyard the equipment was opened and its lead shielding cut.

📚 LESSON: cobalt-60
• Half-life 5.27 years; emits 1.17 and 1.33 MeV gamma rays
• According to the Indian government, the equipment held 16 Co-60 pencils, each with 7 slugs: 112 slugs, all recovered afterwards
• Seven people were hospitalized with radiation injuries; one died on 26 April 2010
• The sources were recovered between 8 and 15 April

🎮 IN THE GAME: the sources are Co-60 fragments scattered in the scrapyard. Range and activity are didactic choices, not the accident's values.

Source: Government of India statement in Parliament (Lok Sabha); AERB and IAEA INIS record; medical article on the case (2013). Co-60 activity (AERB slides): 147.186 TBq in 1969 and about 688 GBq in April 2010.`,

        story8: `FUKUSHIMA DAIICHI, JAPAN - MARCH 11, 2011
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Tōhoku earthquake and tsunami struck the plant. Units 1, 2 and 3 suffered core meltdowns; hydrogen explosions hit the buildings of units 1, 3 and 4.

📚 LESSON: the radiological legacy
• INES level 7, the same as Chernobyl
• Main radionuclides released: iodine-131 and cesium-137
• About 110,000 people were evacuated because of the radiological situation (about 165,000 displaced in the prefecture in total); by the end of 2020, about 37,000 had not returned
• Decommissioning is estimated at 30 to 40 years

🎮 IN THE GAME: final mission, with several isotopes and strong readings. Cobalt-60 was removed from this mission: it is not one of the accident's main isotopes.

Source: BASE (Germany), "Fukushima ten years later"; IAEA, Fukushima Daiichi Accident Report (2015).`,

        // New mission titles and descriptions
        mission6Title: "Zaragoza",
        mission6Desc: "1990, Spain. Real medical accelerator accident, no isotope involved. Here, a fictional hospital survey: the Geiger finds exam sources (nuclear medicine), and an investigation afterwards solves the mystery.",
        mission7Title: "Mayapuri Scrapyard",
        mission7Desc: "2010, India. Co-60 irradiator dismantled by unsuspecting workers.",
        mission8Title: "Fukushima Zone",
        mission8Desc: "2011, Japan. Triple meltdown - the ultimate challenge.",

        // Shields, completion, time goal, touch
        shieldNone: "No shield",
        shieldAlu: "Aluminum (3 mm)",
        shieldAcr: "Acrylic (5 mm)",
        neutronHint: "This source emits neutrons and gamma. The Geiger counter only sees the high-energy gamma, which lead barely attenuates. The neutrons only show on a dedicated detector and call for hydrogen-rich material such as polyethylene.",
        shieldPe: "Polyethylene (5 cm) · only after researching the neutron detector",
        shieldPb: "Lead (1 cm)",
        completeExceptional: "Exceptional work, Hunter! You're a natural.",
        completeGreat: "Great job! Your radiation detection skills are improving.",
        completeGood: "Good effort. Practice makes perfect!",
        completeBase: "Mission complete. Keep training to improve your accuracy.",
        perfectHunter: "Perfect Hunter!",
        achievementUnlocked: "Achievement Unlocked!",
        timeGoal: "Goal",
        timeGoalMet: "Within the time goal",
        timeGoalMissed: "Over the time goal",
        touchRun: "Run",
        touchGeiger: "Geiger",
        touchIdentify: "Identify",
        pauseBtn: "Pause",
        // Notas de campo (etapa 4): aparecem ao identificar a 1ª, 2ª, 3ª e 4ª fonte
        fact1_1: "Congratulations on the first source. Notice how the reading rises smoothly as you approach: that is the inverse square law.",
        fact1_2: "A good routine: switch the Geiger on, walk slowly, wait for the 3 s average to settle, and only then compare WITH and WITHOUT shielding.",
        fact1_3: "Alpha vanishes with any shield; beta is reduced or stopped by aluminum and acrylic; gamma barely changes, only lead cuts it a lot.",
        fact1_4: "Activity is the number of decays per second (becquerel). The detector counts only a fraction of them: it depends on distance, shielding and radiation type.",
        fact2_1: "Cs-137 emits beta and gamma: the 662 keV gamma (actually emitted by its daughter Ba-137m) is what the Geiger picks up from afar. Half-life 30.018 years (LNHB table).",
        fact2_2: "The six-year-old girl's estimated dose was 6 Gy; for other fatal victims, between 4.5 and 5.7 Gy (IAEA, 1988). The gray (Gy) measures absorbed energy per kilogram of tissue.",
        fact2_3: "If that source were intact today, in 2026, about 21 TBq of the original 50.9 TBq would remain: half is lost every 30 years.",
        fact2_4: "A local physicist was the first to assess the scale of the accident, by measuring. Without measurements, nobody knew what was contaminated.",
        fact3_1: "As early as 1925 the medical literature described radium necrosis: Hoffman (JAMA) reported about 5 deaths and 12 living cases among dial painters.",
        fact3_2: "The 4.78 MeV alpha has a range of a few centimeters in air, but inside bone it deposits all its energy in living tissue.",
        fact3_3: "In 1929 the US Department of Labor banned tipping brushes with the mouth. Before that, on 20 December 1928, the US Surgeon General convened a conference that set up two committees: one to investigate working conditions, one to recommend protective measures. In a press statement, Marie Curie called it imperative to change the method of using radium.",
        fact3_4: "Marie Curie told the press there was no means of destroying radium once it enters the body. With a half-life of 1,600 years, internal contamination does not fade on the scale of a lifetime.",
        fact4_1: "At Chernobyl, radioactive iodine (I-131, 8-day half-life) is associated with the more than 4,000 thyroid cancer cases among people who were young at the time; cesium-137 (30 years) is what lasts in the landscape.",
        fact4_2: "Strontium-90 (28.8 years) mimics calcium and settles in bone; it matters mainly near the reactor.",
        fact4_3: "The exclusion zone has a 30 km radius. The strongest sources are near the reactor: go carefully and use the Geiger to decide where to enter.",
        fact4_4: "Of the emergency workers, 134 had acute radiation syndrome and 28 died in 1986.",
        fact5_1: "Each RTG core held about 1,300 TBq of Sr-90 according to the certificate (1,480 TBq by design): over 1 PBq, more than a million billion decays per second. At 1 m, the certificate gave about 1 Sv/h and on-site measurements gave about 670 and 580 mSv/h.",
        fact5_2: "Sr-90 emits beta, but also produces bremsstrahlung in the metal, which are X-rays and go through more matter than the electrons do.",
        fact5_3: "An orphan source is one outside regulatory control, through abandonment, loss or theft. There is not always a warning: the radiation symbol may be gone.",
        fact5_4: "Two of the men stayed about 10 cm from the cylinders for 1 to 1.5 h each. The heat they were after came from Sr-90 decay itself.",
        fact6_1: "An electron accelerator contains no isotope: switched off, radiation stops. The danger there is treatment dose, not contamination.",
        fact6_2: "The fault began with a short circuit in the transistors that regulate beam deflection; the technician fixed the energy at 36 MeV (CSN).",
        fact6_3: "With the wrong energy the dose rose about 7 times at 7 MeV, 5 times at 10 MeV and 3 times at 13 MeV (CSN simulation, 5 Jan 1991); the IAEA gives about 9 times at 7 MeV.",
        fact6_4: "The CSN report points to an error by the supplier's maintenance staff and procedures not followed at the hospital, due to a lack of coordination between services.",
        fact7_1: "The irradiator came from Canada in the late 1960s (Parliament and AERB say 1969; a medical paper, 1968) and operating authorization came in January 1970; in India an old source like this is called 'legacy'.",
        fact7_2: "Co-60 has a 5.27-year half-life: from 1969 to 2010 (41 years), about 0.5% of the original activity remained, still very dangerous.",
        fact7_3: "According to one Indian government statement, the device had not been used for over 15 years (another says over 20) when it was auctioned as scrap. A forgotten source stays radioactive.",
        fact7_4: "The worker who died, a man, was the one who dismantled the equipment and handled the sources. The dose calculated by BARC was 3.1 Gy; the autopsy pointed to shock from septicemia after acute exposure. AERB issued a show-cause notice to the university on 29 April 2010.",
        fact8_1: "Iodine-131 from Fukushima temporarily exceeded drinking-water limits for young children in Tokyo (BASE).",
        fact8_2: "The IAEA report (2015) was prepared with about 180 experts from 42 countries.",
        fact8_3: "Decommissioning should take 30 to 40 years; international IAEA missions have reviewed the roadmap since 2013.",
        fact8_4: "Evacuating also has a cost: the IAEA notes that conservative protective decisions led to extended restrictions and difficulties.",
        fieldNote: "Field note",
        encCounter: "Encounter {0} of {1}",
        encReinforce: "Reinforcement card: a simpler question",
        encSureMyth: "Definitely a myth",
        encProbMyth: "Almost sure it is a myth",
        encDunno: "I don't know",
        encProbFact: "Almost sure it is a fact",
        encSureFact: "Definitely a fact",
        encDunnoBack: "No problem: see the answer.",
        encMyth: "Myth",
        encFact: "Fact",
        encSkip: "Skip (counts 0% in this encounter)",
        encRight: "Correct!",
        encWrong: "Not quite.",
        encAnswer: "Answer",
        encSource: "Source",
        encContinue: "Continue",
        encSimpler: "Try a simpler question",
        encSkipped: "Encounter skipped: 0% in this encounter",
        encFullCredit: "Right on the first try!",
        encPartialCredit: "Right with the help of the card",
        encTeach: "Let's go through the answers together",
        encSolutions: "Answers, from the simplest to the original:",
        encCredit: "Credit in this encounter: {0}%",
        encBackToField: "Back to the field",
        encTheme_natureza: "Nature",
        encTheme_decaimento: "Decay",
        encTheme_protecao: "Protection",
        encTheme_dose: "Dose",
        encTheme_fontes: "Sources",
        encTheme_historias: "Stories",
        notebook: "Field Notebook",
        notebookLocked: "Not discovered yet",
        notebookWhere: "May appear in: {0}",
        notebookMastery: "Encounter progress",
        notebookAnswered: "{0} right out of {1} answers",
        notebookCount: "{0} of {1} concepts discovered",
        notebookEmpty: "Nothing here yet.",
        usage: "Overall score",
        usageDetail: "Sources {0} + time {1} + encounters {2} + vault {3}",
        usageStudy: "study mode: time does not count and the other weights were rescaled",
        studyMode: "Study mode (no time weight)",
        evidNoShield: "reading without a plate",
        evidWithShield: "reading with a plate",
        needMoreData: "Not enough data yet",
        neutronAria: "Neutron detector: counts per second", neutronRot: "Neutrons: {0} cps",
        camaraAria: "Ionization chamber: game-estimated dose rate", camaraRot: "Chamber: {0} mSv/h (game estimate)",
        useSpectro: "Use the spectrometer", spectroGamma: "Spectrometer: gamma line(s) at {0}.", spectroNoGamma: "Spectrometer: no gamma lines; the source does not emit gamma.", spectroNoData: "Spectrometer: no emission data for this source.", wrongIdDose: "The delay next to the source cost the scientist {0} mSv.",
        moreDataMissing: "Good call: data is still missing. Measure the same source, at the same distance, with no plate and with aluminum, acrylic and lead, and compare.",
        moreDataEnough: "You already have readings without and with a plate. Compare the drops, rule out the incompatible candidates and decide.",
        methodNote: "Method note: you identified the source without comparing readings with and without a plate. Here the choice is among known candidates; in the real world a single Geiger reading does not identify a source.",
        usageMax: "maximum possible {0}%",
        usageDica: "location hints: {0} (−{1} points)",
        dicaBtn: "Hint",
        dicaAviso: "Hint: remaining sources in red on the map (−2 usage points).",
        dicaMiniAviso: "Taking a while? Remaining sources blink red on the minimap.",
        encountersToggle: "Learning encounters and vault",
        encountersWarn: "Without encounters and vault, the maximum overall score is 75%.",
        reviewMode: "Review mode (for reviewers)",
        reviewModeHint: "Shows note fields, source labels and version notices in the investigations. Off by default.",
        closeNotebook: "Close the notebook",
        notebookReset: "Erase notebook progress",
        notebookResetConfirm: "Click again to confirm (erases the cards and stamps)",
        notebookResetDone: "Notebook erased.",
    };
