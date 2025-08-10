-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Create enum for academic levels
CREATE TYPE public.academic_level AS ENUM ('ND I', 'ND II', 'HND I', 'HND II');

-- Create enum for semester types
CREATE TYPE public.semester_type AS ENUM ('First Semester', 'Second Semester');

-- Create enum for grades
CREATE TYPE public.grade_enum AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  level academic_level,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create grading_scale table
CREATE TABLE public.grading_scale (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade grade_enum NOT NULL UNIQUE,
  points DECIMAL(3,1) NOT NULL,
  min_score INTEGER,
  max_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credit_units INTEGER NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  level academic_level,
  semester semester_type,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academic_sessions table
CREATE TABLE public.academic_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL UNIQUE, -- e.g., "2023/2024"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create semesters table
CREATE TABLE public.semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id),
  semester semester_type NOT NULL,
  level academic_level NOT NULL,
  gpa DECIMAL(3,2),
  total_credit_units INTEGER DEFAULT 0,
  total_quality_points DECIMAL(8,2) DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, session_id, semester)
);

-- Create student_courses table for individual course grades
CREATE TABLE public.student_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  grade grade_enum NOT NULL,
  quality_points DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(semester_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_scale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.raw_user_meta_data ->> 'student_id'
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS Policies

-- Departments policies (readable by all authenticated users)
CREATE POLICY "Departments are viewable by authenticated users" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage departments" 
ON public.departments FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Grading scale policies
CREATE POLICY "Grading scale is viewable by authenticated users" 
ON public.grading_scale FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage grading scale" 
ON public.grading_scale FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Courses policies
CREATE POLICY "Courses are viewable by authenticated users" 
ON public.courses FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage courses" 
ON public.courses FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Academic sessions policies
CREATE POLICY "Academic sessions are viewable by authenticated users" 
ON public.academic_sessions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage academic sessions" 
ON public.academic_sessions FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Semesters policies
CREATE POLICY "Students can view their own semesters" 
ON public.semesters FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own semesters" 
ON public.semesters FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own semesters" 
ON public.semesters FOR UPDATE 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all semesters" 
ON public.semesters FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all semesters" 
ON public.semesters FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Student courses policies
CREATE POLICY "Students can view their own course grades" 
ON public.student_courses FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.semesters s 
    WHERE s.id = semester_id AND s.student_id = auth.uid()
  )
);

CREATE POLICY "Students can create their own course grades" 
ON public.student_courses FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.semesters s 
    WHERE s.id = semester_id AND s.student_id = auth.uid()
  )
);

CREATE POLICY "Students can update their own course grades" 
ON public.student_courses FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.semesters s 
    WHERE s.id = semester_id AND s.student_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all student courses" 
ON public.student_courses FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all student courses" 
ON public.student_courses FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grading_scale_updated_at
  BEFORE UPDATE ON public.grading_scale
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academic_sessions_updated_at
  BEFORE UPDATE ON public.academic_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at
  BEFORE UPDATE ON public.semesters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_courses_updated_at
  BEFORE UPDATE ON public.student_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data

-- Insert departments
INSERT INTO public.departments (name, code) VALUES 
('Computer Science', 'CS'),
('Electrical Engineering', 'EE'),
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CE'),
('Business Administration', 'BA'),
('Accounting', 'ACC');

-- Insert default grading scale
INSERT INTO public.grading_scale (grade, points, min_score, max_score) VALUES 
('A', 5.0, 70, 100),
('B', 4.0, 60, 69),
('C', 3.0, 50, 59),
('D', 2.0, 45, 49),
('E', 1.0, 40, 44),
('F', 0.0, 0, 39);

-- Insert current academic session
INSERT INTO public.academic_sessions (session_name, start_date, end_date, is_current) VALUES 
('2024/2025', '2024-09-01', '2025-07-31', true);

-- Insert sample courses for Computer Science ND I
INSERT INTO public.courses (code, title, credit_units, department_id, level, semester) VALUES 
('MTH101', 'General Mathematics I', 3, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester'),
('PHY101', 'General Physics I', 3, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester'),
('CHM101', 'General Chemistry I', 2, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester'),
('CSC101', 'Introduction to Computer Science', 3, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester'),
('CSC102', 'Computer Programming I', 4, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester'),
('ENG101', 'Use of English I', 2, (SELECT id FROM public.departments WHERE code = 'CS'), 'ND I', 'First Semester');

-- Create admin user role function for manual admin creation
CREATE OR REPLACE FUNCTION public.create_admin_user(_user_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  UPDATE public.profiles 
  SET student_id = NULL 
  WHERE user_id = _user_id;
$$;