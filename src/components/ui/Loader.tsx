export const Loader = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex justify-center p-4">
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}
      ></div>
    </div>
  );
};
