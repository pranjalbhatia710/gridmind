## Inspiration
MSU spends $28M/year on energy across 120 buildings, but 75% lack real-time metering and buildings operate as isolated silos. We saw that 20 research labs — just 17% of buildings — consume nearly half of all campus energy. The data to optimize exists in the 25% of buildings that ARE metered. The question was: how do you use what you have to fix what you can't see?

## What it does
GridMind is a phased campus energy intelligence platform that:
- Uses **proxy metering** to statistically model energy consumption in unmetered buildings using data from the 30 that are already metered
- Deploys **demand-controlled lab ventilation** that reduces HVAC energy by 40-60% in research labs without compromising safety (VOC sensor backstop)
- Implements **thermal ice storage** to shift cooling load from peak ($0.17/kWh) to off-peak ($0.106/kWh) hours
- Provides a **real-time campus dashboard** with building-level efficiency scoring and automated HVAC optimization
- Delivers a **self-funding phased deployment** where Phase 1 savings pay for Phase 2, achieving $7.3M annual savings on a $12M investment

## How we built it
- **Engineering:** IoT sensor architecture with LoRaWAN connectivity, VAV/DCV retrofit design for labs, thermal ice storage system specification, and steam trap monitoring network
- **Software:** React-based campus energy dashboard with proxy metering visualization, AI load balancer simulation with real-time building optimization, interactive energy simulation with adjustable parameters, and peak shaving visualization
- **Finance:** Complete 5-year capital allocation model with NPV/IRR analysis, marginal abatement cost curve for intervention prioritization, and cascading reinvestment structure

## Challenges we ran into
- Balancing lab safety (ventilation can't be reduced during active chemical use) with energy savings — solved with VOC sensor safety backstop
- Working within the $12M budget while targeting 40% emissions reduction — solved with phased deployment and self-funding cascade
- Addressing the data gap (75% of buildings unmetered) — solved with proxy metering using statistical models trained on metered buildings
- Ensuring operational continuity in research labs during retrofits — solved with zone-by-zone installation approach

## Accomplishments we're proud of
- The proxy metering concept: using 30 metered buildings to model 90 unmetered ones saves $800K+ in sensor costs
- Identifying thermal ice storage as a peak-shaving strategy that exploits the 60% peak price premium
- Achieving 45-55% IRR on the investment — 4x the typical university capital project threshold
- Building working interactive demos that show the optimization in real-time

## What we learned
- 20 labs consuming 47% of campus energy is the single most important insight — target the biggest waste first
- Software-driven optimization has 3-5x better ROI per dollar than hardware replacement
- The "limited data" constraint is actually an opportunity for creative solutions (proxy metering)
- Phased deployment with early wins builds institutional buy-in better than big-bang approaches

## What's next
- Pilot GridMind in 3-5 MSU buildings to validate proxy metering accuracy and savings projections
- Integrate with campus class scheduling system for 72-hour occupancy prediction
- Develop carbon credit monetization pathway ($30-50/ton x ~80k tons reduced = $2.4-4M additional value)
- Expand predictive maintenance to cover all 120 buildings continuously
- Explore virtual power purchase agreement (VPPA) with utility for renewable energy credits

## Built With
react, recharts, javascript, python, influxdb, lorawan, bacnet, volttron, pptxgenjs
