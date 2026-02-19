import Image from "next/image";
import Link from "next/link";
import { COMMAND, PERFECT_SCORE } from "@/constants";
import { createMetadata } from "@/seo/metadata";
import getScoreColorClass from "@/utils/get-score-color-class";
import DoctorFace from "@/components/doctor-face";
import ScoreBar from "@/components/score-bar";
import { LEADERBOARD_ENTRIES, type ResolvedLeaderboardEntry } from "./leaderboard-entries";

const SCORE_BAR_WIDTH = 20;
const CONTRIBUTE_URL =
  "https://github.com/Aniket-508/vercel-doctor/edit/main/packages/website/src/app/leaderboard/leaderboard-entries.ts";

const LeaderboardRow = ({ entry, rank }: { entry: ResolvedLeaderboardEntry; rank: number }) => {
  const colorClass = getScoreColorClass(entry.score);

  return (
    <div className="group grid items-center border-b border-white/5 py-2 transition-colors hover:bg-white/2 sm:py-2.5 grid-cols-[2rem_1fr_auto] sm:grid-cols-[2.5rem_7rem_1fr_auto]">
      <span className="text-right text-neutral-600">{rank}</span>

      <a
        href={entry.githubUrl}
        target="_blank"
        rel="noreferrer"
        className="ml-2 truncate text-white transition-colors hover:text-blue-400 sm:ml-4"
      >
        {entry.name}
      </a>

      <span className="hidden sm:inline">
        <ScoreBar
          score={entry.score}
          barWidth={SCORE_BAR_WIDTH}
          emptyColorClass="text-neutral-700"
        />
      </span>

      <Link href={entry.shareUrl} className="ml-4 text-right transition-colors hover:underline">
        <span className={`${colorClass} font-medium`}>{entry.score}</span>
        <span className="text-neutral-600">/{PERFECT_SCORE}</span>
      </Link>
    </div>
  );
};

export const metadata = createMetadata({
  title: "Leaderboard",
  description: "Vercel cost optimization scores for popular open-source projects.",
  canonical: "/leaderboard",
});

const LeaderboardPage = () => {
  const topScore = LEADERBOARD_ENTRIES[0]?.score ?? 0;

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-[#0a0a0a] p-6 pb-32 font-mono text-base leading-relaxed text-neutral-300 sm:p-8 sm:pb-40 sm:text-lg">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <Image src="/favicon.svg" alt="Vercel Doctor" width={20} height={20} />
          <span>vercel-doctor</span>
        </Link>
      </div>

      <div className="mb-2">
        <DoctorFace score={topScore} />
      </div>

      <div className="mb-1 text-xl text-white">Leaderboard</div>
      <div className="mb-8 text-neutral-500">Scores for popular open-source React projects.</div>

      <div className="mb-8">
        {LEADERBOARD_ENTRIES.map((entry, index) => (
          <LeaderboardRow key={entry.name} entry={entry} rank={index + 1} />
        ))}
      </div>

      <div className="min-h-[1.4em]" />

      <div className="text-neutral-500">Run it on your codebase:</div>
      <div className="mt-2">
        <span className="border border-white/20 px-3 py-1.5 text-white">{COMMAND}</span>
      </div>

      <div className="min-h-[1.4em]" />
      <div className="min-h-[1.4em]" />

      <div className="text-neutral-500">
        {"+ "}
        <a
          href={CONTRIBUTE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-green-400 transition-colors hover:text-green-300 hover:underline"
        >
          Add your project
        </a>
        <span className="text-neutral-600">{" — open a PR to leaderboard-entries.ts"}</span>
      </div>
    </div>
  );
};

export default LeaderboardPage;
