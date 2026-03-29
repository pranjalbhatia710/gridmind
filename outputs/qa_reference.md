# GridMind — Q&A Reference Sheet
## Convergence 2026 Hackathon

---

### Q1: "How did you come up with the savings numbers?"

Every number is benchmarked against real-world case studies. Lab ventilation 40% savings: **UC Irvine achieved 61% across 13 buildings** (DOE Smart Labs Accelerator) — we conservatively model 40%. Steam trap ROI: standard DOE/industry data shows **5-10% fail open at any time, each wasting $5-15K/year**. Peak shaving: the case itself states 60% premium — $0.17 vs $0.106 = **$0.064 savings per kWh shifted**. We can walk through the math on any line item.

**Key stat to emphasize: Every number traces back to a published case study or DOE benchmark.**

---

### Q2: "What about lab safety?"

Non-negotiable. **VOC sensors at exhaust inlets are the safety backstop.** If ANY volatile organic compound exceeds threshold, ventilation goes to maximum immediately — this is a hardware override, not software-controllable. The AI only reduces ventilation when a lab is SIMULTANEOUSLY unoccupied AND has no detected chemical activity. This is exactly the DOE Smart Labs approach validated at **15+ universities**. We never go below OSHA minimum ACH.

**Key stat to emphasize: VOC sensor hardware override — cannot be overridden by software.**

---

### Q3: "How does proxy metering work? How accurate is it?"

We use the 30 metered buildings as training data. Regression models use building characteristics (square footage, type, age, occupancy hours) plus weather data to predict hourly consumption for unmetered buildings. **Accuracy: +/-10-20%.** Not precise enough for billing, but sufficient for identifying which buildings are inefficient and should get real meters next. It's triage, not measurement. The methodology is outlined in **ASHRAE Guideline 14**.

**Key stat to emphasize: +/-15% accuracy is sufficient for prioritization — saves $800K+ vs metering all 90 buildings.**

---

### Q4: "What if the budget gets cut?"

**Phase 1 is independently viable.** $2.8M investment generates $2.5M/year in savings. Even if the entire remaining budget disappears, Phase 1 pays for itself in **14 months** and keeps saving $2.5M every year after. Each phase is standalone — they compound but don't depend on each other.

**Key stat to emphasize: Phase 1 alone = $2.8M cost, $2.5M/year savings, 14-month payback.**

---

### Q5: "Why not more solar?"

Solar has **10+ year payback at Midwest latitudes**. At $12M all-solar: ~4M kWh/year generated — just 2% of MSU's consumption. Compare lab ventilation: $3.5M investment, **20M+ kWh saved/year, 14-month payback**. We included a small solar pilot in Phase 3 for ESG visibility, but efficiency investments return **5-10x more per dollar** than generation at this scale.

**Key stat to emphasize: Lab ventilation saves 5x more energy per dollar than solar at Midwest latitudes.**

---

### Q6: "How do you handle 40+ year old buildings?"

Triage by data. Phases 1-2 use proxy metering and smart meters to **identify which old buildings are the worst performers**. Phase 3 targets the 10 worst with envelope upgrades at ~$200K each. We don't try to retrofit everything — we fix the buildings where data shows the **biggest gap between actual and expected performance**.

**Key stat to emphasize: Data-driven triage, not blanket upgrades. Fix the worst 10, not all 120.**

---

### Q7: "What's the carbon impact?"

**38% energy reduction** from 210M kWh baseline. ~80M kWh saved annually. At EPA average emission factor: **~32,000 tons CO2/year avoided**. Additional carbon benefit from peak shifting — off-peak power generation produces 20-40% fewer emissions because it uses less peaking gas turbine capacity. We estimate **~40% total emissions reduction by Year 5**, hitting the 2035 target a decade early.

**Key stat to emphasize: 40% emissions target met by Year 5 (2031), a full decade ahead of the 2035 deadline.**

---

### Q8: "What tech stack / what's the implementation architecture?"

Data collection: **LoRaWAN** IoT sensors (industry standard for campus-scale, low power, long range). Platform: **VOLTTRON** — free, open-source middleware from DOE's Pacific Northwest National Lab, designed to integrate multiple building automation systems. Time-series database: **InfluxDB**. Analytics: **Python** (scikit-learn for proxy metering models). Dashboard: **React + Recharts**. Building integration: **BACnet** protocol. All open standards — **no vendor lock-in**.

**Key stat to emphasize: VOLTTRON is DOE-developed, free, and already deployed at 15+ universities.**

---

*Print this sheet and keep it at the podium during Q&A.*
