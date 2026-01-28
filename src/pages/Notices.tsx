import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Search,
  Calendar,
  Megaphone,
  AlertTriangle,
  Info,
  Pin,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotices, useCreateNotice, useToggleNoticePin } from "@/hooks/useSupabaseData";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return Calendar;
    case "maintenance":
      return AlertTriangle;
    case "event":
      return Megaphone;
    default:
      return Info;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "meeting":
      return "bg-accent/10 text-accent";
    case "maintenance":
      return "bg-warning/10 text-warning";
    case "event":
      return "bg-success/10 text-success";
    default:
      return "bg-primary/10 text-primary";
  }
};

export default function Notices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "normal",
  });

  const { data: notices, isLoading: noticesLoading } = useNotices();
  const createNoticeMutation = useCreateNotice();
  const togglePinMutation = useToggleNoticePin();

  const filteredNotices = notices?.filter(notice =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    await createNoticeMutation.mutateAsync(newNotice);
    setIsDialogOpen(false);
    setNewNotice({
      title: "",
      content: "",
      category: "general",
      priority: "normal",
    });
  };

  const handleTogglePin = (noticeId: string, isPinned: boolean) => {
    togglePinMutation.mutate({ noticeId, isPinned });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Notice Board</h1>
          <p className="text-muted-foreground">
            Announcements and updates for all residents
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Post Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post New Notice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="Notice title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Notice content..."
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newNotice.category}
                    onValueChange={(value) => setNewNotice({ ...newNotice, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newNotice.priority}
                    onValueChange={(value) => setNewNotice({ ...newNotice, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createNoticeMutation.isPending}>
                {createNoticeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Post Notice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search notices..." 
            className="pl-12 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            All
          </Button>
          <Button variant="ghost" size="lg">
            Meetings
          </Button>
          <Button variant="ghost" size="lg">
            Events
          </Button>
        </div>
      </motion.div>

      {/* Notices Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {noticesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredNotices && filteredNotices.length > 0 ? (
          filteredNotices.map((notice, index) => {
            const TypeIcon = getTypeIcon(notice.category);
            const isUrgent = notice.priority === 'urgent';
            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`card-interactive ${
                    isUrgent ? "border-l-4 border-l-destructive" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(notice.category)}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{notice.title}</h3>
                            {notice.is_pinned && (
                              <Pin className="w-4 h-4 text-accent" />
                            )}
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleTogglePin(notice.id, notice.is_pinned)}>
                                {notice.is_pinned ? 'Unpin' : 'Pin'} Notice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(notice.publish_date).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{notice.category}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No notices found
          </div>
        )}
      </motion.div>
    </div>
  );
}
