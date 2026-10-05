import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  BookOpenText,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Compass,
  Download,
  FileText,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Video,
} from 'lucide-react';
import { initialAppState, learningSteps, roleNavigation } from './data/mockData';
import { APP_KEY, AUTH_KEY, readStorage, writeStorage } from './utils/storage';

const chartBlue = '#2563EB';
const chartTeal = '#14B8A6';
const chartGold = '#F4B942';
const chartNavy = '#0B2A5B';

function App() {
  const [appData, setAppData] = useState(() => readStorage(APP_KEY, initialAppState));
  const [auth, setAuth] = useState(() => readStorage(AUTH_KEY, null));

  useEffect(() => {
    writeStorage(APP_KEY, appData);
  }, [appData]);

  useEffect(() => {
    writeStorage(AUTH_KEY, auth);
  }, [auth]);

  const login = (email, password, role) => {
    const matchingUser = appData.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
    );

    if (!matchingUser) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (role && matchingUser.role !== role) {
      return { success: false, message: 'This account is not assigned to that role.' };
    }

    const authData = {
      userId: matchingUser.id,
      name: matchingUser.name,
      role: matchingUser.role,
      email: matchingUser.email,
      employeeId: matchingUser.employeeId,
    };

    setAuth(authData);
    return { success: true, user: authData };
  };

  const logout = () => setAuth(null);

  const updateCourse = (courseId, updater) => {
    setAppData((prev) => ({
      ...prev,
      courses: prev.courses.map((course) =>
        course.id === courseId ? { ...course, ...updater(course) } : course,
      ),
    }));
  };

  const addAnnouncement = (announcement) => {
    setAppData((prev) => ({
      ...prev,
      announcements: [announcement, ...prev.announcements],
    }));
  };

  const approveCourse = (courseId) => {
    updateCourse(courseId, () => ({ status: 'approved', published: true }));
  };

  const approveTrainer = (userId) => {
    setAppData((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === userId ? { ...user, status: 'active' } : user,
      ),
    }));
  };

  const enrollCourse = (courseId) => {
    updateCourse(courseId, (course) => ({
      learners: Number(course.learners) + 1,
      progress: Math.max(course.progress, 12),
    }));
  };

  const completeLesson = (courseId) => {
    updateCourse(courseId, (course) => ({
      progress: Math.min(100, Number(course.progress) + 8),
    }));
  };

  const addCourse = (course) => {
    setAppData((prev) => ({
      ...prev,
      courses: [course, ...prev.courses],
    }));
  };

  const findUser = auth?.userId ? appData.users.find((user) => user.id === auth.userId) : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage courses={appData.courses} announcements={appData.announcements} testimonials={appData.testimonials} />} />
        <Route
          path="/login"
          element={<LoginPage login={login} auth={auth} users={appData.users} />}
        />

        <Route
          path="/trainee/dashboard"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <TraineeDashboard courses={appData.courses} announcements={appData.announcements} />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/courses"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <TraineeCourses courses={appData.courses} onEnroll={enrollCourse} />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/learning"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <LearningExperience courses={appData.courses} onComplete={completeLesson} />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/assessments"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <AssessmentExperience />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/competencies"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <CompetencyPage />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/certificates"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <CertificatesPage />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/profile"
          element={
            <ProtectedRoute auth={auth} role="trainee">
              <TraineeLayout user={findUser} logout={logout}>
                <ProfilePage user={findUser} />
              </TraineeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <TrainerDashboard courses={appData.courses} />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/courses"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <TrainerCoursesPage courses={appData.courses} />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/content"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <ResourceLibrary resources={appData.resources} />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/assessments"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <AssessmentBuilder />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/performance"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <TrainerPerformance />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile"
          element={
            <ProtectedRoute auth={auth} role="trainer">
              <TrainerLayout user={findUser} logout={logout}>
                <ProfilePage user={findUser} />
              </TrainerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <AdminDashboard users={appData.users} courses={appData.courses} announcements={appData.announcements} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <AdminUsers users={appData.users} approveTrainer={approveTrainer} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <AdminCourses courses={appData.courses} approveCourse={approveCourse} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/competencies"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <CompetencyPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <AdminAnalytics />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute auth={auth} role="admin">
              <AdminLayout user={findUser} logout={logout}>
                <AnnouncementsPage addAnnouncement={addAnnouncement} announcements={appData.announcements} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ auth, role, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (role && auth.role !== role) {
    const redirect = auth.role === 'trainee' ? '/trainee/dashboard' : auth.role === 'trainer' ? '/trainer/dashboard' : '/admin/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

function LandingPage({ courses, announcements, testimonials }) {
  const featuredCourses = courses.slice(0, 3);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-lg font-black text-white shadow-lg shadow-brand-600/25">
              C
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700">CAPACITY</div>
              <div className="-mt-1 text-sm font-semibold text-slate-700">CONNECT</div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <a href="#home" className="hover:text-brand-700">Home</a>
            <a href="#how" className="hover:text-brand-700">How It Works</a>
            <a href="#learning" className="hover:text-brand-700">Learning</a>
            <a href="#competencies" className="hover:text-brand-700">Competencies</a>
            <a href="#about" className="hover:text-brand-700">About</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              Login
            </a>
            <a href="#start" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25">
              Start Learning
            </a>
          </div>
        </nav>
      </header>

      <main id="home" className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="grid items-center gap-12 pb-16 pt-7 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              <Sparkles size={14} /> Smart Education
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-7xl">
              Build Skills.
              <span className="block text-brand-700">Measure Competency.</span>
              <span className="block text-slate-900">Strengthen Capacity.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              CAPACITY CONNECT is a digital learning and competency platform designed to help organizations develop people, measure capabilities and build a future-ready workforce.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#learning" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20">
                Explore Learning <ArrowRight size={18} />
              </a>
              <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm">
                View How It Works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-8 text-sm text-slate-600">
              <div>
                <div className="text-2xl font-bold text-slate-900">32K+</div>
                <div>Active learners</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">98%</div>
                <div>Training satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                <div>Platform rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="absolute -right-8 bottom-12 h-28 w-28 rounded-full bg-brand-200/80 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.15)]">
              <div className="rounded-[24px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 p-5">
                <div className="flex items-center justify-between text-white/90">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-cyan-100">Learning readiness</div>
                    <div className="mt-3 text-3xl font-black">78%</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <Gauge className="h-8 w-8 text-cyan-200" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 text-white backdrop-blur-sm">
                    <div className="text-xs uppercase text-cyan-100">Competency score</div>
                    <div className="mt-2 text-2xl font-bold">84</div>
                  </div>
                  <div className="rounded-2xl bg-[#14B8A6]/20 p-3 text-white backdrop-blur-sm">
                    <div className="text-xs uppercase text-cyan-100">Skill gap</div>
                    <div className="mt-2 text-2xl font-bold">18%</div>
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] bg-white p-4 text-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended</div>
                      <div className="mt-2 text-lg font-bold">Advanced Data Analytics</div>
                    </div>
                    <div className="rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">AI Match</div>
                  </div>
                  <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>Forecasting readiness</span>
                    <span className="font-semibold text-brand-700">76%</span>
                  </div>
                </div>
              </div>

              <div className="-mt-6 ml-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Certificate</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">IMD Certified</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Assessment</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">Score 88%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="how" className="py-16">
          <header className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">One Platform. Complete Learning Journey.</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl">A learning flow built for real capability growth.</h2>
          </header>
          <div className="grid gap-5 md:grid-cols-6">
            {learningSteps.map((step, index) => (
              <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-2xl font-black text-brand-700">0{index + 1}</div>
                  {index < learningSteps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-100 to-cyan-100 p-3 text-brand-700">
                  <Target className="h-full w-full" />
                </div>
                <div className="mt-4 text-base font-bold text-slate-800">{step}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="learning" className="py-12">
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Learning Designed Around You</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Personalized development pathways.</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Personalized Courses', 'AI-tailored learning tracks based on job role and skill gaps'],
              ['Skill Gap Analysis', 'Pinpoint gaps with competency benchmarks and recommendations'],
              ['AI Recommendations', 'Next best actions for learning and role readiness'],
              ['Assessments', 'Outcome-based evaluations with instant insights'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Built for Every Role</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">A platform shaped around the people who drive capability.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ['TRAINEE', 'Learn and grow.', 'Stay aligned with role expectations and personalized pathways.'],
              ['TRAINER', 'Teach and empower.', 'Design learning journeys, track progress and improve outcomes.'],
              ['ADMIN', 'Manage and measure.', 'Monitor performance across departments and learning programs.'],
            ].map(([role, name, copy]) => (
              <div key={role} className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-900 to-brand-700 p-6 text-white shadow-xl shadow-brand-900/10">
                <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{role}</div>
                <h3 className="text-2xl font-black">{name}</h3>
                <p className="mt-4 text-sm text-slate-200">{copy}</p>
                <div className="mt-6 flex items-center gap-2 font-semibold text-cyan-200">
                  Explore <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12" id="competencies">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">From Learning to Competency</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Clear capability progression.</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-base font-semibold text-slate-700">
            {['Current Skill', 'Skill Gap', 'Recommended Course', 'Assessment', 'Improved Competency'].map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">{step}</div>
                {index < 4 && <ChevronRight className="text-slate-400" />}
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Featured Learning</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">The most relevant learning journeys.</h2>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} compact />
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Competency Intelligence</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Track skill strength across critical capabilities.</h2>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                {[
                  ['Data Analysis', 80],
                  ['Forecasting', 70],
                  ['GIS', 60],
                  ['Leadership', 75],
                ].map(([skill, value]) => (
                  <div key={skill}>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{skill}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[24px] bg-gradient-to-br from-brand-50 to-cyan-50 p-5">
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-brand-700">AI Strength Map</div>
                <div className="mt-5 text-3xl font-black text-slate-900">Balance index <span className="text-brand-700">82</span></div>
                <div className="mt-3 text-sm text-slate-600">Your current capability profile aligns strongly with role requirements, with data analysis and leadership as primary growth areas.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Announcements & Learning Updates</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Keep learners informed and motivated.</h2>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">{item.category}</div>
                  <div className="text-xs font-medium text-slate-500">{item.date}</div>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Learner Feedback</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">Real stories from learners and teams.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, index) => (
                    <Star key={`${item.name}-${index}`} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 text-base text-slate-700">“{item.text}”</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="start" className="pb-20 pt-12">
          <div className="rounded-[32px] bg-gradient-to-r from-brand-800 to-brand-600 p-8 text-white shadow-[0_25px_70px_rgba(11,42,91,0.25)] md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-100">Ready to build your next capability?</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-5xl">Explore CAPACITY CONNECT</h2>
              </div>
              <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-brand-700 shadow-lg shadow-brand-900/20">
                Start now <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginPage({ login, auth, users }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'trainee@capacityconnect.in', password: 'Demo@123', role: 'trainee' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth) {
      const target = auth.role === 'trainee' ? '/trainee/dashboard' : auth.role === 'trainer' ? '/trainer/dashboard' : '/admin/dashboard';
      navigate(target, { replace: true });
    }
  }, [auth, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form.email, form.password, form.role);
    if (!result.success) {
      setError(result.message);
      return;
    }

    const targetRoute = result.user.role === 'trainee' ? '/trainee/dashboard' : result.user.role === 'trainer' ? '/trainer/dashboard' : '/admin/dashboard';
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.15),_transparent_40%),_linear-gradient(135deg,#F7F9FC,_#FFFFFF)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_35%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-black">C</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">CAPACITY</div>
                <div className="-mt-1 text-lg font-semibold">CONNECT</div>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Your Growth.<br />Your Skills.<br />Your Future.</h1>
            <p className="mt-5 max-w-md text-base text-cyan-100">Build roles, bridge skill gaps, and track performance with a premium digital capacity-building platform designed for public-sector learning.</p>
            <div className="mt-8 space-y-4">
              {[{ label: 'Learning readiness', value: '78%' }, { label: 'Competency progress', value: '84%' }, { label: 'Skills mapped', value: '24' }].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <span className="text-sm text-cyan-100">{stat.label}</span>
                  <span className="text-xl font-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Welcome back</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900">Continue to CAPACITY CONNECT</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email / Employee ID</label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@capacityconnect.in"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                {['trainee', 'trainer', 'admin'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setForm({ ...form, role: option })}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${form.role === option ? 'bg-brand-700 text-white shadow-md shadow-brand-600/20' : 'text-slate-600'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600" />
                Remember me
              </label>
              <button type="button" className="font-semibold text-brand-700">Forgot Password</button>
            </div>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/25">
              Continue to CAPACITY CONNECT
            </button>
          </form>

          <div className="mt-8 rounded-[24px] border border-dashed border-brand-200 bg-brand-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-brand-700">Demo credentials</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold">Trainee:</span> trainee@capacityconnect.in / Demo@123</div>
              <div><span className="font-semibold">Trainer:</span> trainer@capacityconnect.in / Demo@123</div>
              <div><span className="font-semibold">Admin:</span> admin@capacityconnect.in / Demo@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TraineeLayout({ user, logout, children }) {
  const navItems = ['Dashboard', 'My Learning', 'Explore Courses', 'Assessments', 'Competencies', 'Certificates', 'Profile'];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-lg font-black text-white">C</div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-700">CAPACITY</div>
              <div className="-mt-1 text-sm font-bold text-slate-700">CONNECT</div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const route = item === 'Dashboard' ? '/trainee/dashboard' : item === 'My Learning' ? '/trainee/learning' : item === 'Explore Courses' ? '/trainee/courses' : item === 'Assessments' ? '/trainee/assessments' : item === 'Competencies' ? '/trainee/competencies' : item === 'Certificates' ? '/trainee/certificates' : '/trainee/profile';
              return (
                <NavLink key={item} to={route} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {item === 'Dashboard' && <LayoutDashboard size={18} />}
                  {item === 'My Learning' && <BookOpenText size={18} />}
                  {item === 'Explore Courses' && <Compass size={18} />}
                  {item === 'Assessments' && <ClipboardCheck size={18} />}
                  {item === 'Competencies' && <Target size={18} />}
                  {item === 'Certificates' && <Award size={18} />}
                  {item === 'Profile' && <UserRound size={18} />}
                  {item}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[24px] bg-gradient-to-br from-brand-800 to-brand-600 p-4 text-white shadow-lg shadow-brand-500/15">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-100">Learning Score</div>
            <div className="mt-3 text-3xl font-black">78%</div>
            <div className="mt-2 text-sm text-cyan-100">You are 22% away from your next competency milestone.</div>
          </div>
        </aside>

        <main className="flex-1 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Trainee Portal</div>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">Good morning, {user?.name?.split(' ')[0] || 'Rahul'} 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600"><Bell size={18} /></button>
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><LogOut size={16} />Logout</button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

function TrainerLayout({ user, logout, children }) {
  const navItems = ['Dashboard', 'My Courses', 'Create Course', 'Resources', 'Assessments', 'Trainees', 'Performance', 'Profile'];
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-cyan-500 text-lg font-black text-white">C</div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-700">CAPACITY</div>
              <div className="-mt-1 text-base font-bold text-slate-700">CONNECT</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-slate-200 p-2 text-slate-600"><Bell size={18} /></button>
            <button onClick={logout} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Logout</button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const route = item === 'Dashboard' ? '/trainer/dashboard' : item === 'My Courses' ? '/trainer/courses' : item === 'Create Course' ? '/trainer/courses' : item === 'Resources' ? '/trainer/content' : item === 'Assessments' ? '/trainer/assessments' : item === 'Trainees' ? '/trainer/performance' : item === 'Performance' ? '/trainer/performance' : '/trainer/profile';
                return (
                  <NavLink key={item} to={route} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {item === 'Dashboard' && <LayoutDashboard size={18} />}
                    {item === 'My Courses' && <BookOpenText size={18} />}
                    {item === 'Create Course' && <Plus size={18} />}
                    {item === 'Resources' && <FileText size={18} />}
                    {item === 'Assessments' && <ClipboardCheck size={18} />}
                    {item === 'Trainees' && <Users size={18} />}
                    {item === 'Performance' && <TrendingUp size={18} />}
                    {item === 'Profile' && <UserRound size={18} />}
                    {item}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
          <main className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-black tracking-[-0.05em] text-slate-900">Good morning, {user?.name?.split(' ')[0] || 'Dr. Sharma'} 👋</h1>
            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminLayout({ user, logout, children }) {
  const navItems = ['Dashboard', 'Users', 'Courses', 'Competencies', 'Analytics', 'Announcements', 'Settings'];
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1700px] p-4 lg:p-6">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200 bg-[#0B2A5B] p-4 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-black">C</div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">CAPACITY</div>
              <div className="-mt-1 text-base font-bold text-white">CONNECT</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-white/20 p-2 text-white"><Bell size={18} /></button>
            <button onClick={logout} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">Logout</button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-[#0F172A] p-4 text-slate-100 shadow-sm">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const route = item === 'Dashboard' ? '/admin/dashboard' : item === 'Users' ? '/admin/users' : item === 'Courses' ? '/admin/courses' : item === 'Competencies' ? '/admin/competencies' : item === 'Analytics' ? '/admin/analytics' : '/admin/announcements';
                return (
                  <NavLink key={item} to={route} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                    {item === 'Dashboard' && <LayoutDashboard size={18} />}
                    {item === 'Users' && <Users size={18} />}
                    {item === 'Courses' && <BookOpenText size={18} />}
                    {item === 'Competencies' && <Target size={18} />}
                    {item === 'Analytics' && <TrendingUp size={18} />}
                    {item === 'Announcements' && <Bell size={18} />}
                    {item === 'Settings' && <Settings size={18} />}
                    {item}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
          <main className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Executive Command Center</div>
                <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">Organization Learning Intelligence</h1>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{user?.name || 'Admin'}</div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function TraineeDashboard({ courses, announcements }) {
  const course = courses[0];
  const statCards = [
    { label: 'Enrolled Courses', value: '06', icon: BookOpenText },
    { label: 'Completed', value: '03', icon: CheckCircle2 },
    { label: 'Learning Hours', value: '48h', icon: Activity },
    { label: 'Certificates', value: '02', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[28px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-6 text-white shadow-lg shadow-brand-600/15">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">Learning Readiness Score</div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-white/20 text-2xl font-black">78%</div>
                <div>
                  <p className="text-2xl font-black">You are 22% away from your next competency milestone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Upcoming Assessment</div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900">2 days</div>
              <div className="mt-1 text-sm text-slate-600">Assessment starts in 2 days</div>
            </div>
            <div className="rounded-full bg-brand-100 p-3 text-brand-700"><CalendarRange size={24} /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="rounded-2xl bg-white p-2 text-brand-700"><Icon size={18} /></div>
            </div>
            <div className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-900">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Continue Learning</div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{course.title}</h2>
            </div>
            <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{course.category}</div>
          </div>

          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div className="flex h-44 items-center justify-center rounded-[24px] bg-gradient-to-br from-brand-700 to-cyan-500 text-2xl font-black text-white shadow-lg shadow-brand-500/15">{course.thumbnail}</div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Trainer: {course.trainer}</span>
                <span>{course.progress}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${course.progress}%` }} />
              </div>
              <div className="mt-4 text-sm text-slate-600">Current module: <span className="font-semibold text-slate-900">Predictive Models</span></div>
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 font-semibold text-white shadow-md shadow-brand-500/20">
                Continue Learning <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Today&apos;s Updates</div>
          <div className="mt-4 space-y-4">
            {announcements.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TraineeCourses({ courses, onEnroll }) {
  const [category, setCategory] = useState('All');
  const visibleCourses = category === 'All' ? courses : courses.filter((course) => course.category === category);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search courses, skills or topics..." />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Technology', 'Data', 'Leadership', 'Meteorology', 'Research', 'Communication', 'Management'].map((name) => (
              <button key={name} onClick={() => setCategory(name)} className={`rounded-full px-3 py-2 text-sm font-semibold ${category === name ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-8">
        {['Recommended For You', 'Trending Courses', 'Continue Learning', 'Recently Added'].map((sectionTitle) => (
          <div key={sectionTitle}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">{sectionTitle}</h2>
              <button className="text-sm font-semibold text-brand-700">View all</button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCourses.slice(0, 3).map((course) => (
                <CourseCard key={`${sectionTitle}-${course.id}`} course={course} onEnroll={onEnroll} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningExperience({ courses, onComplete }) {
  const course = courses[0];
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[260px_1.4fr_0.9fr]">
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-brand-700">Course curriculum</div>
          {['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Assessment'].map((module, index) => (
            <div key={module} className={`mt-4 rounded-2xl p-3 ${index === 1 ? 'bg-white shadow-sm border border-slate-200' : 'bg-white/60'}`}>
              <div className="font-semibold text-slate-800">{module}</div>
              <div className="mt-1 text-xs text-slate-500">{index === 4 ? 'Final evaluation' : 'Lesson set'}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-hidden rounded-[24px] bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between text-sm text-white/80">
              <span>{course.title}</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-xs">Live</span>
            </div>
            <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 via-brand-500 to-cyan-500 text-5xl font-black text-white shadow-xl">
              <Video />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">{course.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{course.description}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {['Resources', 'Notes', 'Downloads'].map((label) => (
              <div key={label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700">{label}</div>
            ))}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">Previous</button>
            <button onClick={() => onComplete(course.id)} className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 font-semibold text-white shadow-md shadow-brand-500/20">Mark Complete</button>
            <button className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">Next</button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-brand-700">Your Progress</div>
            <div className="mt-4 text-4xl font-black text-slate-900">{course.progress}%</div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Completed modules: <span className="font-semibold text-slate-900">3/5</span></div>
              <div>Skill gained: <span className="font-semibold text-slate-900">Data Analysis</span></div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-brand-50 to-cyan-50 p-5">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-brand-700">AI Learning Assistant</div>
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="font-semibold text-slate-800">Ask Capacity AI</div>
              <div className="mt-3 text-sm text-slate-600">Learner: “Explain numerical weather prediction.”</div>
              <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-slate-700">AI: Numerical weather prediction uses mathematical models to simulate atmospheric behaviour over time. It combines observations and equations to forecast change.</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-brand-700">
              {['Explain this simply', 'Give me an example', 'Create practice questions', 'Summarize this lesson'].map((item) => (
                <button key={item} className="rounded-full border border-brand-200 bg-white px-2 py-1">{item}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentExperience() {
  const questions = [
    {
      question: 'Which statement best describes numerical weather prediction?',
      options: ['Uses historical data only', 'Simulates atmospheric processes through mathematical models', 'Tracks rainfall visually', 'Measures cloud cover manually'],
      answer: 1,
    },
    {
      question: 'What is the primary benefit of a competency gap analysis?',
      options: ['It removes the need for assessments', 'It identifies where training should be targeted', 'It guarantees promotion', 'It replaces the course curriculum'],
      answer: 1,
    },
    {
      question: 'Which tool is commonly used for geospatial weather analysis?',
      options: ['Word processor', 'GIS platform', 'Spreadsheet only', 'Email client'],
      answer: 1,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const current = questions[currentIndex];
  const answered = selected !== null;
  const score = 80;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Assessment</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Forecasting Fundamentals Check</h2>
          </div>
          <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">30 minutes · 20 questions · Passing 60%</div>
        </div>
      </div>

      {!submitted ? (
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Question navigator</div>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex h-10 items-center justify-center rounded-xl text-sm font-bold ${index === currentIndex ? 'bg-brand-700 text-white' : selected !== null ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-500'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <div>Answered: 2</div>
              <div>Unanswered: 1</div>
              <div>Marked for Review: 0</div>
            </div>
            <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Timer</div>
              <div className="mt-2 text-2xl font-black text-slate-900">22:14</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Question {currentIndex + 1}</div>
            <h3 className="text-2xl font-black tracking-[-0.04em] text-slate-900">{current.question}</h3>

            <div className="mt-6 space-y-3">
              {current.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-base transition ${selected === index ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Mark for Review</button>
              <button onClick={() => setSubmitted(true)} className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 text-sm font-semibold text-white">Submit Assessment</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[26px] bg-gradient-to-br from-brand-800 to-brand-600 p-6 text-white">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">Assessment Result</div>
              <div className="mt-5 text-5xl font-black">{score}%</div>
              <div className="mt-4 text-lg">Performance: Excellent</div>
              <div className="mt-4 text-sm text-cyan-100">Correct answers: 16 · Incorrect answers: 4 · Time taken: 24m 36s</div>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">{score}%</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Correct Answers</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">16</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Incorrect Answers</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">4</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Time Taken</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">24m 36s</div>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 text-sm font-semibold text-white">View Competency Gains <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetencyPage() {
  const data = [
    { subject: 'Data Analysis', current: 72, required: 90 },
    { subject: 'Technical Knowledge', current: 68, required: 82 },
    { subject: 'Communication', current: 80, required: 88 },
    { subject: 'Leadership', current: 74, required: 84 },
    { subject: 'Domain Expertise', current: 77, required: 90 },
    { subject: 'Problem Solving', current: 82, required: 90 },
  ];

  const chartData = data.map((item) => ({
    subject: item.subject,
    current: item.current,
    required: item.required,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Competency Profile</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Your Competency Profile</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData} outerRadius="70%">
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="Current" dataKey="current" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
              <Radar name="Required" dataKey="required" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.15} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.subject} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{item.subject}</div>
                  <div className="mt-2 text-sm text-slate-500">Current: <span className="font-semibold text-brand-700">{item.current}%</span> &nbsp; Required: <span className="font-semibold text-slate-900">{item.required}%</span></div>
                </div>
                <div className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Gap {Math.max(0, item.required - item.current)}%</div>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${item.current}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Recommended Course</span>
                <span className="font-semibold text-slate-900">Advanced Data Analytics</span>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white">Close This Skill Gap <ChevronRight size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Certificates</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Your verified achievements</h2>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          { course: 'Advanced Data Analytics', date: '12 Aug 2026', score: '88%', id: 'CC-AD-2026-014' },
          { course: 'GIS and Remote Sensing Essentials', date: '20 Sep 2026', score: '91%', id: 'CC-GIS-2026-028' },
        ].map((item) => (
          <div key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-[20px] border border-dashed border-brand-200 bg-brand-50 p-5 text-center">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Certificate</div>
              <div className="mt-3 text-2xl font-black text-slate-900">{item.course}</div>
              <div className="mt-1 text-sm text-slate-600">Completion Date: {item.date}</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">Score: {item.score}</div>
              <div className="mt-4 text-xs font-mono text-slate-600">ID: {item.id}</div>
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><Download size={16} /> View Certificate</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-cyan-500 text-2xl font-black text-white">{user?.name?.split(' ')[0][0] || 'R'}</div>
        <h3 className="mt-5 text-2xl font-black text-slate-900">{user?.name || 'Rahul Verma'}</h3>
        <div className="mt-2 text-sm text-slate-600">{user?.email || 'trainee@capacityconnect.in'}</div>
        <div className="mt-5 space-y-3 text-sm text-slate-700">
          <div className="flex justify-between"><span>Employee ID</span><span className="font-semibold">{user?.employeeId || 'IMD-2041'}</span></div>
          <div className="flex justify-between"><span>Department</span><span className="font-semibold">Meteorology</span></div>
          <div className="flex justify-between"><span>Role</span><span className="font-semibold capitalize">{user?.role || 'trainee'}</span></div>
        </div>
      </div>
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Professional Profile</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {['Current role focus', 'Latest certification', 'Assessment readiness', 'Domain expertise'].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item}</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{item === 'Current role focus' ? 'Weather Analytics' : item === 'Latest certification' ? 'Forecasting Fundamentals' : item === 'Assessment readiness' ? 'High' : 'Advanced'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainerDashboard({ courses }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Courses', value: '04', change: '+2 this quarter' },
          { label: 'Total Learners', value: '1.2K', change: '+18% growth' },
          { label: 'Average Completion', value: '81%', change: '+7% vs target' },
          { label: 'Average Score', value: '88%', change: '+5% improvement' },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-4 text-3xl font-black text-slate-900">{item.value}</div>
            <div className="mt-2 text-xs font-semibold text-brand-700">{item.change}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Learner Progress</div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', learners: 50 },
                { name: 'Feb', learners: 65 },
                { name: 'Mar', learners: 72 },
                { name: 'Apr', learners: 80 },
                { name: 'May', learners: 82 },
              ]}>
                <defs>
                  <linearGradient id="trainerArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="learners" stroke="#2563EB" fill="url(#trainerArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Recent Learner Activity</div>
          <div className="mt-5 space-y-3">
            {['Aditi completed Module 4', 'Ritesh passed the forecasting quiz', 'Nisha submitted research notes', 'Arun requested a feedback review'].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerCoursesPage({ courses }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">My Courses</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Course portfolio</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Create New Course</button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-slate-900">{course.title}</div>
              <div className="rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase text-brand-700">{course.status}</div>
            </div>
            <div className="mt-3 text-sm text-slate-600">{course.category} · {course.duration}</div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${course.progress}%` }} />
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200">Open course <ChevronRight size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceLibrary({ resources }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Resource Library</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Uploaded content</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Add Resource</button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-28 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-50 to-cyan-50 text-brand-700"><FileText size={28} /></div>
            <div className="mt-4 text-lg font-bold text-slate-900">{resource.title}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{resource.type}</span><span>{resource.size}</span></div>
            <div className="mt-4 text-xs text-slate-500">{resource.course}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssessmentBuilder() {
  return (
    <div className="space-y-6">
      <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Assessment Builder</div>
      <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900">Create a premium assessment experience</h2>
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Assessment Title</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Forecasting Fundamentals Check" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Course</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" defaultValue="Advanced Data Analytics" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Duration</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" defaultValue="30 minutes" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Passing Percentage</label>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" defaultValue="60%" />
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-dashed border-brand-200 bg-white p-5">
          <div className="mb-4 text-lg font-bold text-slate-900">Question 1</div>
          <textarea className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" rows={3} defaultValue="Which statement best describes numerical weather prediction?" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Uses historical data only', 'Simulates atmospheric processes through mathematical models', 'Tracks rainfall visually', 'Measures cloud cover manually'].map((option, index) => (
              <div key={option} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{String.fromCharCode(65 + index)}. {option}</div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Add Question</button>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Preview</button>
          <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Save Draft</button>
          <button className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white">Publish</button>
        </div>
      </div>
    </div>
  );
}

function TrainerPerformance() {
  const table = [
    { name: 'Rahul Verma', id: 'IMD-2041', course: 'Advanced Data Analytics', progress: '78%', score: '88%', activity: '2 hours ago', status: 'On track' },
    { name: 'Priya Nair', id: 'IMD-2207', course: 'GIS & Remote Sensing', progress: '64%', score: '81%', activity: 'Yesterday', status: 'Need review' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: 'Total Trainees', value: '182' },
          { label: 'Active Learners', value: '138' },
          { label: 'Average Score', value: '86%' },
          { label: 'Completion Rate', value: '79%' },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-4 text-3xl font-black text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-brand-700">Trainee Performance</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="pb-3 pr-4 font-semibold">Name</th>
                <th className="pb-3 pr-4 font-semibold">Employee ID</th>
                <th className="pb-3 pr-4 font-semibold">Course</th>
                <th className="pb-3 pr-4 font-semibold">Progress</th>
                <th className="pb-3 pr-4 font-semibold">Assessment Score</th>
                <th className="pb-3 pr-4 font-semibold">Last Activity</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.id}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.course}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.progress}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.score}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.activity}</td>
                  <td className="py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ users, courses, announcements }) {
  const userDistribution = [
    { name: 'Trainees', value: 72 },
    { name: 'Trainers', value: 18 },
    { name: 'Admins', value: 10 },
  ];

  const courseSeries = [
    { name: 'Jan', enrollments: 50 },
    { name: 'Feb', enrollments: 70 },
    { name: 'Mar', enrollments: 80 },
    { name: 'Apr', enrollments: 92 },
    { name: 'May', enrollments: 105 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Users', value: '1,248' },
          { label: 'Trainees', value: '902' },
          { label: 'Trainers', value: '186' },
          { label: 'Active Courses', value: '24' },
          { label: 'Enrollments', value: '4,120' },
          { label: 'Certificates', value: '1,860' },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
            <div className="mt-3 text-2xl font-black text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Course Enrollment</div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseSeries}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#2563EB" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">User Distribution</div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userDistribution} innerRadius={60} outerRadius={84} paddingAngle={4} dataKey="value" nameKey="name">
                  {userDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={['#2563EB', '#14B8A6', '#F4B942'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Pending Approvals</div>
          <div className="mt-4 space-y-3">
            {courses.filter((course) => course.status === 'pending').map((course) => (
              <div key={course.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{course.title}</div>
                <div className="mt-1">Trainer: {course.trainer}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Announcements</div>
          <div className="mt-4 space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsers({ users, approveTrainer }) {
  const tabs = ['All', 'Trainees', 'Trainers', 'Admins', 'Pending'];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">User Management</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Organization users</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Add User</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">{tab}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Employee ID</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.employeeId}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">{user.role}</td>
                <td className="px-4 py-3 text-slate-600">{user.department}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{user.status}</span>
                </td>
                <td className="px-4 py-3">
                  {user.role === 'trainer' && user.status !== 'active' ? (
                    <button onClick={() => approveTrainer(user.id)} className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white">Approve</button>
                  ) : (
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCourses({ courses, approveCourse }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Course Approval</div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">Review and approve learning programs</h2>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {['Pending Courses', 'Approved Courses', 'Rejected Courses'].map((status) => (
          <div key={status} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{status}</div>
            <div className="mt-4 space-y-3">
              {courses.filter((course) => status.includes('Pending') ? course.status === 'pending' : status.includes('Approved') ? course.status === 'approved' : course.status === 'rejected').map((course) => (
                <div key={course.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{course.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{course.trainer}</div>
                  <div className="mt-3 flex gap-2">
                    {status.includes('Pending') && (
                      <button onClick={() => approveCourse(course.id)} className="rounded-lg bg-brand-700 px-2 py-1 text-[10px] font-semibold text-white">Approve</button>
                    )}
                    <button className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700">Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const data = [
    { name: 'Jan', learners: 120, completion: 58 },
    { name: 'Feb', learners: 140, completion: 63 },
    { name: 'Mar', learners: 170, completion: 72 },
    { name: 'Apr', learners: 200, completion: 76 },
    { name: 'May', learners: 220, completion: 81 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: 'Total Learners', value: '2,420' },
          { label: 'Learning Hours', value: '18.6K' },
          { label: 'Completion Rate', value: '82%' },
          { label: 'Avg Assessment Score', value: '86%' },
          { label: 'Certificates', value: '1,280' },
          { label: 'Course Participation', value: '91%' },
        ].map((item) => (
          <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
            <div className="mt-3 text-2xl font-black text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Monthly Enrollment & Completion</div>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="learners" fill="#2563EB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completion" fill="#14B8A6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AnnouncementsPage({ addAnnouncement, announcements }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Announcement', priority: 'Medium', date: '2026-10-05', published: true });

  const handleSubmit = (event) => {
    event.preventDefault();
    addAnnouncement({
      id: `a-${Date.now()}`,
      ...form,
      published: true,
    });
    setForm({ title: '', description: '', category: 'Announcement', priority: 'Medium', date: '2026-10-05', published: true });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Create Announcement</div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Announcement</option>
                  <option>Learning Update</option>
                  <option>Achievement</option>
                  <option>Notification</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white">Publish Announcement</button>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Published updates</div>
          <div className="mt-5 space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold uppercase text-brand-700">{item.priority}</div>
                </div>
                <div className="mt-2 text-xs text-slate-500">{item.category} · {item.date}</div>
                <div className="mt-2 text-sm text-slate-600">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, compact = false, onEnroll }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm ${compact ? '' : 'h-full'}`}>
      <div className="flex h-40 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-700 via-brand-500 to-cyan-500 text-2xl font-black text-white shadow-lg shadow-brand-500/20">{course.thumbnail}</div>
      <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
        <span>{course.category}</span>
        <span>{course.difficulty}</span>
      </div>
      <h3 className="mt-3 text-xl font-bold text-slate-900">{course.title}</h3>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span>Trainer: {course.trainer}</span>
        <span className="inline-flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /> {course.rating}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>{course.duration}</span>
        <span>{course.learners} learners</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-400" style={{ width: `${course.progress}%` }} />
      </div>
      <button onClick={() => onEnroll && onEnroll(course.id)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 text-sm font-semibold text-white">
        {onEnroll ? 'Enroll Now' : 'Continue'} <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}

export default App;
