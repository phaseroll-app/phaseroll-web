"use client";

import { useEffect } from "react";

type OpenRollCallProps = {
  encodedId: string;
  downloadUrl: string;
};

const OPEN_ATTEMPT_KEY = "phaseRollOpenAttempted";

export function OpenRollCall({ encodedId, downloadUrl }: OpenRollCallProps) {
  const deepLink = `phaseroll://roll-call/${encodedId}`;

  useEffect(() => {
    const state =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};

    if (state[OPEN_ATTEMPT_KEY] === encodedId) {
      return;
    }

    window.history.replaceState(
      { ...state, [OPEN_ATTEMPT_KEY]: encodedId },
      "",
      window.location.href,
    );
    window.location.assign(deepLink);
  }, [deepLink, encodedId]);

  return (
    <div className="roll-call-page__actions">
      <a className="roll-call-page__button" href={deepLink}>
        Open PhaseRoll
      </a>
      <a className="roll-call-page__button roll-call-page__button--secondary" href={downloadUrl}>
        Download PhaseRoll
      </a>
    </div>
  );
}
