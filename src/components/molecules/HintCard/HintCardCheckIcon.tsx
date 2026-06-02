type HintCardCheckIconProps = {
  className?: string;
};

export function HintCardCheckIcon({ className }: HintCardCheckIconProps) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M11.458 24.902L12.869 23.537C13.164 23.252 13.558 23.094 13.976 23.094C14.394 23.094 14.786 23.252 15.083 23.537L19.3 27.616L32.919 14.443C33.529 13.852 34.52 13.852 35.131 14.443L36.542 15.809C36.837 16.095 37 16.476 37 16.88C37 17.285 36.837 17.665 36.542 17.951L20.405 33.557C19.795 34.148 18.804 34.148 18.193 33.557L11.458 27.042C10.848 26.451 10.848 25.492 11.458 24.902Z"
        fill="currentColor"
      />
    </svg>
  );
}
