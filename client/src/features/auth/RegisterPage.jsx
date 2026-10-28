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
        setCurrentStep(2); // Jump directly to step 2 to complete age/phone and details
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
      if (!university.trim() || !degree.trim()) {
        setError('Please provide university and degree program.');
        return false;
      }
    } else if (role === 'company') {
      if (!companyName.trim()) {
        setError('Please provide company name.');
        return false;
      }
    } else if (role === 'reviewer') {
      if (!institution.trim() || !designation.trim()) {
        setError('Please provide academic institution and designation.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!validateStep2()) return;
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Final Registration
  const handleFinalSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const studentDetails =
        role === 'student'
          ? {
              university: university.trim(),
              degree: degree.trim(),
              fieldOfStudy: fieldOfStudy.trim(),
              academicYear,
              skills: skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : undefined;

      const companyDetails =
        role === 'company'
          ? {
              name: companyName.trim() || name.trim(),
              industry: industry.trim(),
              location: { address: address.trim(), city: city.trim(), country: 'Sri Lanka' },
              website: website.trim(),
              description: description.trim(),
              contactEmail: email.trim(),
              contactPhone: phone.trim(),
            }
          : undefined;

      const reviewerDetails =
        role === 'reviewer'
          ? {
              university: institution.trim(),
              department: department.trim(),
              designation: designation.trim(),
              academicEmail: email.trim(),
            }
          : undefined;

      let loggedInUser;

      if (authMode === 'google' && googleProfile) {
        // Complete Google OAuth Registration
        loggedInUser = await loginWithSupabase({
          email: googleProfile.email,
          name: name.trim() || googleProfile.name,
          avatarUrl: googleProfile.avatarUrl,
          supabaseId: googleProfile.supabaseId,
          role,
          age: age ? parseInt(age, 10) : null,
          phone: phone.trim(),
          studentDetails,
          companyDetails,
          reviewerDetails,
        });
        sessionStorage.removeItem('pending_google_reg');
      } else {
        // Manual Email & Password Registration
        loggedInUser = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          age: age ? parseInt(age, 10) : null,
          phone: phone.trim(),
          studentDetails,
          companyDetails,
          reviewerDetails,
        });
      }

      // Navigate to role dashboard
      if (loggedInUser.role === 'student') navigate('/student/portfolio');
      else if (loggedInUser.role === 'company') navigate('/company/internships');
      else if (loggedInUser.role === 'reviewer' || loggedInUser.role === 'admin')
        navigate('/verifications');
      else navigate('/search');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3 shadow-2xs">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Create Your InternBridge Account
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          One unified platform bridging students, companies, and academic reviewers.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, label: 'Role' },
            { step: 2, label: 'Identity' },
            { step: 3, label: 'Profile' },
            { step: 4, label: 'Confirm' },
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                  currentStep >= item.step
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                    : 'bg-white border-2 border-gray-300 text-gray-500'
                }`}
              >
                {currentStep > item.step ? <CheckCircle2 className="w-5 h-5" /> : item.step}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  currentStep >= item.step ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-md rounded-[10px] p-6 md:p-8">
        {error && (
          <Alert type="danger" className="mb-6">
            {error}
          </Alert>
        )}

        {/* STEP 1: Select Role & Signup Method */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Select Your Account Role</h2>
              <p className="text-xs text-gray-500">
                Choose the role that best describes your profile on InternBridge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'student',
                  title: 'Student Intern',
                  desc: 'Build portfolio, explore verified internships, and chat with employers.',
                  icon: GraduationCap,
                },
                {
                  id: 'company',
                  title: 'Company / Employer',
                  desc: 'Publish internship vacancies and recruit matched undergraduate talent.',
                  icon: Building2,
                },
                {
                  id: 'reviewer',
                  title: 'Academic Reviewer',
                  desc: 'Verify university student credentials, endorse projects & ratings.',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`p-4 rounded-[10px] border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-gray-900 text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Choose How to Create Your Account:
              </label>

              <div className="space-y-3">
                {/* Google 1-Click Signup */}
                <div className="p-3.5 bg-gray-50 rounded-[10px] border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Recommended (1-Click)
                    </span>
                    <span className="text-xs text-gray-500">Auto-imports Name & Email</span>
                  </div>
                  <SupabaseSignInButton
                    role={role}
                    intent="register"
                    buttonText="Sign up with Google"
                    onError={(msg) => setError(msg)}
                  />
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-medium">Or continue manually</span>
                  </div>
                </div>

                {/* Manual Email/Password Option */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center py-2.5 rounded-[10px] font-medium"
                  onClick={() => {
                    setAuthMode('manual');
                    setGoogleProfile(null);
                    setCurrentStep(2);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Sign up with Email & Password
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Basic Identity & Credentials */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">Personal & Account Details</h2>
                <Badge variant="indigo" className="text-xs uppercase">
                  {role}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {authMode === 'google'
                  ? 'Your profile details were retrieved from Google. Add your age and phone number.'
                  : 'Enter your basic contact information and create a secure password.'}
              </p>
            </div>

            {/* Google Profile Connected Banner */}
            {authMode === 'google' && googleProfile && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[10px] flex items-center gap-3">
                {googleProfile.avatarUrl ? (
                  <img
                    src={googleProfile.avatarUrl}
                    alt={googleProfile.name}
                    className="w-10 h-10 rounded-full border border-emerald-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                    {googleProfile.name?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected with Google
                  </div>
                  <div className="text-sm font-medium text-emerald-950 truncate">
                    {googleProfile.name} ({googleProfile.email})
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Password inputs if manual */}
            {authMode === 'manual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
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
              </div>
            )}

            {/* Age & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                label="Phone Number (Optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +94 77 123 4567"
              />
            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-[10px]">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button type="button" variant="primary" onClick={handleNext} className="rounded-[10px]">
                Continue to Profile <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Role-Specific Details Form */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {role === 'student' && 'Academic & Education Details'}
                {role === 'company' && 'Company Organization Details'}
                {role === 'reviewer' && 'Academic Reviewer Profile'}
              </h2>
              <p className="text-xs text-gray-500">
                {role === 'student' && 'Tell recruiters about your university program and technical competencies.'}
                {role === 'company' && 'Provide company background to attract top student applicants.'}
                {role === 'reviewer' && 'Provide verification details to issue academic endorsements.'}
              </p>
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <div className="space-y-4">
                <Input
                  label="University / Higher Education Institute *"
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. South Eastern University of Sri Lanka"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Degree Program *"
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. BSc in Information and Communication Technology"
                  />

                  <Input
                    label="Field of Study *"
                    type="text"
                    required
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Software Engineering"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <Input
                    label="Key Skills (comma separated)"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, Python, Figma"
                  />
                </div>
              </div>
            )}

            {/* Company Specific Fields */}
            {role === 'company' && (
              <div className="space-y-4">
                <Input
                  label="Company / Enterprise Name *"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Virtusa, WSO2, or Sysco LABS"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Industry Sector *"
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Software Engineering / FinTech"
                  />

                  <Input
                    label="Headquarters City *"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Colombo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Physical Address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 752 Dr Danister De Silva Mawatha, Colombo"
                  />

                  <Input
                    label="Website URL"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.lk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Bio / Overview
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your company culture, technology stack, and internship programs..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Reviewer Specific Fields */}
            {role === 'reviewer' && (
              <div className="space-y-4">
                <Input
                  label="Academic Institution / University *"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. South Eastern University of Sri Lanka"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g. Senior Lecturer / Head of Dept"
                  />
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-[10px]">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button type="button" variant="primary" onClick={handleNext} className="rounded-[10px]">
                Review & Confirm <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Summary & Create Account */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Information</h2>
              <p className="text-xs text-gray-500">
                Please verify your registration details before creating your account.
              </p>
            </div>

            <div className="bg-gray-50 rounded-[10px] p-5 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <div className="text-base font-bold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">{email}</div>
                </div>
                <Badge variant="indigo" className="uppercase font-bold tracking-wide">
                  {role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Authentication Mode:</span>
                  <span className="font-semibold text-gray-800">
                    {authMode === 'google' ? 'Google OAuth (Verified)' : 'Email & Password'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Contact Phone:</span>
                  <span className="font-semibold text-gray-800">{phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Age:</span>
                  <span className="font-semibold text-gray-800">{age ? `${age} years` : 'Not provided'}</span>
                </div>

                {role === 'student' && (
                  <>
                    <div>
                      <span className="text-gray-400 block mb-0.5">University:</span>
                      <span className="font-semibold text-gray-800">{university}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Degree:</span>
                      <span className="font-semibold text-gray-800">{degree}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Academic Year:</span>
                      <span className="font-semibold text-gray-800">{academicYear}</span>
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Company:</span>
                      <span className="font-semibold text-gray-800">{companyName || name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Industry:</span>
                      <span className="font-semibold text-gray-800">{industry}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Location:</span>
                      <span className="font-semibold text-gray-800">{city}, Sri Lanka</span>
                    </div>
                  </>
                )}

                {role === 'reviewer' && (
                  <>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Institution:</span>
                      <span className="font-semibold text-gray-800">{institution}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Department:</span>
                      <span className="font-semibold text-gray-800">{department}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-[10px]">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalSubmit}
                isLoading={isLoading}
                className="rounded-[10px] px-6"
              >
                Create Account <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Login Link */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign In to InternBridge
          </Link>
        </div>
      </Card>
    </div>
  );
};
