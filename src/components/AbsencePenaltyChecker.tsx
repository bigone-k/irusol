"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useToastStore } from "@/store/useToastStore";

/**
 * 앱 진입 시 마지막 접속일을 확인하고 미접속 패널티를 적용합니다.
 * - 24시간 경과: -1 HP (2^0)
 * - 48시간 경과: -2 HP (2^1)
 * - 72시간 경과: -4 HP (2^2)
 * - 96시간 경과: -8 HP (2^3)
 * - 이후 24시간마다 HP 손실이 2배씩 증가
 */
export default function AbsencePenaltyChecker() {
  const checkAbsencePenalty = usePlayerStore((state) => state.checkAbsencePenalty);
  const { warning } = useToastStore();

  useEffect(() => {
    const result = checkAbsencePenalty();
    if (result && result.hpLost > 0) {
      const { hpLost, daysSinceVisit } = result;
      warning(
        `${daysSinceVisit}일 동안 접속하지 않아 기운이 -${hpLost} 감소했습니다!`,
        5000
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
