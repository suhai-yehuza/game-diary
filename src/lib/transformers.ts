import type { RawTeamStatistics } from '@/lib/types/shared.types';
import type { GameTeamStatistics } from '@/lib/types/team.types';

export const transformTeamStats = (stats: RawTeamStatistics): GameTeamStatistics => {
  return {
    team: {
      id: 0,
      name: '',
      nickname: '',
      logo: '',
    },
    statistics: [
      {
        fastBreakPoints: stats.fastBreakPoints,
        pointsInPaint: stats.pointsInPaint,
        biggestLead: stats.biggestLead,
        secondChancePoints: stats.secondChancePoints,
        pointsOffTurnovers: stats.pointsOffTurnovers,
        longestRun: stats.longestRun,
        fgm: 0,
        fga: 0,
        fgp: '0',
        ftm: 0,
        fta: 0,
        ftp: '0',
        tpm: 0,
        tpa: 0,
        tpp: '0',
        offReb: 0,
        defReb: 0,
        totReb: 0,
        assists: 0,
        pFouls: 0,
        steals: 0,
        turnovers: 0,
        blocks: 0,
        plusMinus: 0,
        min: 0,
        points: 0,
      },
    ],
  };
};
