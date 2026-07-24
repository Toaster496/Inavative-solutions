import React from "react";

interface IconProps {
  /** Material Symbols Outlined icon name (e.g. "memory", "dns", "bolt") */
  name: string;
  size?: number;
  /** Tailwind/css color class — defaults to currentColor */
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

/**
 * Thin wrapper around Material Symbols Outlined icons.
 * Loads the icon font via index.html <link>.
 */
export const Icon: React.FC<IconProps> = ({ name, size = 20, className = "", style, fill = false }) => {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

export default Icon;
