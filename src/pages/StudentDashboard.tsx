import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Plus, 
  Download,
  User,
  LogOut,
  Calendar,
  GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  // Mock data for demonstration
  const studentInfo = {
    name: "John Doe",
    studentId: "FP/2024/001",
    department: "Computer Science",
    level: "ND II",
    currentSemester: "First Semester",
    session: "2024/2025"
  };

  const cgpaData = {
    currentGPA: 4.2,
    overallCGPA: 3.8,
    totalCreditUnits: 45,
    completedSemesters: 3
  };

  const semesterHistory = [
    { 
      session: "2023/2024", 
      semester: "Second Semester", 
      gpa: 4.2, 
      creditUnits: 15, 
      status: "Excellent",
      courses: 6
    },
    { 
      session: "2023/2024", 
      semester: "First Semester", 
      gpa: 3.9, 
      creditUnits: 15, 
      status: "Good",
      courses: 6
    },
    { 
      session: "2022/2023", 
      semester: "Second Semester", 
      gpa: 3.3, 
      creditUnits: 15, 
      status: "Good",
      courses: 6
    }
  ];

  const getGPAStatus = (gpa: number) => {
    if (gpa >= 4.0) return { label: "Excellent", variant: "default" as const, className: "gpa-excellent" };
    if (gpa >= 3.5) return { label: "Good", variant: "secondary" as const, className: "gpa-good" };
    if (gpa >= 2.5) return { label: "Satisfactory", variant: "outline" as const, className: "gpa-warning" };
    return { label: "Needs Improvement", variant: "destructive" as const, className: "gpa-warning" };
  };

  const cgpaStatus = getGPAStatus(cgpaData.overallCGPA);
  const gpaStatus = getGPAStatus(cgpaData.currentGPA);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-academic py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
              <p className="text-white/80 text-sm">Foundation Polytechnic CGPA System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-white">
              <p className="font-semibold">{studentInfo.name}</p>
              <p className="text-sm text-white/80">{studentInfo.studentId}</p>
            </div>
            <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Student Info Card */}
          <Card className="card-academic flex-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Welcome back, {studentInfo.name.split(' ')[0]}!</CardTitle>
                  <CardDescription>Here's your academic overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student ID</p>
                  <p className="font-medium">{studentInfo.studentId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{studentInfo.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{studentInfo.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Session</p>
                  <p className="font-medium">{studentInfo.session}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-academic lg:w-80">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="hero" className="w-full justify-start">
                <Link to="/add-semester">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Semester Results
                </Link>
              </Button>
              <Button asChild variant="academic" className="w-full justify-start">
                <Link to="/transcript">
                  <Download className="h-4 w-4 mr-2" />
                  Download Transcript
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/calculator">
                  <Calculator className="h-4 w-4 mr-2" />
                  GPA Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CGPA Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`card-academic ${cgpaStatus.className} border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall CGPA</CardTitle>
                <Award className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{cgpaData.overallCGPA.toFixed(2)}</div>
              <Badge variant={cgpaStatus.variant} className="text-xs">
                {cgpaStatus.label}
              </Badge>
              <Progress value={(cgpaData.overallCGPA / 5) * 100} className="mt-3" />
            </CardContent>
          </Card>

          <Card className={`card-academic ${gpaStatus.className} border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">{cgpaData.currentGPA.toFixed(2)}</div>
              <Badge variant={gpaStatus.variant} className="text-xs">
                {gpaStatus.label}
              </Badge>
              <Progress value={(cgpaData.currentGPA / 5) * 100} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="card-academic">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit Units</CardTitle>
                <BookOpen className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{cgpaData.totalCreditUnits}</div>
              <p className="text-xs text-muted-foreground">Across {cgpaData.completedSemesters} semesters</p>
            </CardContent>
          </Card>

          <Card className="card-academic">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Academic Progress</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{cgpaData.completedSemesters}</div>
              <p className="text-xs text-muted-foreground">Semesters completed</p>
              <Progress value={(cgpaData.completedSemesters / 4) * 100} className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Semester History */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="text-xl">Academic History</CardTitle>
            <CardDescription>Your semester-by-semester performance record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semesterHistory.map((semester, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{semester.session}</h3>
                      <Badge variant="outline" className="text-xs">{semester.semester}</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{semester.courses} courses</span>
                      <span>{semester.creditUnits} credit units</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{semester.gpa.toFixed(1)}</div>
                      <Badge variant={getGPAStatus(semester.gpa).variant} className="text-xs">
                        {semester.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;