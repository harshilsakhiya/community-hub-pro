import { useState } from "react";
import { format } from "date-fns";
import { 
  Loader2, 
  Clock, 
  Send, 
  MessageSquare,
  ImageIcon,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useComplaintDetails, 
  useComplaintComments, 
  useAddComplaintComment,
  useUpdateComplaintStatus,
} from "@/hooks/useSupabaseData";
import { RoleGuard, useHasRole } from "@/components/auth/RoleGuard";

interface ComplaintDetailDialogProps {
  complaintId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-success/10 text-success border-success/20">Resolved</Badge>;
    case "closed":
      return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
    default:
      return null;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>;
    case "high":
      return <Badge className="bg-warning text-warning-foreground">High</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

export function ComplaintDetailDialog({ 
  complaintId, 
  open, 
  onOpenChange 
}: ComplaintDetailDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: complaint, isLoading: complaintLoading } = useComplaintDetails(complaintId);
  const { data: comments, isLoading: commentsLoading } = useComplaintComments(complaintId);
  const addCommentMutation = useAddComplaintComment();
  const updateStatusMutation = useUpdateComplaintStatus();

  const isAdmin = useHasRole(["admin", "committee_member"]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !complaintId) return;

    await addCommentMutation.mutateAsync({
      complaintId,
      comment: newComment,
      isInternal,
    });

    setNewComment("");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!complaintId) return;
    await updateStatusMutation.mutateAsync({
      complaintId,
      status: newStatus,
    });
  };

  if (!complaintId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Complaint Details
          </DialogTitle>
        </DialogHeader>

        {complaintLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : complaint ? (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-4">
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground font-mono">
                    {complaint.ticket_number}
                  </span>
                  {getStatusBadge(complaint.status)}
                  {getPriorityBadge(complaint.priority)}
                  <Badge variant="outline" className="capitalize">
                    {complaint.category}
                  </Badge>
                </div>

                <h2 className="text-xl font-semibold">{complaint.title}</h2>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Unit {complaint.units?.block}-{complaint.units?.unit_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(complaint.created_at), "PPp")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Attached Images ({complaint.images.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {complaint.images.map((image: { id: string; image_url: string; file_name: string }) => (
                      <a
                        key={image.id}
                        href={image.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={image.image_url}
                          alt={image.file_name}
                          className="w-full h-24 object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update (Admin Only) */}
              <RoleGuard allowedRoles={["admin", "committee_member"]}>
                <div>
                  <h3 className="font-medium mb-2">Update Status</h3>
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </RoleGuard>

              {/* Resolution Notes */}
              {complaint.resolution_notes && (
                <div className="bg-success/10 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-success">Resolution Notes</h3>
                  <p className="text-sm">{complaint.resolution_notes}</p>
                  {complaint.resolved_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved on {format(new Date(complaint.resolved_at), "PPp")}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Comments Section */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({comments?.length || 0})
                </h3>

                {commentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg ${
                          comment.is_internal 
                            ? "bg-warning/10 border border-warning/20" 
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name || "User"}
                            {comment.is_internal && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Internal
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(comment.created_at), "PP p")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    No comments yet
                  </p>
                )}

                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <div className="flex items-center justify-between">
                    <RoleGuard allowedRoles={["admin", "committee_member"]}>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        Internal note (not visible to resident)
                      </label>
                    </RoleGuard>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      size="sm"
                    >
                      {addCommentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Complaint not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
