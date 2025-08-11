import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, Building2, Calendar } from "lucide-react";

interface Profile {
  first_name: string;
  last_name: string;
  student_id: string;
  level: string;
  phone?: string;
  department?: {
    name: string;
    code: string;
  };
}

interface StudentProfileProps {
  profile: Profile;
}

export const StudentProfile = ({ profile }: StudentProfileProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Full Name
            </div>
            <p className="font-medium">{profile.first_name} {profile.last_name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              Student ID
            </div>
            <p className="font-medium">{profile.student_id}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Department
            </div>
            <p className="font-medium">{profile.department?.name || 'N/A'}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Current Level
            </div>
            <Badge variant="secondary">{profile.level}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};