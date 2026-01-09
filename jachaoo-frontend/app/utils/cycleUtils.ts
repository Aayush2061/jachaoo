export interface CyclePhaseInfo {
  currentDay: number;
  phase: string;
  nextPeriod: Date;
  ovulationDate: Date;
  phases: {
    Menstrual: string[];
    Follicular: string[];
    Ovulatory: string[];
    Luteal: string[];
  };
  fertileWindow: string[];
}

export interface PeriodData {
  lastPeriodDate: string;
  cycleLength: number;
  duration: number;
  symptoms?: string[];
}

export function isPeriodIrregular(periodsData: PeriodData | null): boolean {
  if (!periodsData) return false;

  const NORMAL_CYCLE_RANGE = { min: 25, max: 35 };
  return (
    periodsData.cycleLength < NORMAL_CYCLE_RANGE.min ||
    periodsData.cycleLength > NORMAL_CYCLE_RANGE.max
  );
}

export function getCyclePhaseInfo({
  lastPeriodDate,
  cycleLength,
  duration,
  today = new Date(),
  numberOfCycles = 4,
}: {
  lastPeriodDate: string | Date;
  cycleLength: number;
  duration: number;
  today?: Date;
  numberOfCycles?: number;
}): CyclePhaseInfo {
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(lastPeriodDate);
  if (isNaN(start.getTime())) throw new Error("Invalid lastPeriodDate");

  const totalDays = cycleLength * numberOfCycles;
  const ovulationDay = cycleLength - 14;

  const menstrualDays: string[] = [];
  const follicularDays: string[] = [];
  const ovulatoryDays: string[] = [];
  const lutealDays: string[] = [];
  const fertileWindow: string[] = [];

  let phase = "";
  let currentDay = 0;

  for (let i = 0; i < totalDays; i++) {
    const cycleDay = i % cycleLength;
    const date = new Date(start.getTime() + i * msPerDay);
    const dateString = date.toISOString().split("T")[0];

    if (cycleDay < duration) {
      menstrualDays.push(dateString);
    } else if (cycleDay < ovulationDay - 1) {
      follicularDays.push(dateString);
    } else if (cycleDay <= ovulationDay + 1) {
      ovulatoryDays.push(dateString);
    } else {
      lutealDays.push(dateString);
    }

    if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1) {
      fertileWindow.push(dateString);
    }

    // ✅ Determine phase for today
    const todayStr = today.toISOString().split("T")[0];
    if (dateString === todayStr) {
      currentDay = cycleDay + 1;

      if (cycleDay < duration) {
        phase = "Menstrual Phase";
      } else if (cycleDay < ovulationDay - 1) {
        phase = "Follicular Phase";
      } else if (cycleDay <= ovulationDay + 1) {
        phase = "Ovulation Phase";
      } else {
        phase = "Luteal Phase";
      }
    }
  }

  // Next period date (after N full cycles)
  const cyclesPassed = Math.floor(
    (today.getTime() - start.getTime()) / (cycleLength * msPerDay)
  );
  const nextPeriod = new Date(
    start.getTime() + (cyclesPassed + 1) * cycleLength * msPerDay
  );
  const ovulationDate = new Date(
    start.getTime() + (cyclesPassed * cycleLength + ovulationDay) * msPerDay
  );

  return {
    currentDay,
    phase,
    nextPeriod,
    ovulationDate,
    phases: {
      Menstrual: menstrualDays,
      Follicular: follicularDays,
      Ovulatory: ovulatoryDays,
      Luteal: lutealDays,
    },
    fertileWindow,
  };
}

// // app/utils/cycleUtils.ts
// interface CyclePhaseInfo {
//   currentDay: number;
//   phase: string;
//   nextPeriod: Date;
//   //   fertileWindow: {
//   //     start: Date;
//   //     end: Date;
//   //   };
//   ovulationDate: Date;
// }

// export function getCyclePhaseInfo({
//   lastPeriodDate,
//   cycleLength,
//   duration,
//   today = new Date(),
// }: {
//   lastPeriodDate: string | Date;
//   cycleLength: number;
//   duration: number;
//   today?: Date;
// }): CyclePhaseInfo {
//   const msPerDay = 1000 * 60 * 60 * 24;

//   // 1. Validate inputs
//   const start = new Date(lastPeriodDate);
//   if (isNaN(start.getTime())) throw new Error("Invalid lastPeriodDate");
//   if (start > today) throw new Error("lastPeriodDate cannot be in the future");
//   if (cycleLength < 20 || cycleLength > 120)
//     throw new Error("cycleLength out of bounds (20-120 days)");
//   if (duration < 1 || duration > cycleLength)
//     throw new Error("Invalid duration (must be 1-cycleLength days)");

//   // 2. Calculate days
//   const daysSinceLast = Math.floor(
//     (today.getTime() - start.getTime()) / msPerDay
//   );
//   const currentDay = daysSinceLast % cycleLength;
//   const ovulationDay = cycleLength - 14;

//   // 3. Determine phase
//   let phase: string;
//   if (currentDay < duration) {
//     phase = "Menstrual Phase";
//   } else if (currentDay < ovulationDay) {
//     phase = "Follicular Phase";
//   } else if (currentDay === ovulationDay) {
//     phase = "Ovulation Phase";
//   } else {
//     phase = "Luteal Phase";
//   }

//   // 4. Predict next cycle and fertile window
//   const nextPeriod = new Date(start.getTime() + cycleLength * msPerDay);
//   //   const fertileStart = new Date(
//   //     start.getTime() + (ovulationDay - 5) * msPerDay
//   //   );
//   //   const fertileEnd = new Date(start.getTime() + (ovulationDay + 1) * msPerDay);

//   return {
//     currentDay: currentDay + 1, // Adding 1 to make it 1-based
//     phase,
//     nextPeriod,
//     // fertileWindow: {
//     //   start: fertileStart,
//     //   end: fertileEnd,
//     // },
//     ovulationDate: new Date(start.getTime() + ovulationDay * msPerDay),
//   };
// }
