import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Save,
  ArrowLeft,
  BookOpen,
  GraduationCap
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  creditUnit: number;
  grade: string;
}

interface GradingScale {
  grade: string;
  points: number;
}

const AddSemester = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [academicSessions, setAcademicSessions] = useState<any[]>([]);
  const [gradingScale, setGradingScale] = useState<GradingScale[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [semester, setSemester] = useState({
    session: "",
    semesterType: "",
  });

  const [courses, setCourses] = useState<Course[]>([
    { id: "1", code: "", title: "", creditUnit: 0, grade: "" }
  ]);

  const [gpaCalculation, setGpaCalculation] = useState({
    totalCreditUnits: 0,
    totalQualityPoints: 0,
    gpa: 0
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [sessionsResult, gradingResult, profileResult] = await Promise.all([
        supabase.from('academic_sessions').select('*').order('start_date', { ascending: false }),
        supabase.from('grading_scale').select('*').order('points', { ascending: false }),
        supabase.from('profiles').select('*, departments(*)').eq('user_id', user.id).single()
      ]);

      setAcademicSessions(sessionsResult.data || []);
      setGradingScale(gradingResult.data || []);
      setUserProfile(profileResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load required data.",
        variant: "destructive",
      });
    }
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      code: "",
      title: "",
      creditUnit: 0,
      grade: ""
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const calculateGPA = () => {
    let totalCreditUnits = 0;
    let totalQualityPoints = 0;

    courses.forEach(course => {
      if (course.grade && course.creditUnit > 0) {
        const gradeData = gradingScale.find(g => g.grade === course.grade);
        const points = gradeData?.points || 0;
        totalCreditUnits += course.creditUnit;
        totalQualityPoints += points * course.creditUnit;
      }
    });

    const gpa = totalCreditUnits > 0 ? totalQualityPoints / totalCreditUnits : 0;

    setGpaCalculation({
      totalCreditUnits,
      totalQualityPoints,
      gpa
    });
  };

  const handleSave = async () => {
    if (!user || !semester.session || !semester.semesterType) {
      toast({
        title: "Error",
        description: "Please fill in session and semester details.",
        variant: "destructive",
      });
      return;
    }

    const validCourses = courses.filter(course => 
      course.code && course.title && course.creditUnit > 0 && course.grade
    );

    if (validCourses.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid course.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate semester totals
      const totalCreditUnits = validCourses.reduce((sum, course) => sum + course.creditUnit, 0);
      const totalQualityPoints = validCourses.reduce((sum, course) => {
        const gradeData = gradingScale.find(g => g.grade === course.grade);
        const points = gradeData?.points || 0;
        return sum + (points * course.creditUnit);
      }, 0);
      const gpa = totalCreditUnits > 0 ? totalQualityPoints / totalCreditUnits : 0;

      // Create semester record
      const { data: semesterData, error: semesterError } = await supabase
        .from('semesters')
        .insert({
          student_id: user.id,
          session_id: semester.session,
          semester: semester.semesterType as "First Semester" | "Second Semester",
          level: (userProfile?.level || 'ND I') as "ND I" | "ND II" | "HND I" | "HND II",
          gpa,
          total_credit_units: totalCreditUnits,
          total_quality_points: totalQualityPoints,
          is_completed: true
        })
        .select()
        .single();

      if (semesterError) throw semesterError;

      // For now, we'll skip creating course records since we need course_id
      // This will be implemented when we add the admin course management
      
      toast({
        title: "Success",
        description: "Semester results saved successfully!",
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Error saving semester:', error);
      toast({
        title: "Error",
        description: "Failed to save semester results.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGPAStatus = (gpa: number) => {
    if (gpa >= 4.0) return { label: "Excellent", className: "bg-success text-success-foreground" };
    if (gpa >= 3.5) return { label: "Good", className: "bg-accent text-accent-foreground" };
    if (gpa >= 2.5) return { label: "Satisfactory", className: "bg-warning text-warning-foreground" };
    return { label: "Needs Improvement", className: "bg-destructive text-destructive-foreground" };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-academic py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Add Semester Results</h1>
              <p className="text-white/80 text-sm">Enter your course grades and calculate GPA</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Semester Information */}
        <Card className="card-academic">
          <CardHeader>
            <CardTitle className="text-xl">Semester Information</CardTitle>
            <CardDescription>Enter the academic session and semester details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="session">Academic Session</Label>
                <Select onValueChange={(value) => setSemester({...semester, session: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic session" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.session_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semesterType">Semester</Label>
                <Select onValueChange={(value) => setSemester({...semester, semesterType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Semester">First Semester</SelectItem>
                    <SelectItem value="Second Semester">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="card-academic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Course Details</CardTitle>
                <CardDescription>Add all courses for this semester</CardDescription>
              </div>
              <Button onClick={addCourse} variant="academic" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course, index) => (
                <div key={course.id} className="grid grid-cols-12 gap-4 p-4 rounded-lg border border-border/50 bg-muted/20">
                  <div className="col-span-12 sm:col-span-2">
                    <Label htmlFor={`code-${course.id}`} className="text-xs text-muted-foreground">Course Code</Label>
                    <Input
                      id={`code-${course.id}`}
                      placeholder="e.g., CSC 101"
                      value={course.code}
                      onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-12 sm:col-span-4">
                    <Label htmlFor={`title-${course.id}`} className="text-xs text-muted-foreground">Course Title</Label>
                    <Input
                      id={`title-${course.id}`}
                      placeholder="e.g., Introduction to Programming"
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-2">
                    <Label htmlFor={`credit-${course.id}`} className="text-xs text-muted-foreground">Credit Unit</Label>
                    <Input
                      id={`credit-${course.id}`}
                      type="number"
                      placeholder="3"
                      min="1"
                      max="6"
                      value={course.creditUnit || ""}
                      onChange={(e) => updateCourse(course.id, "creditUnit", parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="col-span-4 sm:col-span-2">
                    <Label htmlFor={`grade-${course.id}`} className="text-xs text-muted-foreground">Grade</Label>
                    <Select onValueChange={(value) => updateCourse(course.id, "grade", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                        <SelectContent>
                        {gradingScale.map((grade) => (
                          <SelectItem key={grade.grade} value={grade.grade}>
                            {grade.grade} ({grade.points.toFixed(1)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    {courses.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCourse(course.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="col-span-12 sm:col-span-1 flex items-end">
                    <div className="text-xs text-muted-foreground text-center w-full">
                      {course.grade && course.creditUnit > 0 && (
                        <div className="font-medium">
                          QP: {(gradingScale.find(g => g.grade === course.grade)?.points || 0) * course.creditUnit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* GPA Calculation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="text-lg">GPA Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={calculateGPA} variant="academic" className="w-full mb-4">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate GPA
              </Button>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Credit Units:</span>
                  <span className="font-semibold">{gpaCalculation.totalCreditUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Quality Points:</span>
                  <span className="font-semibold">{gpaCalculation.totalQualityPoints}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Semester GPA:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {gpaCalculation.gpa.toFixed(2)}
                      </div>
                      {gpaCalculation.gpa > 0 && (
                        <Badge className={getGPAStatus(gpaCalculation.gpa).className}>
                          {getGPAStatus(gpaCalculation.gpa).label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-academic">
            <CardHeader>
              <CardTitle className="text-lg">Grading Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gradingScale.map((grade) => (
                  <div key={grade.grade} className="flex justify-between items-center py-1">
                    <span className="font-medium">{grade.grade}</span>
                    <span className="text-muted-foreground">{grade.points.toFixed(1)} points</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button onClick={handleSave} variant="hero" size="lg" className="px-12" disabled={loading}>
            <Save className="h-5 w-5 mr-2" />
            {loading ? "Saving..." : "Save Semester Results"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddSemester;