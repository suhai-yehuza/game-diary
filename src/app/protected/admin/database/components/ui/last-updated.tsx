export function LastUpdated() {
  return (
    <div className="text-xs text-muted-foreground">
      Last updated: {new Date().toLocaleTimeString()}
    </div>
  );
}
