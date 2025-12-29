type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn btn-primary"
      : variant === "secondary"
      ? "btn btn-secondary"
      : variant === "ghost"
      ? "btn btn-ghost"
      : "btn btn-danger";

  const sizeClass =
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "btn-md";

  return (
    <button
      {...props}
      className={[variantClass, sizeClass, className].filter(Boolean).join(" ")}
    />
  );
}
