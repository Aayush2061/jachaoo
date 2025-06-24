// app/utils/cycleUtils.ts
interface CyclePhaseInfo {
  currentDay: number;
  phase: string;
  nextPeriod: Date;
  //   fertileWindow: {
  //     start: Date;
  //     end: Date;
  //   };
  ovulationDate: Date;
}

export function getCyclePhaseInfo({
  lastPeriodDate,
  cycleLength,
  duration,
  today = new Date(),
}: {
  lastPeriodDate: string | Date;
  cycleLength: number;
  duration: number;
  today?: Date;
}): CyclePhaseInfo {
  const msPerDay = 1000 * 60 * 60 * 24;

  // 1. Validate inputs
  const start = new Date(lastPeriodDate);
  if (isNaN(start.getTime())) throw new Error("Invalid lastPeriodDate");
  if (start > today) throw new Error("lastPeriodDate cannot be in the future");
  if (cycleLength < 20 || cycleLength > 120)
    throw new Error("cycleLength out of bounds (20-120 days)");
  if (duration < 1 || duration > cycleLength)
    throw new Error("Invalid duration (must be 1-cycleLength days)");

  // 2. Calculate days
  const daysSinceLast = Math.floor(
    (today.getTime() - start.getTime()) / msPerDay
  );
  const currentDay = daysSinceLast % cycleLength;
  const ovulationDay = cycleLength - 14;

  // 3. Determine phase
  let phase: string;
  if (currentDay < duration) {
    phase = "Menstrual Phase";
  } else if (currentDay < ovulationDay) {
    phase = "Follicular Phase";
  } else if (currentDay === ovulationDay) {
    phase = "Ovulation Phase";
  } else {
    phase = "Luteal Phase";
  }

  // 4. Predict next cycle and fertile window
  const nextPeriod = new Date(start.getTime() + cycleLength * msPerDay);
  //   const fertileStart = new Date(
  //     start.getTime() + (ovulationDay - 5) * msPerDay
  //   );
  //   const fertileEnd = new Date(start.getTime() + (ovulationDay + 1) * msPerDay);

  return {
    currentDay: currentDay + 1, // Adding 1 to make it 1-based
    phase,
    nextPeriod,
    // fertileWindow: {
    //   start: fertileStart,
    //   end: fertileEnd,
    // },
    ovulationDate: new Date(start.getTime() + ovulationDay * msPerDay),
  };
}
