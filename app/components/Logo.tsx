type LogoProps = {
  className?: string;
  priority?: boolean;
};

/** Mark plus wordmark. The tagline lockup is reserved for store assets. */
export function Logo({ className, priority = false }: LogoProps) {
  return (
    <span className={className ? `logo ${className}` : "logo"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand mark */}
      <img
        className="logo__mark"
        src="/logo.png"
        alt=""
        width={1254}
        height={1254}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
      />
      <span>
        Phase<span className="em">Roll</span>
      </span>
    </span>
  );
}
