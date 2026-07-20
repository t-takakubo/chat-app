export function MatchedIntro({ peerName }: { peerName: string | null }) {
  return (
    <div className="flex animate-rise-in flex-col items-center gap-1 px-6 py-8 text-center">
      <p className="font-heading text-base font-semibold tracking-[-0.01em]">
        {peerName ? `${peerName}さんとマッチしました` : "マッチしました"}
      </p>
      <p className="text-sm text-muted-foreground">さっそく話しかけてみましょう</p>
    </div>
  );
}
