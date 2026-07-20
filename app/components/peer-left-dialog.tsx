import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function PeerLeftDialog({
  open,
  peerName,
  onAcknowledge,
}: {
  open: boolean;
  peerName: string | null;
  onAcknowledge: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onAcknowledge()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>会話が終了しました</DialogTitle>
          <DialogDescription>
            {peerName ?? "相手"}が退出したため、この会話は終了しました。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onAcknowledge}>ホームに戻る</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
