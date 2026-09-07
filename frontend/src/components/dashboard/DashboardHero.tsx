import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeDistance } from '@/utils/dates';

interface DashboardHeroProps {
  name: string;
  streak: { current: number; longest: number; lastActive?: string };
  weeklyProgress: number;
}

/**
 * The page header used to be a landing-page hero: a 56px headline, a decorative
 * dot grid, and two floating mock cards containing skeleton bars and a bar
 * chart with hardcoded heights. That chart sat inches from the user's real
 * numbers and never meant anything -- the clearest "template" tell on the page.
 *
 * What a returning user actually wants at the top is their own state: is the
 * streak alive, and are they on pace this week. Colour appears here only when
 * momentum is live, so an amber flame is information rather than decoration.
 */
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHero({ name, streak, weeklyProgress }: DashboardHeroProps) {
  const alive = streak.current > 0;
  const onPace = weeklyProgress >= 100;

  return (
    <header>
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting()}, {name}
      </h1>

      <dl className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className="sr-only">Current streak</dt>
          <dd className={cn('flex items-baseline gap-1.5', alive ? 'text-amber-500' : 'text-muted-foreground')}>
            <Flame className="h-3.5 w-3.5 self-center" aria-hidden />
            {alive ? (
              <>
                <span className="font-mono tabular-nums">{streak.current}</span>
                <span className="text-muted-foreground">
                  day streak{streak.longest > streak.current && ` · best ${streak.longest}`}
                </span>
              </>
            ) : (
              <span>No active streak</span>
            )}
          </dd>
        </div>

        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">This week</dt>
          <dd className={cn('font-mono tabular-nums', onPace && 'text-emerald-500')}>{weeklyProgress}%</dd>
        </div>

        {streak.lastActive && (
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Last active</dt>
            <dd className="font-mono tabular-nums text-muted-foreground">
              {formatTimeDistance(streak.lastActive)}
            </dd>
          </div>
        )}
      </dl>
    </header>
  );
}
