import type { QuarterRevenue } from "@sznyt/shared";
import Skeleton from "../../components/Skeleton";
import { useResource } from "../../hooks/useResource";

const THRESHOLD_STYLES: Record<
  QuarterRevenue["threshold"],
  { container: string; bar: string; message: string | null }
> = {
  safe: {
    container: "border-green-600 bg-green-50 text-green-900",
    bar: "bg-green-600",
    message: null,
  },
  warn70: {
    container: "border-amber-500 bg-amber-50 text-amber-900",
    bar: "bg-amber-500",
    message: "Ponad 70% limitu — czas zaplanować rejestrację działalności.",
  },
  warn90: {
    container: "border-red-600 bg-red-50 text-red-900",
    bar: "bg-red-600",
    message: "Ponad 90% limitu — rozpocznij rejestrację działalności.",
  },
  over: {
    container: "border-red-600 bg-red-50 text-red-900",
    bar: "bg-red-600",
    message: "Limit przekroczony — obowiązek rejestracji działalności w ciągu 7 dni!",
  },
};

function formatPln(value: number) {
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Running quarterly revenue vs the działalność-nierejestrowana cap. */
function RevenueBanner() {
  const { data, error } = useResource<QuarterRevenue>("/revenue/quarter", { auth: true });

  if (error) {
    return (
      <div className="w-full border border-borders p-4 font-dm-sans text-sm text-secondary-text">
        Nie udało się załadować przychodu kwartalnego.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full border border-borders p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-2 h-2 w-full" />
      </div>
    );
  }

  const styles = THRESHOLD_STYLES[data.threshold];
  const percent = (data.totalPln / data.capPln) * 100;

  return (
    <div className={`w-full border-l-4 border p-4 font-dm-sans ${styles.container}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">
          Przychód Q{data.quarter} {data.year}
        </p>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{formatPln(data.totalPln)} zł</span>
          {" / "}
          {formatPln(data.capPln)} zł ({percent.toFixed(1)}%)
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {styles.message && <p className="mt-2 text-sm font-medium">{styles.message}</p>}
    </div>
  );
}

export default RevenueBanner;
