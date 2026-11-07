import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { SupabaseSignInButton } from '../../components/ui/SupabaseSignInButton';
import {
  Briefcase,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Sparkles,
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, loginWithSupabase } = useAuth();

  // Wizard Step: 1 = Role & Method, 2 = Basic Identity, 3 = Role Details, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Authentication mode: 'manual' | 'google'
  const [authMode, setAuthMode] = useState('manual');
  const [googleProfile, setGoogleProfile] = useState(null);

  // Step 1: Role
  const [role, setRole] = useState('student');

  // Step 2: Basic Identity & Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Role-specific details
  // Student:
  const [university, setUniversity] = useState('South Eastern University of Sri Lanka');
  const [degree, setDegree] = useState('BSc in Information and Communication Technology');
  const [fieldOfStudy, setFieldOfStudy] = useState('Software Engineering & Web Technologies');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [skills, setSkills] = useState('React, Node.js, JavaScript, Tailwind CSS');

  // Company:
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Software Engineering');
  const [city, setCity] = useState('Colombo');
  const [address, setAddress] = useState('Colombo, Sri Lanka');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Reviewer:
  const [institution, setInstitution] = useState('South Eastern University of Sri Lanka');
  const [department, setDepartment] = useState('Department of Information and Communication Technology');
  const [designation, setDesignation] = useState('Senior Lecturer / Academic Reviewer');

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if returning from Google OAuth Callback
  useEffect(() => {
    try {
      const pendingReg = sessionStorage.getItem('pending_google_reg');
      if (pendingReg) {
        const parsed = JSON.parse(pendingReg);
        setGoogleProfile(parsed);
        setAuthMode('google');
        setName(parsed.name || '');
        setEmail(parsed.email || '');
        if (parsed.role) setRole(parsed.role);
        setCurrentStep(2);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Validation
  const validateStep2 = () => {
    if (!name.trim()) {
      setError('Please provide your full name.');
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (authMode === 'manual') {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    if (age && (parseInt(age, 10) < 16 || parseInt(age, 10) > 100)) {
      setError('Please enter a realistic age (16 - 100).');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (role === 'student') {
      if (!university.trim()) {
        setError('Please enter your university name.');
        return false;
      }
      if (!degree.trim()) {
        setError('Please enter your degree program.');
        return false;
      }
    } else if (role === 'company') {
      if (!companyName.trim()) {
        setError('Please enter your company name.');
        return false;
      }
      if (!industry.trim()) {
        setError('Please select or specify your industry.');
        return false;
      }
      if (!city.trim()) {
        setError('Please specify the primary city/location.');
        return false;
      }
    } else if (role === 'reviewer') {
      if (!institution.trim()) {
        setError('Please enter your academic institution.');
        return false;
      }
      if (!department.trim()) {
        setError('Please enter your faculty or department.');
        return false;
      }
      if (!designation.trim()) {
        setError('Please enter your academic designation.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinalSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const skillsArray = skills
        ? skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        authProvider: authMode === 'google' ? 'supabase' : 'local',
        supabaseId: googleProfile?.supabaseId || googleProfile?.id || undefined,
        avatarUrl: googleProfile?.avatarUrl || undefined,
        age: age ? parseInt(age, 10) : undefined,
        phone: phone.trim() || undefined,
      };

      if (authMode === 'manual') {
        payload.password = password;
      }

      if (role === 'student') {
        const studentInfo = {
          university: university.trim(),
          degree: degree.trim(),
          fieldOfStudy: fieldOfStudy.trim(),
          academicYear,
          skills: skillsArray,
        };
        payload.studentData = studentInfo;
        payload.studentDetails = studentInfo;
      } else if (role === 'company') {
        const companyInfo = {
          name: companyName.trim(),
          industry: industry.trim(),
          city: city.trim(),
          address: address.trim(),
          website: website.trim(),
          description: description.trim(),
        };
        payload.companyData = companyInfo;
        payload.companyDetails = companyInfo;
      } else if (role === 'reviewer') {
        const reviewerInfo = {
          institution: institution.trim(),
          department: department.trim(),
          designation: designation.trim(),
        };
        payload.reviewerData = reviewerInfo;
        payload.reviewerDetails = reviewerInfo;
      }

      const registeredUser = authMode === 'google'
        ? await loginWithSupabase({
            ...payload,
            supabaseId: googleProfile?.supabaseId || googleProfile?.id,
            avatarUrl: googleProfile?.avatarUrl,
          })
        : await register(payload);
      sessionStorage.removeItem('pending_google_reg');

      if (registeredUser.role === 'student') {
        navigate('/student/portfolio');
      } else if (registeredUser.role === 'company') {
        navigate('/company/internships');
      } else if (registeredUser.role === 'reviewer' || registeredUser.role === 'admin') {
        navigate('/verifications');
      } else {
        navigate('/search');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Card className="shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl border border-[#C8B48A]/40 bg-white p-6 sm:p-8">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30 rounded-2xl mb-3 shadow-xs">
            <Briefcase className="w-7 h-7" />
          </div>
          <p className="font-serif italic text-sm text-[#7F8C6A] mb-0.5">
            Join the Undergraduate Bridge
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#1E3B2F]">
            Create an Account
          </h1>
          <p className="text-xs text-[#1E3B2F]/70 mt-1">
            Join InternBridge as a verified student, company, or reviewer
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#C8B48A]/40 z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#1E3B2F] transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / 3) * 85}%` }}
            />

            {[
              { step: 1, label: 'Role' },
              { step: 2, label: 'Identity' },
              { step: 3, label: 'Profile' },
              { step: 4, label: 'Confirm' },
            ].map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    currentStep === item.step
                      ? 'bg-[#1E3B2F] text-[#F5F0E6] ring-4 ring-[#7F8C6A]/20'
                      : currentStep > item.step
                      ? 'bg-[#7F8C6A] text-white'
                      : 'bg-white border-2 border-[#C8B48A]/50 text-[#1E3B2F]/50'
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${
                    currentStep >= item.step ? 'text-[#1E3B2F]' : 'text-[#1E3B2F]/40'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert type="danger" className="mb-5 rounded-xl">
            {error}
          </Alert>
        )}

        {/* STEP 1: Select Role & Signup Method */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1E3B2F]/70 mb-2">
                Register As:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#F5F0E6] rounded-xl border border-[#C8B48A]/40">
                {[
                  { id: 'student', label: 'Student', icon: GraduationCap },
                  { id: 'company', label: 'Company', icon: Building2 },
                  { id: 'reviewer', label: 'Reviewer', icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                          : 'text-[#1E3B2F]/80 hover:text-[#1E3B2F]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Role Description Pill */}
              <div className="mt-3 p-3 bg-[#F5F0E6]/60 rounded-xl border border-[#C8B48A]/35 text-xs text-[#1E3B2F]/80 text-center leading-relaxed font-medium">
                {role === 'student' &&
                  'Build your verified portfolio, explore internships, and chat with employers.'}
                {role === 'company' &&
                  'Publish internship vacancies and recruit matched undergraduate talent.'}
                {role === 'reviewer' &&
                  'Verify university student credentials, endorse projects & ratings.'}
              </div>
            </div>

            {/* Supabase Google 1-Click Signup */}
            <div className="pt-1">
              <SupabaseSignInButton
                role={role}
                intent="register"
                buttonText={`Sign up with Google (${role.charAt(0).toUpperCase() + role.slice(1)})`}
                onError={(msg) => setError(msg)}
              />
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C8B48A]/35" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[10px] uppercase tracking-widest font-semibold text-[#1E3B2F]/60">
                  Or continue manually
                </span>
              </div>
            </div>

            {/* Manual Email/Password Option */}
            <button
              type="button"
              className="w-full justify-center py-3.5 px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center"
              onClick={() => {
                setAuthMode('manual');
                setGoogleProfile(null);
                setCurrentStep(2);
              }}
            >
              Sign up with Email & Password
            </button>
          </div>
        )}

        {/* STEP 2: Basic Identity & Credentials */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8B48A]/25">
              <h2 className="text-sm font-bold text-[#1E3B2F]">Personal & Contact Info</h2>
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30">
                {role}
              </span>
            </div>

            {/* Google Profile Connected Banner */}
            {authMode === 'google' && googleProfile && (
              <div className="p-3 bg-[#7F8C6A]/15 border border-[#7F8C6A]/30 rounded-xl flex items-center gap-2.5">
                {googleProfile.avatarUrl ? (
                  <img
                    src={googleProfile.avatarUrl}
                    alt={googleProfile.name}
                    className="w-8 h-8 rounded-full border border-[#7F8C6A]/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center font-bold text-xs">
                    {googleProfile.name?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-[#1E3B2F] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1E3B2F]" /> Google Connected
                  </div>
                  <div className="text-xs font-medium text-[#1E3B2F]/80 truncate">
                    {googleProfile.name} ({googleProfile.email})
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Full Name *"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kasun Weerasinghe"
              disabled={authMode === 'google' && Boolean(googleProfile?.name)}
            />

            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              disabled={authMode === 'google'}
            />

            {/* Password inputs if manual */}
            {authMode === 'manual' && (
              <>
                <div className="relative">
                  <Input
                    label="Password (min 6 chars) *"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-[#7F8C6A] hover:text-[#1E3B2F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm Password *"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </>
            )}

            {/* Age & Phone Number */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age (Optional)"
                type="number"
                min="16"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 23"
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
              />
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#C8B48A]/25">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 justify-center py-3 px-3 border border-[#C8B48A]/50 hover:bg-[#F5F0E6] text-[#1E3B2F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 justify-center py-3 px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center"
              >
                Continue to Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Role-Specific Details Form */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8B48A]/25">
              <h2 className="text-sm font-bold text-[#1E3B2F]">
                {role === 'student' && 'Academic Details'}
                {role === 'company' && 'Company Details'}
                {role === 'reviewer' && 'Reviewer Credentials'}
              </h2>
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30">
                {role}
              </span>
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <div className="space-y-3.5">
                <Input
                  label="University / Higher Education Institute *"
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. South Eastern University of Sri Lanka"
                />

                <Input
                  label="Degree Program *"
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. BSc in ICT"
                />

                <Input
                  label="Field of Study *"
                  type="text"
                  required
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Software Engineering"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E3B2F] mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#C8B48A]/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] bg-white font-medium text-[#1E3B2F]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <Input
                    label="Key Skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node.js, Python"
                  />
                </div>
              </div>
            )}

            {/* Company Specific Fields */}
            {role === 'company' && (
              <div className="space-y-3.5">
                <Input
                  label="Company / Enterprise Name *"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Virtusa, WSO2, or Sysco LABS"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Industry Sector *"
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Software Engineering"
                  />

                  <Input
                    label="City *"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Colombo"
                  />
                </div>

                <Input
                  label="Physical Address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="752 Dr Danister De Silva Mawatha"
                />

                <Input
                  label="Website URL"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.lk"
                />

                <div>
                  <label className="block text-xs font-semibold text-[#1E3B2F] mb-1">
                    Company Overview
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe company culture and internship vacancies..."
                    className="w-full px-3 py-2.5 border border-[#C8B48A]/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] text-[#1E3B2F] font-medium"
                  />
                </div>
              </div>
            )}

            {/* Reviewer Specific Fields */}
            {role === 'reviewer' && (
              <div className="space-y-3.5">
                <Input
                  label="Academic Institution / University *"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. South Eastern University of Sri Lanka"
                />

                <Input
                  label="Faculty / Department *"
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Department of ICT, Faculty of Technology"
                />

                <Input
                  label="Academic Designation *"
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Lecturer"
                />
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#C8B48A]/25">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 justify-center py-3 px-3 border border-[#C8B48A]/50 hover:bg-[#F5F0E6] text-[#1E3B2F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 justify-center py-3 px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center"
              >
                Review Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Summary & Create Account */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8B48A]/25">
              <h2 className="text-sm font-bold text-[#1E3B2F]">Review Your Information</h2>
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30">
                {role}
              </span>
            </div>

            <div className="bg-[#F5F0E6]/50 rounded-xl p-4 border border-[#C8B48A]/35 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#C8B48A]/30">
                <div>
                  <div className="text-sm font-bold text-[#1E3B2F]">{name}</div>
                  <div className="text-[11px] text-[#1E3B2F]/70">{email}</div>
                </div>
                <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-white text-[#1E3B2F] border border-[#C8B48A]/40">
                  {authMode === 'google' ? 'Google Auth' : 'Email/Pass'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Contact Phone:</span>
                  <span className="font-semibold text-[#1E3B2F]">{phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Age:</span>
                  <span className="font-semibold text-[#1E3B2F]">
                    {age ? `${age} yrs` : 'Not provided'}
                  </span>
                </div>

                {role === 'student' && (
                  <>
                    <div className="col-span-2">
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">University:</span>
                      <span className="font-semibold text-[#1E3B2F]">{university}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Degree:</span>
                      <span className="font-semibold text-[#1E3B2F]">{degree}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Year:</span>
                      <span className="font-semibold text-[#1E3B2F]">{academicYear}</span>
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div className="col-span-2">
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Company:</span>
                      <span className="font-semibold text-[#1E3B2F]">{companyName || name}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Industry:</span>
                      <span className="font-semibold text-[#1E3B2F]">{industry}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">City:</span>
                      <span className="font-semibold text-[#1E3B2F]">{city}</span>
                    </div>
                  </>
                )}

                {role === 'reviewer' && (
                  <>
                    <div className="col-span-2">
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Institution:</span>
                      <span className="font-semibold text-[#1E3B2F]">{institution}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Department:</span>
                      <span className="font-semibold text-[#1E3B2F]">{department}</span>
                    </div>
                    <div>
                      <span className="text-[#7F8C6A] block text-[10px] uppercase tracking-wider font-semibold">Designation:</span>
                      <span className="font-semibold text-[#1E3B2F]">{designation}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#C8B48A]/25">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 justify-center py-3 px-3 border border-[#C8B48A]/50 hover:bg-[#F5F0E6] text-[#1E3B2F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="w-2/3 justify-center py-3 px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'} <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Login Link */}
        <div className="mt-6 text-center text-xs text-[#1E3B2F]/70">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#1E3B2F] hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
