import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  society_name: string | null;
  message: string;
  created_at: string;
}

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  society_name: string;
  total_units: number | null;
  city: string | null;
  message: string | null;
  created_at: string;
}

export default function AdminPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch contact submissions
      const { data: contacts, error: contactsError } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
      } else {
        setContactSubmissions(contacts || []);
      }

      // Fetch demo requests
      const { data: demos, error: demosError } = await supabase
        .from("demo_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (demosError) {
        console.error("Error fetching demos:", demosError);
      } else {
        setDemoRequests(demos || []);
      }
    } catch (error) {
      console.error("Admin check error:", error);
      toast({
        title: "Error",
        description: "Failed to load admin panel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel. Only site owners can view this page.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage leads & submissions
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <ShieldAlert className="w-3 h-3" />
              Owner Access
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-6 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {contactSubmissions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact Messages
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {demoRequests.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Demo Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="demos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="demos">Demo Requests</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="demos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Demo Requests ({demoRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {demoRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No demo requests yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Society</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {demoRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(request.created_at), "dd MMM yyyy")}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.name}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  {request.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  {request.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{request.society_name}</TableCell>
                            <TableCell>
                              {request.total_units ? (
                                <Badge variant="outline">
                                  {request.total_units} units
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>{request.city || "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {request.message || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Messages ({contactSubmissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No contact messages yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Society</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(submission.created_at), "dd MMM yyyy")}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {submission.name}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  {submission.email}
                                </div>
                                {submission.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    {submission.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{submission.society_name || "-"}</TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="truncate">{submission.message}</p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
