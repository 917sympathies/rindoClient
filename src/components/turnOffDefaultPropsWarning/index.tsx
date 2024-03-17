"use client";

export const TurnOffDefaultPropsWarning = () => {
  // Override console.error
  // This is a hack to suppress the warning about missing defaultProps in the recharts library
  // @link https://github.com/recharts/recharts/issues/3615
  const error = console.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (/defaultProps/.test(args[0])) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    error(...args);
  };

  return <div className="absolute h-0 w-0"></div>;
};