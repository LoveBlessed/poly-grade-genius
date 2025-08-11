import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, BookOpen } from "lucide-react";

interface CGPASummaryProps {
  currentGPA: number;
  overallCGPA: number;
  totalCreditUnits: number;
  completedSemesters: number;
}

export const CGPASummary = ({ 
  currentGPA, 
  overallCGPA, 
  totalCreditUnits, 
  completedSemesters 
}: CGPASummaryProps) => {
  const getGradeStatus = (cgpa: number) => {
    if (cgpa >= 4.5) return { label: "Excellent", variant: "default" as const, color: "text-green-600" };
    if (cgpa >= 3.5) return { label: "Very Good", variant: "secondary" as const, color: "text-blue-600" };
    if (cgpa >= 2.5) return { label: "Good", variant: "outline" as const, color: "text-yellow-600" };
    if (cgpa >= 2.0) return { label: "Fair", variant: "outline" as const, color: "text-orange-600" };
    return { label: "Needs Improvement", variant: "destructive" as const, color: "text-red-600" };
  };

  const status = getGradeStatus(overallCGPA);
  const progressPercentage = Math.min((overallCGPA / 5.0) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Semester GPA</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Out of 5.00
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall CGPA</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overallCGPA.toFixed(2)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Academic Progress</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCreditUnits}</div>
          <p className="text-xs text-muted-foreground">
            Total Credit Units
          </p>
          <p className="text-sm mt-1">
            {completedSemesters} Semester{completedSemesters !== 1 ? 's' : ''} Completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};