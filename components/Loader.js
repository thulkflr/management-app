export default function Loader({ size = 20, className = "" }) {
    return (
        <div
            className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
