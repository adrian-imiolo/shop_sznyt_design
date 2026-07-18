import { formatPln, type QuarterRevenue } from "@sznyt/shared";
import Skeleton from "../../components/Skeleton";
import { useResource } from "../../hooks/useResource";
import { bannerPresentation, type BannerTone } from "./bannerPresentation";

const TONE_STYLES: Record<BannerTone, { container: string; bar: string }> = {
  safe: {
    container: "border-green-600 bg-green-50 text-green-900",
    bar: "bg-green-600",
  },
  warn: {
    container: "border-amber-500 bg-amber-50 text-amber-900",
    bar: "bg-amber-500",
  },
  danger: {
    container: "border-red-600 bg-red-50 text-red-900",
    bar: "bg-red-600",
  },
};

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

  const { tone, message, percent } = bannerPresentation(data);
  const styles = TONE_STYLES[tone];

  return (
    <div className={`w-full border-l-4 border p-4 font-dm-sans ${styles.container}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">
          Przychód Q{data.quarter} {data.year}
        </p>
        <p className="text-sm tabular-nums">
          <span className="font-semibold">{formatPln(data.totalPln)}</span>
          {" / "}
          {formatPln(data.capPln)} ({percent.toFixed(1)}%)
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${percent}%` }} />
      </div>
      {message && <p className="mt-2 text-sm font-medium">{message}</p>}
    </div>
  );
}

export default RevenueBanner;
