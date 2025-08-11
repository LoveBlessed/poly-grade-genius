import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, BookOpen } from "lucide-react";

interface Semester {
  id: string;
  semester: string;
  level: string;
  gpa: number;
  total_credit_units: number;
  is_completed: boolean;
  academic_session?: {
    session_name: string;
  };
}

interface SemesterHistoryProps {
  semesters: Semester[];
}

export const SemesterHistory = ({ semesters }: SemesterHistoryProps) => {
  const getGPABadge = (gpa: number) => {
    if (gpa >= 4.5) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
    if (gpa >= 3.5) return <Badge variant="secondary" className="bg-blue-600">Very Good</Badge>;
    if (gpa >= 2.5) return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Good</Badge>;
    if (gpa >= 2.0) return <Badge variant="outline" className="border-orange-600 text-orange-600">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Semester History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {semesters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No semester records found. Start by adding your first semester results.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Credit Units</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>{semester.academic_session?.session_name || 'N/A'}</TableCell>
                    <TableCell>{semester.semester}</TableCell>
                    <TableCell>{semester.level}</TableCell>
                    <TableCell>{semester.total_credit_units}</TableCell>
                    <TableCell className="font-medium">{semester.gpa?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{getGPABadge(semester.gpa || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={semester.is_completed ? "default" : "secondary"}>
                        {semester.is_completed ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};