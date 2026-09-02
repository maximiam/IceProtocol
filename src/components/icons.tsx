import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

const mk = (nodes: React.ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ size = 18, className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {nodes}
      </svg>
    );
  };

export const IcHome = mk(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </>,
);

export const IcJudge = mk(
  <>
    <path d="M8 3h8v3H8z" />
    <path d="M6 5h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    <path d="m9 13 2 2 4-4.5" />
  </>,
);

export const IcUsers = mk(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
    <path d="M15.5 5.4a3.2 3.2 0 1 1 .4 6.3" />
    <path d="M16.8 14.9c2 .5 3.3 2.1 3.7 4.6" />
  </>,
);

export const IcCalendar = mk(
  <>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4M16 3v4" />
  </>,
);

export const IcUser = mk(
  <>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20.5c.8-4 3.6-6 7-6s6.2 2 7 6" />
  </>,
);

export const IcPlus = mk(<path d="M12 5v14M5 12h14" />);
export const IcMinus = mk(<path d="M5 12h14" />);
export const IcX = mk(<path d="M6 6l12 12M18 6L6 18" />);
export const IcCheck = mk(<path d="m5 12.5 4.5 4.5L19 7" />);
export const IcChevR = mk(<path d="m9 5 7 7-7 7" />);

export const IcSearch = mk(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </>,
);

export const IcTrash = mk(
  <>
    <path d="M4.5 6.5h15" />
    <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
    <path d="M6.5 6.5 7.4 20a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-13.5" />
    <path d="M10 10.5v6.5M14 10.5v6.5" />
  </>,
);

export const IcCopy = mk(
  <>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const IcShare = mk(
  <>
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="17.5" cy="5.5" r="2.6" />
    <circle cx="17.5" cy="18.5" r="2.6" />
    <path d="m8.4 10.7 6.8-4M8.4 13.3l6.8 4" />
  </>,
);

export const IcSun = mk(
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" />
  </>,
);

export const IcMoon = mk(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />);

export const IcMedal = mk(
  <>
    <circle cx="12" cy="14.5" r="5.5" />
    <path d="m8.7 10 -3.2-6h4.1L12 8.2 14.4 4h4.1l-3.2 6" />
    <path d="m12 12.4.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z" />
  </>,
);

export const IcClock = mk(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);

export const IcBook = mk(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z" />
    <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    <path d="M9 8h7M9 11.5h5" />
  </>,
);

export const IcSave = mk(
  <>
    <path d="M5 3.5h11L20.5 8v11a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z" />
    <path d="M7.5 3.5V9h8V3.5" />
    <circle cx="12" cy="15" r="2.6" />
  </>,
);

export const IcScale = mk(
  <>
    <path d="M12 3.5v17" />
    <path d="M7 20.5h10" />
    <path d="M4 7h16" />
    <path d="m6.5 7-2.7 5.6a2.9 2.9 0 0 0 5.4 0zM17.5 7l-2.7 5.6a2.9 2.9 0 0 0 5.4 0z" />
  </>,
);

export const IcSnow = mk(
  <>
    <path d="M12 2.5v19M4 7l16 10M20 7 4 17" />
    <path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2" />
  </>,
);

/* brand mark: a skater's blade trace */
export const IcBlade = mk(
  <>
    <path d="M3.5 16.5C9 15 12.5 11 13.5 4.5" />
    <path d="M3.5 16.5c4.5 3.5 12.5 3.5 17-.5" />
    <path d="M7 9.5c2.4.6 4.8.3 7-1" />
  </>,
);
